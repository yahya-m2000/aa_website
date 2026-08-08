import { redirect } from 'next/navigation';
import { auth, signIn } from '@/core/admin-auth/auth';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';

export default async function AdminLoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect('/admin');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[rgb(var(--background))] px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="font-display">A&amp;A Admin</CardTitle>
          <CardDescription>Sign in with your A&amp;A Microsoft 365 account to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={async () => {
              'use server';
              await signIn('microsoft-entra-id', { redirectTo: '/admin' });
            }}
          >
            <Button type="submit" className="w-full" size="lg">
              Sign in with Microsoft
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
