import { AutomationNotice } from '@/features/admin-automation/automation-notice';
import Link from "next/link";
import { listOrders } from "@/features/admin-orders/orders.repository";
import { OrdersFilters } from "@/features/admin-orders/components/orders-filters";
import { OrdersTable } from "@/features/admin-orders/components/orders-table";

export const metadata = { title: "Orders — A&A Admin" };

interface PageProps {
  searchParams: Promise<{ status?: string; search?: string; cursor?: string }>;
}

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const { status, search, cursor } = await searchParams;
  const result = await listOrders({ pageSize: 25, status, search, cursor });

  return (
    <div className="admin-page-transition mx-auto max-w-[1600px] px-4 py-10 sm:px-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-[rgb(var(--foreground))]">
          Orders
        </h1>
        <p className="mt-1 text-sm text-[rgb(var(--muted-foreground))]">
          {result.items.length} order{result.items.length === 1 ? "" : "s"} on
          this page
        </p>
      </div>

      <AutomationNotice />
      <div className="mb-4">
        <OrdersFilters key={`${status ?? ""}:${search ?? ""}`} />
      </div>

      <p className="mb-3 text-xs text-[rgb(var(--muted-foreground))]">
        Delivery is included only after weighing. Combined delivery is charged separately.
      </p>
      <div className="rounded-(--radius) border border-[rgb(var(--border))] bg-[rgb(var(--background))]">
        <OrdersTable orders={result.items} />
      </div>

      {(cursor || result.nextCursor) && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          {cursor && (
            <Link
              className="inline-flex min-h-11 items-center rounded-full border border-[rgb(var(--border))] px-5 text-sm"
              href={`/admin/orders?${new URLSearchParams({ ...(status ? { status } : {}), ...(search ? { search } : {}) }).toString()}`}
            >
              First page
            </Link>
          )}
          {result.nextCursor && (
            <Link
              href={`/admin/orders?${new URLSearchParams({
                ...(status ? { status } : {}),
                ...(search ? { search } : {}),
                cursor: result.nextCursor,
              }).toString()}`}
              className="inline-flex min-h-11 items-center rounded-full border border-[rgb(var(--border))] px-5 text-sm font-medium text-[rgb(var(--accent))] hover:text-[rgb(var(--accent-hover))]"
            >
              Next page →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
