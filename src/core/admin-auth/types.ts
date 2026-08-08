import type { DefaultSession } from 'next-auth';

// Module augmentation so `session.tenantId` (set in auth.config.ts's session callback) is
// typed everywhere `auth()`/`useSession()` are called, instead of requiring an `as` cast at
// every call site.
declare module 'next-auth' {
  interface Session {
    tenantId?: string;
    user?: DefaultSession['user'];
  }
}

// Augmenting '@auth/core/jwt' directly (not the 'next-auth/jwt' re-export) — TS's `bundler`
// module resolution had trouble resolving the subpath-exports augmentation target via
// 'next-auth/jwt' in this next-auth version; '@auth/core/jwt' is what it actually re-exports
// from (confirmed via next-auth/jwt.d.ts: `export * from "@auth/core/jwt"`), so augmenting the
// real source module works identically.
declare module '@auth/core/jwt' {
  interface JWT {
    tenantId?: string;
  }
}
