import { Skeleton } from '@/shared/components/ui/skeleton';

export default function AdminOrdersLoading() {
  return (
    <div className="admin-fade-in mx-auto max-w-[1600px] px-6 py-10">
      <Skeleton className="mb-6 h-8 w-40" />
      <Skeleton className="mb-4 h-11 w-full max-w-sm" />
      <div className="space-y-2 rounded-(--radius) border border-[rgb(var(--border))] p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}
