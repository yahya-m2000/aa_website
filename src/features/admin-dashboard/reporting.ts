export type PeriodKind = "rolling" | "month" | "quarter" | "year";
export interface PeriodSelection {
  period: PeriodKind;
  year: number;
  month: number;
  quarter: number;
}
export interface ReportPeriod {
  from: string;
  to: string;
  label: string;
}
export interface ReportOrder {
  reference: string;
  createdAt: string;
  country: string;
  status: string;
  subtotal: number | null;
  serviceFee: number | null;
  markup: number | null;
}
export interface ReportMetrics {
  orders: number;
  completed: number;
  cancelled: number;
  expired: number;
  open: number;
  needsReview: number;
  missingPricing: number;
  unknownStatus: number;
  goodsValue: number | null;
  orderValue: number | null;
  quotedService: number | null;
  quotedMarkup: number | null;
  potentialIncome: number | null;
  completedService: number | null;
  completedMarkup: number | null;
  completedIncome: number | null;
  openIncome: number | null;
  lostIncome: number | null;
  completionRate: number | null;
  cancellationRate: number | null;
  expiryRate: number | null;
  realizationRate: number | null;
  averageOrderValue: number | null;
}
export interface DashboardReport {
  selection: PeriodSelection;
  period: ReportPeriod;
  previousPeriod: ReportPeriod;
  generatedAt: string;
  partial: boolean;
  metrics: ReportMetrics;
  previous: ReportMetrics;
  series: Array<ReportMetrics & { date: string; label: string }>;
  countries: Array<ReportMetrics & { country: string }>;
  statuses: Array<{ status: string; count: number }>;
}
const DAY = 86400000;
const knownStatuses = [
  "Awaiting Payment",
  "Payment Confirmed",
  "Order Created",
  "Shipped",
  "Completed",
  "Cancelled",
  "Expired",
  "Needs Review",
];
export function defaultSelection(now = new Date()): PeriodSelection {
  return {
    period: "rolling",
    year: now.getUTCFullYear(),
    month: now.getUTCMonth() + 1,
    quarter: Math.floor(now.getUTCMonth() / 3) + 1,
  };
}
export function parseSelection(
  params: URLSearchParams,
  now = new Date(),
): PeriodSelection {
  const defaults = defaultSelection(now);
  const period = params.get("period") ?? defaults.period;
  const year = Number(params.get("year") ?? defaults.year);
  const month = Number(params.get("month") ?? defaults.month);
  const quarter = Number(params.get("quarter") ?? defaults.quarter);
  if (
    !["rolling", "month", "quarter", "year"].includes(period) ||
    !Number.isInteger(year) ||
    year < 2000 ||
    year > now.getUTCFullYear() ||
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12 ||
    !Number.isInteger(quarter) ||
    quarter < 1 ||
    quarter > 4
  )
    throw new Error("Choose a valid reporting period.");
  const selection = { period: period as PeriodKind, year, month, quarter };
  if (new Date(periodBounds(selection, 0, now).from) > now)
    throw new Error("The reporting period has not started yet.");
  return selection;
}
export function selectionQuery(selection: PeriodSelection) {
  return new URLSearchParams({
    period: selection.period,
    year: String(selection.year),
    month: String(selection.month),
    quarter: String(selection.quarter),
  }).toString();
}
export function periodBounds(
  selection: PeriodSelection,
  offset = 0,
  now = new Date(),
): ReportPeriod {
  if (selection.period === "rolling") {
    const to = new Date(now.getTime() + offset * 30 * DAY);
    return {
      from: new Date(to.getTime() - 30 * DAY).toISOString(),
      to: to.toISOString(),
      label: offset === 0 ? "Last 30 days" : "Previous 30 days",
    };
  }
  const months =
    selection.period === "year" ? 12 : selection.period === "quarter" ? 3 : 1;
  const startMonth =
    selection.period === "year"
      ? 0
      : selection.period === "quarter"
        ? (selection.quarter - 1) * 3
        : selection.month - 1;
  const from = new Date(
    Date.UTC(selection.year, startMonth + offset * months, 1),
  );
  const to = new Date(
    Date.UTC(from.getUTCFullYear(), from.getUTCMonth() + months, 1),
  );
  const label =
    selection.period === "year"
      ? `${from.getUTCFullYear()}`
      : selection.period === "quarter"
        ? `Q${Math.floor(from.getUTCMonth() / 3) + 1} ${from.getUTCFullYear()}`
        : from.toLocaleDateString("en-GB", {
            month: "long",
            year: "numeric",
            timeZone: "UTC",
          });
  return { from: from.toISOString(), to: to.toISOString(), label };
}
export function amount(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : null;
}
function sum(values: Array<number | null>): number | null {
  return values.some((value) => value === null)
    ? null
    : Math.round(
        values.reduce<number>((total, value) => total + value!, 0) * 100,
      ) / 100;
}
export function income(order: ReportOrder) {
  return sum([order.serviceFee, order.markup]);
}
export function ratio(numerator: number | null, denominator: number | null) {
  return numerator === null || denominator === null || denominator === 0
    ? null
    : numerator / denominator;
}
export function incomeCategory(status: string): "Completed" | "Lost" | "Open" {
  return status === "Completed"
    ? "Completed"
    : status === "Cancelled" || status === "Expired"
      ? "Lost"
      : "Open";
}
export function aggregateOrders(orders: ReportOrder[]): ReportMetrics {
  const completed = orders.filter(
    (o) => incomeCategory(o.status) === "Completed",
  );
  const open = orders.filter((o) => incomeCategory(o.status) === "Open");
  const lost = orders.filter((o) => incomeCategory(o.status) === "Lost");
  const completedIncome = sum(completed.map(income));
  const potentialIncome = sum(orders.map(income));
  const orderValue = sum(
    orders.map((o) => sum([o.subtotal, o.serviceFee, o.markup])),
  );
  const cancelled = orders.filter((o) => o.status === "Cancelled").length;
  const expired = orders.filter((o) => o.status === "Expired").length;
  return {
    orders: orders.length,
    completed: completed.length,
    cancelled,
    expired,
    open: open.length,
    needsReview: orders.filter((o) => o.status === "Needs Review").length,
    missingPricing: orders.filter((o) =>
      [o.subtotal, o.serviceFee, o.markup].some((v) => v === null),
    ).length,
    unknownStatus: orders.filter((o) => !knownStatuses.includes(o.status))
      .length,
    goodsValue: sum(orders.map((o) => o.subtotal)),
    orderValue,
    quotedService: sum(orders.map((o) => o.serviceFee)),
    quotedMarkup: sum(orders.map((o) => o.markup)),
    potentialIncome,
    completedService: sum(completed.map((o) => o.serviceFee)),
    completedMarkup: sum(completed.map((o) => o.markup)),
    completedIncome,
    openIncome: sum(open.map(income)),
    lostIncome: sum(lost.map(income)),
    completionRate: ratio(completed.length, orders.length),
    cancellationRate: ratio(cancelled, orders.length),
    expiryRate: ratio(expired, orders.length),
    realizationRate: ratio(completedIncome, potentialIncome),
    averageOrderValue: ratio(orderValue, orders.length),
  };
}
export function buildReport(
  orders: ReportOrder[],
  selection: PeriodSelection,
  now = new Date(),
): DashboardReport {
  const period = periodBounds(selection, 0, now);
  const previousPeriod = periodBounds(selection, -1, now);
  const cutoff = Math.min(now.getTime(), Date.parse(period.to));
  const inRange = (o: ReportOrder, p: ReportPeriod, end = Date.parse(p.to)) =>
    Date.parse(o.createdAt) >= Date.parse(p.from) &&
    Date.parse(o.createdAt) < end;
  const current = orders.filter((o) => inRange(o, period, cutoff));
  const previous = orders.filter((o) => inRange(o, previousPeriod));
  const series: DashboardReport["series"] = [];
  for (let date = new Date(period.from); date.getTime() < cutoff;) {
    const daily =
      selection.period === "month" || selection.period === "rolling";
    const next = daily
      ? new Date(date.getTime() + DAY)
      : new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1));
    series.push({
      date: date.toISOString(),
      label: date.toLocaleDateString(
        "en-GB",
        daily
          ? { day: "numeric", month: "short", timeZone: "UTC" }
          : { month: "short", timeZone: "UTC" },
      ),
      ...aggregateOrders(
        current.filter(
          (o) =>
            Date.parse(o.createdAt) >= date.getTime() &&
            Date.parse(o.createdAt) < next.getTime(),
        ),
      ),
    });
    date = next;
  }
  return {
    selection,
    period,
    previousPeriod,
    generatedAt: now.toISOString(),
    partial: cutoff < Date.parse(period.to),
    metrics: aggregateOrders(current),
    previous: aggregateOrders(previous),
    series,
    countries: [...new Set(current.map((o) => o.country))]
      .map((country) => ({
        country,
        ...aggregateOrders(current.filter((o) => o.country === country)),
      }))
      .sort((a, b) => b.orders - a.orders),
    statuses: [...new Set(current.map((o) => o.status))]
      .map((status) => ({
        status,
        count: current.filter((o) => o.status === status).length,
      }))
      .sort((a, b) => b.count - a.count),
  };
}
