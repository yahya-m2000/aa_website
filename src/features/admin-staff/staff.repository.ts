import { getGraphClient, GraphConflictError, GraphRequestError } from '@/core/graph/graph.client';
import { graphEnv } from '@/core/graph/env';
import { hashPassword, verifyPassword } from '@/core/admin-auth/passwords';

export type StaffRole = 'warehouse';
export interface StaffAccount {
  id: string;
  etag: string;
  username: string;
  displayName: string;
  role: StaffRole;
  passwordHash: string;
  active: boolean;
  mustChangePassword: boolean;
  failedAttempts: number;
  lockedUntil?: string;
  sessionVersion: number;
  lastSignInAt?: string;
  passwordChangedAt?: string;
}
export type StaffAccountSummary = Omit<StaffAccount, 'passwordHash' | 'etag' | 'id'> & { locked: boolean };

export const MAX_FAILED_ATTEMPTS = 5;
export const LOCKOUT_MINUTES = 15;
const LIVE_CACHE_MS = 60_000;
const USERNAME_PATTERN = /^[a-z0-9][a-z0-9._-]{2,31}$/;

export type StaffErrorCode =
  | 'not-configured'
  | 'duplicate'
  | 'not-found'
  | 'invalid-username'
  | 'taken'
  | 'wrong-password'
  | 'same-password';
export class StaffAccountError extends Error {
  constructor(message: string, readonly code: StaffErrorCode) {
    super(message);
    this.name = 'StaffAccountError';
  }
}

export function staffListConfigured(): boolean {
  return Boolean(process.env.ADMIN_GRAPH_STAFF_LIST_ID);
}
export function normalizeUsername(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}
export function usernameProblem(username: string): string | null {
  return USERNAME_PATTERN.test(username)
    ? null
    : 'Use 3–32 characters: lowercase letters, numbers, dots, dashes or underscores.';
}

function base(): string {
  if (!process.env.ADMIN_GRAPH_STAFF_LIST_ID) throw new StaffAccountError('Staff accounts are not configured.', 'not-configured');
  return `/sites/${graphEnv.siteId}/lists/${process.env.ADMIN_GRAPH_STAFF_LIST_ID}/items`;
}

type StaffFields = Record<string, string | number | boolean | null | undefined>;
function decode(item: { id: string; '@odata.etag': string; fields: StaffFields }): StaffAccount {
  const f = item.fields;
  return {
    id: item.id,
    etag: item['@odata.etag'],
    username: String(f.Username ?? ''),
    displayName: String(f.StaffName || f.Username || ''),
    role: 'warehouse',
    passwordHash: String(f.PasswordHash ?? ''),
    active: f.Active === true,
    mustChangePassword: f.MustChangePassword !== false,
    failedAttempts: Number(f.FailedAttempts ?? 0) || 0,
    lockedUntil: typeof f.LockedUntil === 'string' ? f.LockedUntil : undefined,
    sessionVersion: Number(f.SessionVersion ?? 1) || 1,
    lastSignInAt: typeof f.LastSignInAt === 'string' ? f.LastSignInAt : undefined,
    passwordChangedAt: typeof f.PasswordChangedAt === 'string' ? f.PasswordChangedAt : undefined,
  };
}
// Everything the admin Staff page needs. The password hash never leaves the server.
export function summarize(account: StaffAccount, now = Date.now()): StaffAccountSummary {
  return {
    username: account.username,
    displayName: account.displayName,
    role: account.role,
    active: account.active,
    mustChangePassword: account.mustChangePassword,
    failedAttempts: account.failedAttempts,
    lockedUntil: account.lockedUntil,
    sessionVersion: account.sessionVersion,
    lastSignInAt: account.lastSignInAt,
    passwordChangedAt: account.passwordChangedAt,
    locked: isLocked(account, now),
  };
}

const liveCache = new Map<string, { at: number; account: StaffAccount | null }>();
function remember(username: string, account: StaffAccount | null) {
  liveCache.set(username, { at: Date.now(), account });
}

export async function findStaffAccount(username: string): Promise<StaffAccount | null> {
  const normalized = normalizeUsername(username);
  if (!normalized) return null;
  try {
    const page = await getGraphClient()
      .api(base())
      .expand('fields')
      .filter(`fields/Username eq '${normalized.replace(/'/g, "''")}'`)
      .get();
    const items = (page.value ?? []) as Array<{ id: string; '@odata.etag': string; fields: StaffFields }>;
    if (items.length > 1) throw new StaffAccountError('Duplicate staff username.', 'duplicate');
    const account = items[0] ? decode(items[0]) : null;
    remember(normalized, account);
    return account;
  } catch (error) {
    if (error instanceof StaffAccountError) throw error;
    throw new GraphRequestError('Failed to read staff account', undefined, error);
  }
}

// Used on every worker request. A disabled account or reset password takes effect within a minute.
export async function getLiveStaffAccount(username: string): Promise<StaffAccount | null> {
  const normalized = normalizeUsername(username);
  const cached = liveCache.get(normalized);
  if (cached && Date.now() - cached.at < LIVE_CACHE_MS) return cached.account;
  return findStaffAccount(normalized);
}

