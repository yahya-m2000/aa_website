import type { NextRequest } from 'next/server';
import type { Session } from 'next-auth';
import { NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { resolveAdminPath } from '@/core/admin-auth/access';
import { edgeAuth } from '@/core/admin-auth/edge-auth';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

// Single default-export middleware branches on path rather than composing two separate
// middleware functions (Next.js only supports one middleware file/export per project). Admin
// routes get the Auth.js session gate plus role routing; everything else falls through to
// next-intl's locale routing, completely untouched from its pre-admin behavior.
export default edgeAuth((req: NextRequest & { auth: Session | null }) => {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/admin')) {
    const session = req.auth?.user ? req.auth : null;
    const { redirect } = resolveAdminPath(
      session ? { role: session.role, mustChangePassword: session.mustChangePassword } : null,
      pathname,
    );
    if (redirect) return NextResponse.redirect(new URL(redirect, req.nextUrl.origin));
    return NextResponse.next();
  }

  return intlMiddleware(req);
});

export const config = {
  matcher: ['/', '/(en|so)/:path*', '/((?!api|admin|_next|_vercel|.*\\..*).*)', '/admin/:path*']
};
