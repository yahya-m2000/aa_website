// No-op when SENTRY_DSN is unset — see sentry.client.config.ts. Covers the middleware.ts
// admin-auth gate, which runs on the Edge runtime, not the Node server runtime.
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0,
});
