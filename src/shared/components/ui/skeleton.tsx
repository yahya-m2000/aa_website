import { cn } from '@/core/utils';

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-(--radius) bg-[rgb(var(--muted))]', className)}
      {...props}
    />
  );
}

export { Skeleton };
