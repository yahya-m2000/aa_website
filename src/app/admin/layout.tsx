import type { ReactNode } from 'react';
import { auth, signOut } from '@/core/admin-auth/auth';
import { ToastProvider } from '@/shared/components/ui/toast';
import { AdminChrome } from '@/shared/layouts/admin-chrome';

// Nested under the root layout (src/app/layout.tsx), which already provides <html>/<body> and
// loads the Inter/Inter Tight font variables — this layout only adds admin-specific framing.
// Deliberately NOT wrapped in NextIntlClientProvider (unlike src/app/[locale]/layout.tsx) —
// this is a staff-only tool, not customer-facing, and stays plain English regardless of the
// public site's locale.
export const metadata = {
  title: 'A&A Admin',
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  async function handleSignOut() {
    'use server';
    await signOut({ redirectTo: '/admin/login' });
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--background))]">
      <ToastProvider>
        {session?.user ? (
          <AdminChrome
            userLabel={session.user.email ?? session.user.name ?? 'Signed in'}
            onSignOut={handleSignOut}
          >
            {children}
          </AdminChrome>
        ) : (
          children
        )}
      </ToastProvider>
    </div>
  );
}
