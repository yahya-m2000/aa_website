// No-op when NEXT_PUBLIC_SENTRY_DSN is unset — same graceful-degradation convention used for
// every other optional integration across this project (WhatsApp, push notifications, the
// server's own Sentry setup).
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0,
});
