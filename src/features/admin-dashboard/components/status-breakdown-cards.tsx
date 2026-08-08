import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { statusVariant } from '@/features/admin-orders/status';
import type { OrderStats } from '../types';

export function StatusBreakdownCards({ breakdown }: { breakdown: OrderStats['statusBreakdown'] }) {
  const total = breakdown.reduce((sum, b) => sum + b.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Status breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        {breakdown.length === 0 ? (
          <p className="text-sm text-[rgb(var(--muted-foreground))]">No orders yet.</p>
        ) : (
          <div className="space-y-2">
            {[...breakdown]
              .sort((a, b) => b.count - a.count)
              .map(({ status, count }) => (
                <div key={status} className="flex items-center justify-between text-sm">
                  <Badge variant={statusVariant(status)}>{status}</Badge>
                  <span className="tabular-nums text-[rgb(var(--foreground))]">
                    {count} <span className="text-[rgb(var(--muted-foreground))]">({((count / total) * 100).toFixed(0)}%)</span>
                  </span>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
