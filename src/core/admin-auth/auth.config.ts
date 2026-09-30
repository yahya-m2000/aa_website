import type { NextAuthConfig } from 'next-auth';
import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id';

const tenantId = process.env.ADMIN_AUTH_ENTRA_TENANT_ID;

if (!tenantId) {
  // Fails loudly at module-load time rather than letting sign-in silently fall back to a
  // multi-tenant "common" issuer, which would defeat the whole point of tenant restriction.
  throw new Error('ADMIN_AUTH_ENTRA_TENANT_ID is not set — required to scope sign-in to the A&A tenant.');
}

export const WAREHOUSE_PROVIDER_ID = 'warehouse';
// Microsoft admins keep the previous behaviour: signed out after 8 hours without activity.
const ADMIN_IDLE_MS = 8 * 60 * 60 * 1000;
// Warehouse logins renew on every visit. Browsers cap cookie lifetime at about 400 days, so this
// is effectively "never signs out" while the account stays active; admins revoke it instead.
const SESSION_MAX_AGE_SECONDS = 400 * 24 * 60 * 60;

// Edge-safe configuration shared by the middleware. The warehouse password provider (which
// needs SharePoint and node:crypto) is added only in auth.ts, which runs in the Node runtime.
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
    maxAge: SESSION_MAX_AGE_SECONDS,
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  callbacks: {
    // Defense-in-depth (layer 2) for Microsoft sign-ins. Warehouse password sign-ins are
    // verified against the Staff Accounts list in auth.ts's authorize() instead.
    async signIn({ account, profile }) {
      if (account?.provider === WAREHOUSE_PROVIDER_ID) return true;
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
    async jwt({ token, user, account, profile }) {
      const now = Date.now();
      if (account?.provider === WAREHOUSE_PROVIDER_ID && user) {
        token.role = 'warehouse';
        token.username = user.username;
        token.sessionVersion = user.sessionVersion;
        token.mustChangePassword = user.mustChangePassword;
        token.name = user.name;
        token.email = null;
      } else if (profile) {
        token.tenantId = (profile as { tid?: string }).tid;
        token.role = 'admin';
      }
      // Microsoft sessions issued before roles existed.
      if (!token.role && token.tenantId) token.role = 'admin';
      if (token.role === 'admin' && token.lastSeenAt && now - token.lastSeenAt > ADMIN_IDLE_MS) return null;
      token.lastSeenAt = now;
      return token;
    },
    async session({ session, token }) {
      if (token.tenantId) session.tenantId = token.tenantId;
      session.role = token.role;
      session.username = token.username;
      session.sessionVersion = token.sessionVersion;
      session.mustChangePassword = token.mustChangePassword;
      return session;
    },
  },
};
