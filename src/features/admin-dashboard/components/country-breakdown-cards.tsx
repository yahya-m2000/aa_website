import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import type { OrderStats } from '../types';

// See order-detail-view.tsx's formatUsd — SharePoint pricing fields aren't guaranteed
// non-null at runtime, and TotalUsd here is summed straight from them in getOrderStats.
function formatUsd(amount: number): string {
  if (typeof amount !== 'number' || Number.isNaN(amount)) return '—';
  return `$${amount.toFixed(2)}`;
}

export function CountryBreakdownCards({ breakdown }: { breakdown: OrderStats['countryBreakdown'] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">By country</CardTitle>
      </CardHeader>
      <CardContent>
        {breakdown.length === 0 ? (
          <p className="text-sm text-[rgb(var(--muted-foreground))]">No orders yet.</p>
        ) : (
          <div className="space-y-2">
            {[...breakdown]
              .sort((a, b) => b.totalUsd - a.totalUsd)
              .map(({ country, count, totalUsd }) => (
                <div key={country} className="flex items-center justify-between text-sm">
                  <span className="text-[rgb(var(--foreground))]">
                    {country} <span className="text-[rgb(var(--muted-foreground))]">({count})</span>
                  </span>
                  <span className="tabular-nums font-medium text-[rgb(var(--foreground))]">{formatUsd(totalUsd)}</span>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
