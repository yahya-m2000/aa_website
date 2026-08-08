import { auth } from './auth';
import type { Session } from 'next-auth';

export class UnauthorizedError extends Error {
  constructor(message = 'Not signed in') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

/**
 * Server-side session guard used by every admin page and every /api/admin/** route. This is
 * deliberately called independently in API routes even though middleware.ts also gates
 * /admin/** — API routes are directly reachable and must not assume a request necessarily came
 * through a middleware-protected page navigation (e.g. a stale cached page re-submitting a
 * form, or someone hitting the route directly).
 */
export async function requireAdminSession(): Promise<Session> {
  const session = await auth();
  if (!session?.user) {
    throw new UnauthorizedError();
  }
  return session;
}