export async function listStaffAccounts(): Promise<StaffAccount[]> {
  const accounts: StaffAccount[] = [];
  let next: string | undefined = base();
  while (next) {
    const page: { value?: Array<{ id: string; '@odata.etag': string; fields: StaffFields }>; '@odata.nextLink'?: string } =
      await getGraphClient().api(next).expand('fields').top(200).get();
    accounts.push(...(page.value ?? []).map(decode));
    next = page['@odata.nextLink'];
  }
  return accounts.sort((a, b) => a.username.localeCompare(b.username));
}

async function patch(account: StaffAccount, fields: StaffFields): Promise<void> {
  try {
    await getGraphClient().api(`${base()}/${account.id}/fields`).header('If-Match', account.etag).patch(fields);
  } catch (error) {
    if ((error as { statusCode?: number })?.statusCode === 412)
      throw new GraphConflictError('Staff account changed. Refresh and try again.', error);
    throw new GraphRequestError('Failed to update staff account', undefined, error);
  } finally {
    liveCache.delete(account.username);
  }
}

async function requireAccount(username: string): Promise<StaffAccount> {
  const account = await findStaffAccount(username);
  if (!account) throw new StaffAccountError('Staff account not found.', 'not-found');
  return account;
}

export async function createStaffAccount(input: { username: string; displayName: string; password: string }) {
  const username = normalizeUsername(input.username);
  const problem = usernameProblem(username);
  if (problem) throw new StaffAccountError(problem, 'invalid-username');
  if (await findStaffAccount(username)) throw new StaffAccountError('That username is already taken.', 'taken');
  try {
    await getGraphClient().api(base()).post({
      fields: {
        Title: username,
        Username: username,
        StaffName: input.displayName.trim().slice(0, 100),
        Role: 'warehouse',
        PasswordHash: await hashPassword(input.password),
        Active: true,
        MustChangePassword: true,
        FailedAttempts: 0,
        SessionVersion: 1,
      },
    });
  } catch (error) {
    // The Username column enforces uniqueness, so a lost response or a race lands here too.
    if (await findStaffAccount(username)) throw new StaffAccountError('That username is already taken.', 'taken');
    throw new GraphRequestError('Failed to create staff account', undefined, error);
  } finally {
    liveCache.delete(username);
  }
}

export type SignInResult =
  | { ok: true; account: StaffAccount }
  | { ok: false; reason: 'invalid' | 'locked' };

export function isLocked(account: Pick<StaffAccount, 'lockedUntil'>, now = Date.now()): boolean {
  return Boolean(account.lockedUntil && Date.parse(account.lockedUntil) > now);
}

export async function authenticateStaff(username: string, password: string): Promise<SignInResult> {
  const account = await findStaffAccount(username).catch(() => null);
  if (!account || !account.active) {
    await verifyPassword(password, undefined);
    return { ok: false, reason: 'invalid' };
  }
  if (isLocked(account)) return { ok: false, reason: 'locked' };
  if (!(await verifyPassword(password, account.passwordHash))) {
    const attempts = account.failedAttempts + 1;
    const lock = attempts >= MAX_FAILED_ATTEMPTS;
    await patch(account, {
      FailedAttempts: lock ? 0 : attempts,
      ...(lock ? { LockedUntil: new Date(Date.now() + LOCKOUT_MINUTES * 60_000).toISOString() } : {}),
    }).catch(() => undefined);
    return { ok: false, reason: lock ? 'locked' : 'invalid' };
  }
  await patch(account, { FailedAttempts: 0, LockedUntil: null, LastSignInAt: new Date().toISOString() }).catch(() => undefined);
  return { ok: true, account };
}

export async function changeOwnPassword(username: string, currentPassword: string, newPassword: string) {
  const account = await requireAccount(username);
  if (!account.active || !(await verifyPassword(currentPassword, account.passwordHash)))
    throw new StaffAccountError('Current password is incorrect.', 'wrong-password');
  if (await verifyPassword(newPassword, account.passwordHash))
    throw new StaffAccountError('Choose a password different from the current one.', 'same-password');
  await patch(account, {
    PasswordHash: await hashPassword(newPassword),
    MustChangePassword: false,
    PasswordChangedAt: new Date().toISOString(),
    SessionVersion: account.sessionVersion + 1,
  });
}

// Admin actions. Every one of these that affects access bumps SessionVersion, which signs the
// worker out on every device the next time the portal checks (within a minute).
export async function resetStaffPassword(username: string, password: string) {
  const account = await requireAccount(username);
  await patch(account, {
    PasswordHash: await hashPassword(password),
    MustChangePassword: true,
    FailedAttempts: 0,
    LockedUntil: null,
    PasswordChangedAt: new Date().toISOString(),
    SessionVersion: account.sessionVersion + 1,
  });
}
export async function setStaffActive(username: string, active: boolean) {
  const account = await requireAccount(username);
  await patch(account, { Active: active, SessionVersion: account.sessionVersion + 1, ...(active ? { FailedAttempts: 0, LockedUntil: null } : {}) });
}
export async function unlockStaffAccount(username: string) {
  const account = await requireAccount(username);
  await patch(account, { FailedAttempts: 0, LockedUntil: null });
}
export async function renameStaffAccount(username: string, displayName: string) {
  const account = await requireAccount(username);
  await patch(account, { StaffName: displayName.trim().slice(0, 100) });
}
