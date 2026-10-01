import type { NextRequest } from 'next/server';
import type { Session } from 'next-auth';
import { NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { resolveAdminPath } from '@/core/admin-auth/access';
import { edgeAuth } from '@/core/admin-auth/edge-auth';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

const SHOP_HOST = 'shop.aatradesolutions.com';

// Single default-export middleware branches on path rather than composing two separate
// middleware functions (Next.js only supports one middleware file/export per project). Admin
// routes get the Auth.js session gate plus role routing; everything else falls through to
// next-intl's locale routing, completely untouched from its pre-admin behavior.
export default edgeAuth((req: NextRequest & { auth: Session | null }) => {
  const { pathname } = req.nextUrl;

  // shop.aatradesolutions.com only serves product share pages (src/app/p). Anything else on that
  // host goes to the main site rather than serving the site/admin under a second hostname.
  // assetlinks.json and preview.jpg have file extensions, so the matcher never sends them here.
  if (req.headers.get('host')?.split(':')[0] === SHOP_HOST && !pathname.startsWith('/p/')) {
    return NextResponse.redirect('https://www.aatradesolutions.com/en/download');
  }

  // Share pages are English-only and live outside [locale]; next-intl would redirect them to /en/p/.
  if (pathname.startsWith('/p/')) {
    return NextResponse.next();
  }

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
