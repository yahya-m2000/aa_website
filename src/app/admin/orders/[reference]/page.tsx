import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getOrderDetailByReference } from '@/features/admin-orders/orders.repository';
import { OrderDetailView } from '@/features/admin-orders/components/order-detail-view';

export const metadata = { title: 'Order — A&A Admin' };

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
    <div className="admin-page-transition mx-auto max-w-[1600px] px-6 py-10">
      <div className="mb-6">
        <Link
          href="/admin/orders"
          className="text-sm text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]"
        >
          ← All orders
        </Link>
        <h1 className="mt-2 font-display text-2xl font-semibold text-[rgb(var(--foreground))]">
          {order.fields.OrderReference}
        </h1>
      </div>

      <OrderDetailView order={order} />
    </div>
  );
}
