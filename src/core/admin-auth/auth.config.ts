import type { NextAuthConfig } from 'next-auth';
import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id';

const tenantId = process.env.ADMIN_AUTH_ENTRA_TENANT_ID;

if (!tenantId) {
  // Fails loudly at module-load time rather than letting sign-in silently fall back to a
  // multi-tenant "common" issuer, which would defeat the whole point of tenant restriction.
  throw new Error('ADMIN_AUTH_ENTRA_TENANT_ID is not set — required to scope sign-in to the A&A tenant.');
}

export const authConfig: NextAuthConfig = {
  providers: [
    MicrosoftEntraID({
      clientId: process.env.ADMIN_AUTH_ENTRA_CLIENT_ID,
      clientSecret: process.env.ADMIN_AUTH_ENTRA_CLIENT_SECRET,
      // Tenant-specific issuer (not "common"/"organizations") — this is what makes Entra ID
      // itself reject sign-in attempts from personal Microsoft accounts or other tenants at
      // the identity-provider level, before any of our own code runs. Layer 1 of the two-layer
      // tenant restriction (layer 2 is the signIn callback below).
      issuer: `https://login.microsoftonline.com/${tenantId}/v2.0`,
    }),
  ],
  session: {
    // No database exists anywhere in this project — JWT sessions avoid needing one solely for
    // session storage, which would be disproportionate infrastructure for an internal tool.
    strategy: 'jwt',
    // Forces re-auth roughly once per shift rather than relying on server-side session
    // revocation (which JWT sessions don't support).
    maxAge: 8 * 60 * 60,
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  callbacks: {
    // Defense-in-depth (layer 2) — see auth.config.ts module doc above for layer 1. Even with
    // a single-tenant app registration and tenant-scoped issuer, this guards against future
    // Entra misconfiguration (e.g. someone widening the app registration's supported account
    // types later without updating this code) and gives a clear, auditable rejection point in
    // application logs distinct from Entra's own sign-in logs.
    async signIn({ profile }) {
      const profileTenantId = (profile as { tid?: string } | undefined)?.tid;
      if (!profileTenantId || profileTenantId !== tenantId) {
        console.error(
          `[admin-auth] Rejected sign-in: profile tenant "${profileTenantId ?? 'unknown'}" does not match ` +
            `required tenant "${tenantId}".`,
        );
        return false;
      }
      return true;
    },
    async jwt({ token, profile }) {
      if (profile) {
        token.tenantId = (profile as { tid?: string }).tid;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.tenantId) {
        session.tenantId = token.tenantId as string;
      }
      return session;
    },
  },
};
