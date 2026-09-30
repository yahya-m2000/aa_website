import { redirect } from 'next/navigation';
import type { Session } from 'next-auth';
import { actorFromSession, type Actor } from '@/features/admin-orders/audit';
import { getLiveStaffAccount, type StaffAccount } from '@/features/admin-staff/staff.repository';
import { CHANGE_PASSWORD_PATH, type PortalRole } from './access';
import { auth } from './auth';

export class UnauthorizedError extends Error {
  constructor(message = 'Not signed in') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  constructor(message = 'You do not have access to this action.') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

/**
 * Server-side guard for every admin-only page action and /api/admin/** route. Warehouse staff
 * accounts are rejected here, so payment, procurement and status actions stay Microsoft-only
 * even if someone calls the API directly. /api/** is outside the middleware matcher, so this
 * check is the only protection those routes have.
 */
export async function requireAdminSession(): Promise<Session> {
  const session = await auth();
  if (!session?.user) {
    throw new UnauthorizedError();
  }
  if (session.role !== 'admin') {
    throw new ForbiddenError();
  }
  return session;
}

export interface StaffContext {
  session: Session;
  role: PortalRole;
  actor: Actor;
  account: StaffAccount | null;
}

// A warehouse session is only valid while its account is active and no admin has reset the
// password or disabled it since sign-in (both bump SessionVersion).
async function liveWarehouseAccount(session: Session): Promise<StaffAccount | null> {
  if (!session.username) return null;
  const account = await getLiveStaffAccount(session.username);
  if (!account?.active || account.sessionVersion !== session.sessionVersion) return null;
  return account;
}

function warehouseActor(session: Session, account: StaffAccount): Actor {
  return { name: session.user?.name || `${account.displayName} (${account.username})`, source: 'Warehouse' };
}

/** API guard for warehouse actions: admins and active warehouse staff. */
export async function requireStaffSession(): Promise<StaffContext> {
  const session = await auth();
  if (!session?.user || !session.role) throw new UnauthorizedError();
  if (session.role === 'admin') return { session, role: 'admin', actor: actorFromSession(session), account: null };
  const account = await liveWarehouseAccount(session);
  if (!account) throw new UnauthorizedError('Your sign-in has ended. Please sign in again.');
  if (account.mustChangePassword) throw new ForbiddenError('Change your password before continuing.');
  return { session, role: 'warehouse', actor: warehouseActor(session, account), account };
}

/** Page guard for /admin/warehouse/**. Redirects instead of throwing. */
export async function requireWarehousePage(options: { allowPasswordChange?: boolean } = {}): Promise<StaffContext> {
  const session = await auth();
  if (!session?.user || !session.role) redirect('/admin/login');
  if (session.role === 'admin') return { session, role: 'admin', actor: actorFromSession(session), account: null };
  const account = await liveWarehouseAccount(session);
  if (!account) redirect('/api/admin/auth/signed-out?reason=ended');
  if (account.mustChangePassword && !options.allowPasswordChange) redirect(CHANGE_PASSWORD_PATH);
  return { session, role: 'warehouse', actor: warehouseActor(session, account), account };
}
