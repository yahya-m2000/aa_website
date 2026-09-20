import Link from "next/link";
import {
  listRecords,
  type DeliveryData,
} from "@/features/admin-automation/records";
import { formatUsd } from "@/features/admin-orders/format";
import { OrdersRefresh } from "@/features/admin-orders/components/orders-refresh";
export const metadata = { title: "Deliveries — A&A Admin" };
export default async function DeliveriesPage() {
  const deliveries = await listRecords<DeliveryData>("deliveries");
  return (
    <div className="admin-page-transition mx-auto max-w-[1600px] px-4 py-10 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold text-[rgb(var(--foreground))]">
          Deliveries
        </h1>
        <Link
          href="/admin/orders"
          className="text-sm text-[rgb(var(--accent))]"
        >
          Select orders to combine
        </Link>
      </div>
      <OrdersRefresh />
      {!deliveries.length && (
        <p className="admin-panel mt-4 text-sm">
          Select two or more orders on the Orders page to create a combined
          delivery.
        </p>
      )}
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {deliveries
          .sort((a, b) => b.data.createdAt.localeCompare(a.data.createdAt))
          .map((d) => (
            <Link
              key={d.key}
              href={`/admin/deliveries/${d.key}`}
              className="admin-panel space-y-2"
            >
              <div className="flex flex-wrap justify-between gap-2">
                <span className="font-semibold break-all">{d.key}</span>
                <span className="text-xs">{d.state}</span>
              </div>
              <p className="text-sm">{d.data.customer}</p>
              <p className="text-sm text-[rgb(var(--muted-foreground))]">
                {d.data.references.length} orders ·{" "}
                {d.data.weightKg === undefined
                  ? "Not weighed"
                  : `${d.data.weightKg} kg`}{" "}
                · {formatUsd(d.data.chargeUsd ?? null)}
              </p>
            </Link>
          ))}
      </div>
    </div>
  );
}
