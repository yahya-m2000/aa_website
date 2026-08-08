'use client';

import { useEffect, useState } from 'react';
import { RevenueLineChart } from './revenue-line-chart';
import { StatusBreakdownCards } from './status-breakdown-cards';
import { CountryBreakdownCards } from './country-breakdown-cards';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import type { OrderStats } from '../types';

const POLL_INTERVAL_MS = 30_000;

export function DashboardContent({ initialStats }: { initialStats: OrderStats }) {
  const [stats, setStats] = useState<OrderStats>(initialStats);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/admin/dashboard');
        if (!res.ok) return;
        const json = await res.json();
        setStats(json.data);
        setLastUpdated(new Date());
      } catch {
        // Silent — a failed background refresh just means the dashboard shows slightly
        // stale numbers until the next poll succeeds, not worth surfacing as an error.
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-xs text-[rgb(var(--muted-foreground))]">
          Last updated {lastUpdated.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Service fee revenue — last 30 days</CardTitle>
        </CardHeader>
        <CardContent>
          <RevenueLineChart series={stats.revenueSeries} />
        </CardContent>
      </Card>

      <div className="grid gap-6 sm:grid-cols-2">
        <StatusBreakdownCards breakdown={stats.statusBreakdown} />
        <CountryBreakdownCards breakdown={stats.countryBreakdown} />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-80 w-full" />
      <div className="grid gap-6 sm:grid-cols-2">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  );
}
