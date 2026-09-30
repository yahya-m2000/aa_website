import { NextResponse } from 'next/server';
import { z } from 'zod';
import { passwordProblem } from '@/core/admin-auth/passwords';
import { requireAdminSession } from '@/core/admin-auth/session';
import { toErrorResponse } from '@/core/utils/http-error';
import {
  createStaffAccount,
  listStaffAccounts,
  normalizeUsername,
  StaffAccountError,
  summarize,
  usernameProblem,
} from '@/features/admin-staff/staff.repository';

const createSchema = z.object({
  username: z.string().max(64),
  displayName: z.string().trim().min(1).max(100),
  password: z.string().max(200),
});

export async function GET() {
  try {
    await requireAdminSession();
    return NextResponse.json({ data: (await listStaffAccounts()).map((account) => summarize(account)) });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAdminSession();
    const parsed = createSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: { message: 'Enter a username, name and password.' } }, { status: 400 });
    const username = normalizeUsername(parsed.data.username);
    const problem = usernameProblem(username) ?? passwordProblem(parsed.data.password, username);
    if (problem) return NextResponse.json({ error: { message: problem } }, { status: 400 });
    await createStaffAccount({ username, displayName: parsed.data.displayName, password: parsed.data.password });
    console.log(`[admin-staff] ${session.user?.email ?? 'unknown'} created warehouse account ${username}`);
    return NextResponse.json({ data: { username } }, { status: 201 });
  } catch (error) {
    if (error instanceof StaffAccountError)
      return NextResponse.json({ error: { message: error.message } }, { status: error.code === 'taken' ? 409 : 400 });
    return toErrorResponse(error);
  }
}
