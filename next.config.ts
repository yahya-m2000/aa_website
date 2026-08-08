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
};

// withSentryConfig only adds source-map upload / release tracking at build time — it does not
// itself require SENTRY_DSN to be set (that's read by sentry.*.config.ts's Sentry.init() calls
// above, independently, and no-ops when unset). Safe to wrap unconditionally.
export default withSentryConfig(withNextIntl(nextConfig), {
  silent: true,
  disableLogger: true,
});
