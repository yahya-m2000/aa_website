import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';

export default function AdminUnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[rgb(var(--background))] px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="font-display">Access denied</CardTitle>
          <CardDescription>
            Your Microsoft account isn&apos;t part of the A&amp;A organization, so it can&apos;t access this
            admin area.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button asChild variant="outline">
            <a href="/admin/login">Try a different account</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
