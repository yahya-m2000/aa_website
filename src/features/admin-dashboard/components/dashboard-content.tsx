"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Download, RefreshCw } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useToast } from "@/shared/components/ui/toast";
import {
  selectionQuery,
  type DashboardReport,
  type PeriodKind,
  type ReportMetrics,
} from "../reporting";
import { ReportCharts } from "./report-charts";

const money = (v: number | null) =>
  v === null
    ? "Unavailable"
    : v.toLocaleString("en-US", { style: "currency", currency: "USD" });
const percent = (v: number | null) =>
  v === null ? "—" : `${(v * 100).toFixed(1)}%`;
const count = (v: number | null) =>
  v === null ? "—" : v.toLocaleString("en-GB");
const comparisons: Array<{
  key: keyof ReportMetrics;
  label: string;
  format: typeof money;
}> = [
  { key: "orders", label: "Orders placed", format: count },
  { key: "completed", label: "Completed", format: count },
  { key: "cancelled", label: "Cancelled", format: count },
  { key: "expired", label: "Expired", format: count },
  { key: "open", label: "Open", format: count },
  {
    key: "needsReview",
    label: "Needs review (included in open)",
    format: count,
  },
  { key: "completionRate", label: "Completion rate", format: percent },
  { key: "cancellationRate", label: "Cancellation rate", format: percent },
  { key: "expiryRate", label: "Expiry rate", format: percent },
  {
    key: "completedService",
    label: "Completed-order service fees",
    format: money,
  },
  { key: "completedMarkup", label: "Completed-order markup", format: money },
  { key: "completedIncome", label: "Completed-order income", format: money },
  { key: "openService", label: "Open-order service fees", format: money },
  { key: "openMarkup", label: "Open-order markup", format: money },
  { key: "openIncome", label: "Open-order potential income", format: money },
  {
    key: "lostIncome",
    label: "Cancelled / expired potential income",
    format: money,
  },
  {
    key: "potentialIncome",
    label: "Total quoted income opportunity",
    format: money,
  },
  {
    key: "realizationRate",
    label: "Completed share of quoted income",
    format: percent,
  },
  { key: "orderValue", label: "Order value excluding delivery", format: money },
  {
    key: "averageOrderValue",
    label: "Average order value excluding delivery",
    format: money,
  },
];

