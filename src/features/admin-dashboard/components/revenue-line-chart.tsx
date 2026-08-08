'use client';

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { OrderStats } from '../types';

function formatDateLabel(date: string): string {
  try {
    return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  } catch {
    return date;
  }
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const orders = payload.find((p) => p.dataKey === 'orders')?.value ?? 0;
  const revenue = payload.find((p) => p.dataKey === 'revenueUsd')?.value ?? 0;

  return (
    <div className="rounded-(--radius) border border-[rgb(var(--border))] bg-[rgb(var(--background))] px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-medium text-[rgb(var(--foreground))]">{formatDateLabel(label ?? '')}</p>
      <p className="text-[rgb(var(--muted-foreground))]">
        {orders} order{orders === 1 ? '' : 's'}
      </p>
      <p className="font-medium text-[rgb(var(--accent))]">${revenue.toFixed(2)}</p>
    </div>
  );
}

export function RevenueLineChart({ series }: { series: OrderStats['revenueSeries'] }) {
  if (series.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-[rgb(var(--muted-foreground))]">
        No orders in this date range yet.
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(59 24 147)" stopOpacity={0.25} />
              <stop offset="100%" stopColor="rgb(59 24 147)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgb(227 227 227)" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatDateLabel}
            tick={{ fontSize: 11, fill: 'rgb(96 96 96)' }}
            tickLine={false}
            axisLine={{ stroke: 'rgb(227 227 227)' }}
            minTickGap={24}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'rgb(96 96 96)' }}
            tickLine={false}
            axisLine={false}
            width={48}
            tickFormatter={(v: number) => `$${v}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="revenueUsd"
            stroke="rgb(59 24 147)"
            strokeWidth={2}
            fill="url(#revenueFill)"
            animationDuration={600}
            dot={false}
            activeDot={{ r: 4, fill: 'rgb(59 24 147)' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
