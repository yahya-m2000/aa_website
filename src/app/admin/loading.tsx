import { Skeleton } from '@/shared/components/ui/skeleton';
import { DashboardSkeleton } from '@/features/admin-dashboard/components/dashboard-content';

export default function AdminDashboardLoading() {
  return (
    <div className="admin-fade-in mx-auto max-w-[1600px] px-6 py-10">
      <Skeleton className="mb-6 h-8 w-40" />
      <DashboardSkeleton />
    </div>
  );
}