export function DashboardContent({
  initialReport,
}: {
  initialReport: DashboardReport;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [report, setReport] = useState(initialReport);
  const [draft, setDraft] = useState(initialReport.selection);
  const [isPending, startTransition] = useTransition();
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(false);
  const request = useRef<AbortController | null>(null);
  const query = selectionQuery(initialReport.selection);
  const refresh = useCallback(async () => {
    if (request.current) return;
    const controller = new AbortController();
    request.current = controller;
    setRefreshing(true);
    try {
      const res = await fetch(`/api/admin/dashboard?${query}`, {
        signal: controller.signal,
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Refresh failed");
      const json = await res.json();
      if (!json.data?.metrics || !Array.isArray(json.data?.series))
        throw new Error("Invalid response");
      setReport(json.data);
      setError(false);
    } catch {
      if (!controller.signal.aborted) setError(true);
    } finally {
      if (request.current === controller) {
        request.current = null;
        if (!controller.signal.aborted) setRefreshing(false);
      }
    }
  }, [query]);
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, 60000);
    return () => {
      clearInterval(interval);
      request.current?.abort();
      request.current = null;
    };
  }, [refresh]);
  async function exportReport() {
    setExporting(true);
    try {
      const res = await fetch(`/api/admin/dashboard/export?${query}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Export failed");
      const url = URL.createObjectURL(await res.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download = `AA-report-${report.period.label.replaceAll(" ", "-")}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch {
      showToast("Excel export failed. Please retry.", "error");
    } finally {
      setExporting(false);
    }
  }
  const simple = report.selection.period === "rolling";
  const m = report.metrics;
  const currentYear = new Date(report.generatedAt).getUTCFullYear();
  const controlClass =
    "h-11 w-full rounded-xl border border-[rgb(var(--input))] px-3 text-sm";
  return (
    <div className="space-y-6" aria-busy={isPending}>
      <nav
        aria-label="Dashboard view"
        className="flex w-fit gap-1 rounded-xl border border-[rgb(var(--border))] bg-white p-1"
      >
        <Link
          href="/admin"
          aria-current={simple ? "page" : undefined}
          className={`inline-flex min-h-11 items-center rounded-lg px-5 text-sm font-medium ${simple ? "bg-[rgb(var(--accent))] text-white" : ""}`}
        >
          Overview
        </Link>
        <Link
          href={`/admin?${selectionQuery({ ...report.selection, period: "quarter" })}`}
          aria-current={!simple ? "page" : undefined}
          className={`inline-flex min-h-11 items-center rounded-lg px-5 text-sm font-medium ${!simple ? "bg-[rgb(var(--accent))] text-white" : ""}`}
        >
          Reports
        </Link>
      </nav>
      {!simple && (
        <form
          className="flex w-full flex-wrap items-end gap-3 xl:w-auto"
          onSubmit={(e) => {
            e.preventDefault();
            startTransition(() =>
              router.push(`/admin?${selectionQuery(draft)}`),
            );
          }}
        >
          <label className="min-w-[110px] flex-1 text-xs xl:flex-none">
            Period
            <select
              className={`${controlClass} mt-1.5`}
              value={draft.period}
              onChange={(e) =>
                setDraft({ ...draft, period: e.target.value as PeriodKind })
              }
            >
              <option value="month">Month</option>
              <option value="quarter">Quarter</option>
              <option value="year">Year</option>
            </select>
          </label>
          <label className="w-24 text-xs">
            Year
            <input
              className={`${controlClass} mt-1.5`}
              type="number"
              min="2000"
              max={currentYear}
              required
              value={draft.year}
              onChange={(e) =>
                setDraft({ ...draft, year: Number(e.target.value) })
              }
            />
          </label>
          {draft.period === "month" && (
            <label className="min-w-[130px] flex-1 text-xs xl:flex-none">
              Month
              <select
                className={`${controlClass} mt-1.5`}
                value={draft.month}
                onChange={(e) =>
                  setDraft({ ...draft, month: Number(e.target.value) })
                }
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i} value={i + 1}>
                    {new Date(Date.UTC(2020, i, 1)).toLocaleDateString(
                      "en-GB",
                      { month: "long", timeZone: "UTC" },
                    )}
                  </option>
                ))}
              </select>
            </label>
          )}
          {draft.period === "quarter" && (
            <label className="min-w-[100px] flex-1 text-xs xl:flex-none">
              Quarter
              <select
                className={`${controlClass} mt-1.5`}
                value={draft.quarter}
                onChange={(e) =>
                  setDraft({ ...draft, quarter: Number(e.target.value) })
                }
              >
                {[1, 2, 3, 4].map((q) => (
                  <option key={q} value={q}>
                    Q{q}
                  </option>
                ))}
              </select>
            </label>
          )}
          <Button type="submit" disabled={isPending}>
            {isPending ? "Loading…" : "Apply"}
          </Button>
        </form>
      )}
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <h2 className="font-medium">
          {report.period.label}
          {report.partial ? " to date" : ""}
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[rgb(var(--muted-foreground))]">
            Updated{" "}
            {new Date(report.generatedAt).toLocaleString("en-GB", {
              timeZone: "UTC",
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            UTC
          </span>
          <Button
            variant="ghost"
            size="icon"
            disabled={refreshing || isPending}
            onClick={() => void refresh()}
            aria-label="Refresh dashboard"
            title="Refresh"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            disabled={exporting || isPending}
            onClick={() => void exportReport()}
            aria-label={exporting ? "Exporting Excel report" : "Export Excel report"}
            title="Export Excel"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {error && (
        <p role="alert" className="text-sm text-[rgb(var(--danger))]">
          Refresh failed. Showing the previous report.
        </p>
      )}
      {(m.missingPricing > 0 || m.unknownStatus > 0) && (
        <p
          role="status"
          className="rounded-xl bg-[rgb(var(--warning-bg))] p-3 text-sm text-[rgb(var(--warning))]"
        >
          {m.missingPricing} orders have incomplete pricing; affected totals are
          unavailable. {m.unknownStatus} orders have unrecognised statuses and
          are included in Open.
        </p>
      )}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          ["Orders placed", count(m.orders)],
          ["Service fees (completed)", money(m.completedService)],
          ["Markup (completed)", money(m.completedMarkup)],
          ["Completion rate", percent(m.completionRate)],
        ].map(([label, value]) => (
          <div className="admin-panel" key={label}>
            <p className="text-xs text-[rgb(var(--muted-foreground))]">
              {label}
            </p>
            <p className="mt-3 font-display text-2xl font-medium tabular-nums xl:text-3xl">
              {value}
            </p>
          </div>
        ))}
      </div>
      <p className="text-xs text-[rgb(var(--muted-foreground))]">
        Completed orders placed in this period. Refunds and costs excluded.
      </p>
      <ReportCharts report={report} compact={simple} />
      {simple && (
        <div className="grid gap-5 lg:grid-cols-2">
          <section className="admin-panel">
            <h2 className="mb-4 font-display text-lg font-medium">
              Order status
            </h2>
            <div className="space-y-4">
              {report.statuses.length ? (
                report.statuses.map((row) => (
                  <div
                    key={row.status}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span>{row.status}</span>
                    <span className="tabular-nums">
                      {row.count}{" "}
                      <span className="text-[rgb(var(--muted-foreground))]">
                        ({percent(row.count / m.orders)})
                      </span>
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[rgb(var(--muted-foreground))]">
                  No orders in the last 30 days.
                </p>
              )}
            </div>
          </section>
          <section className="admin-panel">
            <h2 className="mb-4 font-display text-lg font-medium">
              Income summary
            </h2>
            <dl className="space-y-4 text-sm">
              {[
                ["Completed-order income", money(m.completedIncome)],
                ["Open-order potential", money(m.openIncome)],
                ["Cancelled / expired potential", money(m.lostIncome)],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex flex-wrap items-center justify-between gap-2"
                >
                  <dt>{label}</dt>
                  <dd className="font-medium tabular-nums">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      )}
      {!simple && (
        <>
          <section className="admin-panel min-w-0">
            <h2 className="mb-4 font-display text-lg font-medium">
              Period comparison
            </h2>
            {report.partial && (
              <p className="mb-3 text-xs text-[rgb(var(--muted-foreground))]">
                Current period to date compared with the full previous period.
              </p>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[rgb(var(--border))]">
                    <th className="min-w-52 py-3 text-left">Metric</th>
                    <th className="min-w-32 text-right">
                      {report.period.label}
                    </th>
                    <th className="min-w-32 text-right">
                      {report.previousPeriod.label}
                    </th>
                    <th className="min-w-24 text-right">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisons.map(({ key, label, format }) => {
                    const current = m[key],
                      previous = report.previous[key];
                    const diff =
                      current === null || previous === null
                        ? null
                        : current - previous;
                    return (
                      <tr
                        key={key}
                        className="border-b border-[rgb(var(--border))] last:border-0"
                      >
                        <td className="pr-4">{label}</td>
                        <td className="text-right tabular-nums">
                          {format(current)}
                        </td>
                        <td className="text-right tabular-nums text-[rgb(var(--muted-foreground))]">
                          {format(previous)}
                        </td>
                        <td className="text-right tabular-nums">
                          {diff === null
                            ? "—"
                            : format === percent
                              ? `${(diff * 100).toFixed(1)} pp`
                              : `${diff > 0 ? "+" : ""}${format(diff)}`}
                        </td>
                      </tr>
                    );
                  })}
                  <tr>
                    <td>Refunds / net profit</td>
                    <td
                      colSpan={3}
                      className="text-right text-[rgb(var(--muted-foreground))]"
                    >
                      Not recorded. Add adjustments in Excel.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
          <section className="admin-panel min-w-0">
            <h2 className="mb-4 font-display text-lg font-medium">
              {report.selection.period === "month" ? "Daily" : "Monthly"}{" "}
              breakdown
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full whitespace-nowrap text-sm">
                <thead>
                  <tr className="border-b border-[rgb(var(--border))]">
                    {[
                      "Period",
                      "Orders",
                      "Completed",
                      "Cancelled",
                      "Expired",
                      "Service fees (completed)",
                      "Markup (completed)",
                      "Potential income²",
                    ].map((title, i) => (
                      <th
                        key={title}
                        className={`px-3 py-3 ${i ? "text-right" : "text-left"}`}
                      >
                        {title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {report.series.map((row) => (
                    <tr
                      key={row.date}
                      className="border-b border-[rgb(var(--border))] last:border-0"
                    >
                      <td className="px-3">{row.label}</td>
                      {[
                        row.orders,
                        row.completed,
                        row.cancelled,
                        row.expired,
                      ].map((value, i) => (
                        <td key={i} className="px-3 text-right tabular-nums">
                          {value}
                        </td>
                      ))}
                      {[
                        row.completedService,
                        row.completedMarkup,
                        row.potentialIncome,
                      ].map((value, i) => (
                        <td key={i} className="px-3 text-right tabular-nums">
                          {money(value)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-[rgb(var(--muted-foreground))]">
              ¹ Completed orders. ² Service fees and markup quoted across all
              orders.
            </p>
          </section>
        </>
      )}
      <section className="admin-panel min-w-0">
        <h2 className="mb-4 font-display text-lg font-medium">By country</h2>
        {report.countries.length ? (
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap text-sm">
              <thead>
                <tr className="border-b border-[rgb(var(--border))]">
                  <th className="py-3 text-left">Country</th>
                  <th className="px-3 text-right">Orders</th>
                  <th className="px-3 text-right">Completion</th>
                  <th className="px-3 text-right">Completed income</th>
                </tr>
              </thead>
              <tbody>
                {report.countries.map((row) => (
                  <tr
                    key={row.country}
                    className="border-b border-[rgb(var(--border))] last:border-0"
                  >
                    <td>{row.country}</td>
                    <td className="px-3 text-right">{row.orders}</td>
                    <td className="px-3 text-right">
                      {percent(row.completionRate)}
                    </td>
                    <td className="px-3 text-right tabular-nums">
                      {money(row.completedIncome)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-[rgb(var(--muted-foreground))]">
            No orders in this period.
          </p>
        )}
      </section>
      <details className="rounded-xl border border-[rgb(var(--border))] p-4 text-xs text-[rgb(var(--muted-foreground))]">
        <summary className="cursor-pointer py-1 font-medium">
          Reporting definitions
        </summary>
        <div className="mt-3 space-y-2 leading-relaxed">
          <p>
            Overview covers the last 30 days. Reports use calendar months,
            quarters, and years in UTC. Orders and income are grouped by order
            creation date using their current status, not the date of payment or
            completion. Historical reports may change as orders progress.
          </p>
          <p>
            Income is service fees plus markup. Completed-order income is a
            reporting proxy, not verified cash receipts or net profit. Potential
            income is the quoted amount if every order completed; it is not a
            forecast. Cancelled and expired potential is opportunity not
            realised, not an expense.
          </p>
          <p>
            Delivery, storage, refunds, operating costs, and taxes are excluded.
            The Excel workbook includes manual adjustment inputs and formulas
            for refund ratios and an adjusted contribution. Missing pricing is
            marked unavailable, and zero denominators have no ratio.
          </p>
        </div>
      </details>
    </div>
  );
}
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-14 w-full" />
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      <Skeleton className="h-80 w-full" />
    </div>
  );
}
