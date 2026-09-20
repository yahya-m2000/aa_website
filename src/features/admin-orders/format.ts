export function formatUsd(value: number | null | undefined): string {
  return typeof value === "number" && Number.isFinite(value)
    ? value.toLocaleString("en-US", { style: "currency", currency: "USD" })
    : "—";
}
export function formatOrderDate(
  iso: string | undefined,
  withTime = false,
): string {
  if (!iso || !Number.isFinite(Date.parse(iso))) return "—";
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
    ...(withTime ? ({ hour: "2-digit", minute: "2-digit" } as const) : {}),
  });
}
