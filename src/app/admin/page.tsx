import { redirect } from 'next/navigation';
import { auth } from '@/core/admin-auth/auth';
import { DashboardContent } from '@/features/admin-dashboard/components/dashboard-content';
import { getOrderStats } from '@/features/admin-orders/orders.repository';

const DEFAULT_RANGE_DAYS = 30;

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/admin/login');
  }

  const now = new Date();
  const from = new Date(now.getTime() - DEFAULT_RANGE_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const stats = await getOrderStats(from, now.toISOString());

  return (
    <div className="admin-page-transition mx-auto max-w-[1600px] px-6 py-10">
      <h1 className="mb-6 font-display text-2xl font-semibold text-[rgb(var(--foreground))]">Dashboard</h1>
      <DashboardContent initialStats={stats} />
    </div>
  );
}
