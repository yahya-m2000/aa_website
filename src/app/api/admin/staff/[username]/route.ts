import { NextResponse } from 'next/server';
import { z } from 'zod';
import { passwordProblem } from '@/core/admin-auth/passwords';
import { requireAdminSession } from '@/core/admin-auth/session';
import { toErrorResponse } from '@/core/utils/http-error';
import {
  normalizeUsername,
  renameStaffAccount,
  resetStaffPassword,
  setStaffActive,
  StaffAccountError,
  unlockStaffAccount,
} from '@/features/admin-staff/staff.repository';

const schema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('reset'), password: z.string().max(200) }),
  z.object({ action: z.literal('disable') }),
  z.object({ action: z.literal('enable') }),
  z.object({ action: z.literal('unlock') }),
  z.object({ action: z.literal('rename'), displayName: z.string().trim().min(1).max(100) }),
]);

export async function PATCH(request: Request, { params }: { params: Promise<{ username: string }> }) {
  try {
    const session = await requireAdminSession();
    const username = normalizeUsername(decodeURIComponent((await params).username));
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: { message: 'Invalid request.' } }, { status: 400 });
    const input = parsed.data;
    if (input.action === 'reset') {
      const problem = passwordProblem(input.password, username);
      if (problem) return NextResponse.json({ error: { message: problem } }, { status: 400 });
      await resetStaffPassword(username, input.password);
    } else if (input.action === 'disable' || input.action === 'enable') {
      await setStaffActive(username, input.action === 'enable');
    } else if (input.action === 'unlock') {
      await unlockStaffAccount(username);
    } else {
      await renameStaffAccount(username, input.displayName);
    }
    console.log(`[admin-staff] ${session.user?.email ?? 'unknown'} ran ${input.action} on warehouse account ${username}`);
    return NextResponse.json({ data: { username } });
  } catch (error) {
    if (error instanceof StaffAccountError)
      return NextResponse.json({ error: { message: error.message } }, { status: error.code === 'not-found' ? 404 : 400 });
    return toErrorResponse(error);
  }
}
