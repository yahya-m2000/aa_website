"use client";

import { useState, useSyncExternalStore } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DashboardReport } from "../reporting";

const currency = (value: number) =>
  value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
const currencyCompact = (value: number) =>
  value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  });
const NARROW_QUERY = "(max-width: 480px)";
function subscribeNarrow(callback: () => void) {
  const mql = window.matchMedia(NARROW_QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}
function useIsNarrow() {
  return useSyncExternalStore(
    subscribeNarrow,
    () => window.matchMedia(NARROW_QUERY).matches,
    () => false,
  );
}
export function ReportCharts({
  report,
  compact = false,
}: {
  report: DashboardReport;
  compact?: boolean;
}) {
  const narrow = useIsNarrow();
  const [type, setType] = useState<"bar" | "area">(compact ? "area" : "bar");
  const [basis, setBasis] = useState<"completed" | "quoted">("completed");
  const feeKey = basis === "completed" ? "completedService" : "quotedService";
  const markupKey = basis === "completed" ? "completedMarkup" : "quotedMarkup";
  const chartProps = {
    data: report.series,
    margin: { top: 12, right: 8, left: 0, bottom: 0 },
  };
  const moneyTick = narrow ? currencyCompact : currency;
  const axes = (
    <>
      <CartesianGrid strokeDasharray="3 3" stroke="#e3dfe7" vertical={false} />
      <XAxis
        dataKey="label"
        tick={{ fontSize: narrow ? 10 : 11 }}
        tickLine={false}
        axisLine={false}
        minTickGap={narrow ? 16 : 28}
        interval={narrow ? "preserveStartEnd" : undefined}
      />
      <YAxis
        width={narrow ? 40 : 62}
        tick={{ fontSize: narrow ? 10 : 11 }}
        tickLine={false}
        axisLine={false}
        tickFormatter={moneyTick}
      />
      <Tooltip
        formatter={(value) =>
          typeof value === "number" ? currency(value) : "Unavailable"
        }
      />
      <Legend wrapperStyle={{ fontSize: narrow ? 11 : 12, paddingTop: 12 }} />
    </>
  );
  return (
    <>
      <section className="admin-panel min-w-0" aria-label="Income chart">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg font-medium">
            Service fees &amp; markup
          </h2>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <select
              aria-label="Income basis"
              value={basis}
              onChange={(e) => setBasis(e.target.value as typeof basis)}
              className="min-h-11 min-w-0 rounded-xl border border-[rgb(var(--input))] px-2 text-xs sm:px-3 sm:text-sm"
            >
              <option value="completed">Completed orders</option>
              <option value="quoted">Completed + open orders</option>
            </select>
            <select
              aria-label="Income chart type"
              value={type}
              onChange={(e) => setType(e.target.value as typeof type)}
              className="min-h-11 min-w-0 rounded-xl border border-[rgb(var(--input))] px-2 text-xs sm:px-3 sm:text-sm"
            >
              <option value="bar">Bar chart</option>
              <option value="area">Area chart</option>
            </select>
          </div>
        </div>
        <div
          className="h-64 min-w-0 w-full sm:h-72"
          role="img"
          aria-label={`${basis === "completed" ? "Completed-order" : "Completed and open order"} service fee and markup income over ${report.period.label}. Exact amounts are available in the period table and Excel export.`}
        >
          <ResponsiveContainer width="100%" height="100%">
            {type === "bar" ? (
              <BarChart {...chartProps}>
                {axes}
                <Bar
                  dataKey={feeKey}
                  name="Service fees"
                  fill="#49308a"
                  radius={[3, 3, 0, 0]}
                  isAnimationActive={false}
                />
                <Bar
                  dataKey={markupKey}
                  name="Markup"
                  fill="#b296d7"
                  radius={[3, 3, 0, 0]}
                  isAnimationActive={false}
                />
              </BarChart>
            ) : (
              <AreaChart {...chartProps}>
                {axes}
                <Area
                  type="monotone"
                  dataKey={feeKey}
                  name="Service fees"
                  stroke="#49308a"
                  fill="#49308a"
                  fillOpacity={0.12}
                  strokeWidth={2}
                  connectNulls={false}
                  isAnimationActive={false}
                />
                <Area
                  type="monotone"
                  dataKey={markupKey}
                  name="Markup"
                  stroke="#9d77cc"
                  fill="#b296d7"
                  fillOpacity={0.14}
                  strokeWidth={2}
                  connectNulls={false}
                  isAnimationActive={false}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </section>
      {!compact && (
        <section
          className="admin-panel min-w-0"
          aria-label="Order outcomes chart"
        >
          <h2 className="mb-5 font-display text-lg font-medium">
            Order outcomes
          </h2>
          <div
            className="h-56 min-w-0 w-full sm:h-64"
            role="img"
            aria-label="Completed, open, cancelled and expired orders by creation period. Exact counts are in the table below."
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart {...chartProps}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e3dfe7"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: narrow ? 10 : 11 }}
                  minTickGap={narrow ? 16 : 28}
                  interval={narrow ? "preserveStartEnd" : undefined}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  width={narrow ? 28 : 40}
                  tick={{ fontSize: narrow ? 10 : 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: narrow ? 11 : 12, paddingTop: 12 }} />
                <Bar
                  dataKey="completed"
                  name="Completed"
                  stackId="orders"
                  fill="#547961"
                  isAnimationActive={false}
                />
                <Bar
                  dataKey="open"
                  name="Open"
                  stackId="orders"
                  fill="#b296d7"
                  isAnimationActive={false}
                />
                <Bar
                  dataKey="cancelled"
                  name="Cancelled"
                  stackId="orders"
                  fill="#b96363"
                  isAnimationActive={false}
                />
                <Bar
                  dataKey="expired"
                  name="Expired"
                  stackId="orders"
                  fill="#b5afa6"
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}
    </>
  );
}
