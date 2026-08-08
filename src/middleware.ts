import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { auth } from '@/core/admin-auth/auth';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

// /admin/login and /admin/unauthorized must stay reachable without a session, or a signed-out
// user could never reach the page that lets them sign in.
const PUBLIC_ADMIN_PATHS = ['/admin/login', '/admin/unauthorized'];

function isPublicAdminPath(pathname: string): boolean {
  return PUBLIC_ADMIN_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

// Single default-export middleware branches on path rather than composing two separate
// middleware functions (Next.js only supports one middleware file/export per project). Admin
// routes get the Auth.js session gate; everything else falls through to next-intl's locale
// routing, completely untouched from its pre-admin behavior.
export default auth((req: NextRequest & { auth: unknown }) => {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/admin')) {
    if (isPublicAdminPath(pathname)) {
      return NextResponse.next();
    }
    if (!req.auth) {
      const loginUrl = new URL('/admin/login', req.nextUrl.origin);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  return intlMiddleware(req);
});

export const config = {
  matcher: ['/', '/(en|so)/:path*', '/((?!api|admin|_next|_vercel|.*\\..*).*)', '/admin/:path*']
};
