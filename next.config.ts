import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
import { withSentryConfig } from '@sentry/nextjs';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  // lucide-react in particular re-exports every icon from one barrel file —
  // without this, importing a handful of icons can still pull the whole
  // package into the dev/build module graph. gsap/framer-motion also ship
  // sub-path-splittable exports; this lets Next's compiler rewrite imports
  // from all three to only the specific modules actually used, trimming
  // bundle size and parse cost without any source-code changes.
  experimental: {
    optimizePackageImports: ['lucide-react', 'gsap', 'framer-motion'],
  },
};

// withSentryConfig only adds source-map upload / release tracking at build time — it does not
// itself require SENTRY_DSN to be set (that's read by sentry.*.config.ts's Sentry.init() calls
// above, independently, and no-ops when unset). Safe to wrap unconditionally.
export default withSentryConfig(withNextIntl(nextConfig), {
  silent: true,
  disableLogger: true,
});
