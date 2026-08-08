// No-op when SENTRY_DSN is unset — see sentry.client.config.ts.
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0,
});
