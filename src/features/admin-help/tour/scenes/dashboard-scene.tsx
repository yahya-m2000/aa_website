import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { statusVariant } from '@/features/admin-orders/status';
import { RevenueLineChart } from '@/features/admin-dashboard/components/revenue-line-chart';
import { MOCK_COUNTRY_BREAKDOWN, MOCK_REVENUE_SERIES, MOCK_STATUS_BREAKDOWN } from '../mock-data';

export function DashboardScene() {
  const totalStatus = MOCK_STATUS_BREAKDOWN.reduce((sum, b) => sum + b.count, 0);

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-10">
      <h1 className="mb-6 font-display text-2xl font-semibold text-[rgb(var(--foreground))]">Dashboard</h1>
      <div className="space-y-6">
        <p className="text-xs text-[rgb(var(--muted-foreground))]">Last updated 14:32</p>

        <Card data-tour="revenue-chart">
          <CardHeader>
            <CardTitle className="text-lg">Service fee revenue — last 30 days</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueLineChart series={MOCK_REVENUE_SERIES} />
          </CardContent>
        </Card>

        <div className="grid gap-6 sm:grid-cols-2">
          <Card data-tour="status-breakdown">
            <CardHeader>
              <CardTitle className="text-lg">Status breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {MOCK_STATUS_BREAKDOWN.map(({ status, count }) => (
                  <div key={status} className="flex items-center justify-between text-sm">
                    <Badge variant={statusVariant(status)}>{status}</Badge>
                    <span className="tabular-nums text-[rgb(var(--foreground))]">
                      {count}{' '}
                      <span className="text-[rgb(var(--muted-foreground))]">
                        ({Math.round((count / totalStatus) * 100)}%)
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card data-tour="country-breakdown">
            <CardHeader>
              <CardTitle className="text-lg">By country</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {MOCK_COUNTRY_BREAKDOWN.map(({ country, count, totalUsd }) => (
                  <div key={country} className="flex items-center justify-between text-sm">
                    <span className="text-[rgb(var(--foreground))]">
                      {country} <span className="text-[rgb(var(--muted-foreground))]">({count})</span>
                    </span>
                    <span className="tabular-nums font-medium text-[rgb(var(--foreground))]">
                      ${totalUsd.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
