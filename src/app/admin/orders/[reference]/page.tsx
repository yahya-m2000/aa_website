import { AutomationNotice } from '@/features/admin-automation/automation-notice';
import { CopyButton } from "@/features/admin-orders/components/copy-button";
import { AdminBackLink } from "@/shared/components/admin-back-link";
import { notFound } from "next/navigation";
import { getOrderDetailByReference } from "@/features/admin-orders/orders.repository";
import { OrderDetailView } from "@/features/admin-orders/components/order-detail-view";

export const metadata = { title: "Order — A&A Admin" };

interface PageProps {
  params: Promise<{ reference: string }>;
}

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const { reference } = await params;
  const order = await getOrderDetailByReference(decodeURIComponent(reference));

  if (!order) {
    notFound();
  }

  return (
    <div className="admin-page-transition mx-auto max-w-[1600px] px-4 py-10 sm:px-6">
      <div className="mb-6">
        <AdminBackLink href="/admin/orders">All orders</AdminBackLink>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="min-w-0 break-all font-display text-2xl font-semibold text-[rgb(var(--foreground))]">
            {order.fields.OrderReference}
          </h1>
          <CopyButton
            value={order.fields.OrderReference}
            label="Order reference"
          />
        </div>
      </div>

      <AutomationNotice />
      <OrderDetailView order={order} />
    </div>
  );
}
