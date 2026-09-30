import NextAuth, { CredentialsSignin } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authenticateStaff, staffListConfigured } from '@/features/admin-staff/staff.repository';
import { authConfig, WAREHOUSE_PROVIDER_ID } from './auth.config';
import './types';

class AccountLockedError extends CredentialsSignin {
  code = 'locked';
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    ...authConfig.providers,
    Credentials({
      id: WAREHOUSE_PROVIDER_ID,
      name: 'Warehouse staff',
      credentials: { username: {}, password: {} },
      async authorize(credentials) {
        if (!staffListConfigured()) return null;
        const username = typeof credentials?.username === 'string' ? credentials.username : '';
        const password = typeof credentials?.password === 'string' ? credentials.password : '';
        if (!username || !password || password.length > 200) return null;
        const result = await authenticateStaff(username, password);
        if (!result.ok) {
          if (result.reason === 'locked') throw new AccountLockedError();
          return null;
        }
        const { account } = result;
        return {
          id: account.username,
          name: `${account.displayName} (${account.username})`,
          role: 'warehouse',
          username: account.username,
          sessionVersion: account.sessionVersion,
          mustChangePassword: account.mustChangePassword,
        };
      },
    }),
  ],
});
