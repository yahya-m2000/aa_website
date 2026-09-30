import { signOut } from '@/core/admin-auth/auth';

// Server components can't clear cookies, so pages that discover an ended warehouse session
// redirect here to remove the cookie before showing the login page again.
export async function GET(request: Request) {
  const reason = new URL(request.url).searchParams.get('reason') === 'ended' ? 'ended' : 'invalid';
  await signOut({ redirectTo: `/admin/login?error=${reason}#warehouse` });
}
