import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireWarehousePage } from "@/core/admin-auth/session";
import { ItemGallery } from "@/features/warehouse/components/item-gallery";
import { DeliveryDispatchAction, DeliveryWeightAction } from "@/features/warehouse/components/warehouse-actions";
import { formatWarehouseDate } from "@/features/warehouse/format";
import { getWarehouseCopy } from "@/features/warehouse/language";
import { getWarehouseDelivery } from "@/features/warehouse/warehouse.repository";

export const metadata = { title: "Combined delivery — A&A" };

export default async function WarehouseDeliveryPage({ params }: { params: Promise<{ key: string }> }) {
  await requireWarehousePage();
  const { lang, t } = await getWarehouseCopy();
  const delivery = await getWarehouseDelivery(decodeURIComponent((await params).key));
  const back = (
    <Link href="/admin/warehouse" className="inline-flex min-h-11 items-center gap-1.5 text-sm text-[rgb(var(--muted-foreground))]">
      <ArrowLeft className="h-4 w-4" /> {t.back}
    </Link>
  );
  if (!delivery) {
    return (
      <div className="space-y-4">
        {back}
        <p className="rounded-2xl border border-[rgb(var(--border))] bg-white p-4 text-sm">{t.notFound}</p>
      </div>
    );
  }

  const ready = delivery.state === "Ready";
  const canWeigh = ready && !delivery.paid;
  const canDispatch = ready && delivery.paid && !delivery.tracking;

  return (
    <div className="space-y-4">
      {back}
      <header>
        <p className="text-xs text-[rgb(var(--muted-foreground))]">{t.combinedDeliveries}</p>
        <h1 className="break-all font-display text-2xl font-semibold">{delivery.key}</h1>
        <p className="mt-1 text-sm text-[rgb(var(--muted-foreground))]">
          {t.statusLabel}: <span className="font-medium text-[rgb(var(--foreground))]">{t.deliveryState[delivery.state] ?? delivery.state}</span>
        </p>
      </header>

      <section className="rounded-2xl border border-[rgb(var(--border))] bg-white p-4">
        <h2 className="mb-2 font-display text-base font-semibold">{t.destination}</h2>
        <p className="break-words text-sm font-medium">{delivery.recipient.name}</p>
        <p className="break-words text-sm">{delivery.recipient.destination}</p>
      </section>

      <section className="rounded-2xl border border-[rgb(var(--border))] bg-white p-4">
        <h2 className="mb-3 font-display text-base font-semibold">{t.weight}</h2>
        <div className="space-y-3">
          {delivery.weightKg !== undefined && <p className="text-sm font-medium">{t.weighed(delivery.weightKg)}</p>}
          {canWeigh && <DeliveryWeightAction deliveryKey={delivery.key} etag={delivery.etag} lang={lang} initial={delivery.weightKg} />}
          {ready && delivery.weightKg !== undefined && !delivery.paid && <p className="text-sm text-[rgb(var(--muted-foreground))]">{t.waitingPayment}</p>}
          {delivery.paid && !delivery.tracking && <p className="text-sm text-[rgb(var(--muted-foreground))]">{t.weightLocked}</p>}
        </div>
      </section>

      {(canDispatch || delivery.tracking) && (
        <section className="rounded-2xl border border-[rgb(var(--border))] bg-white p-4">
          <h2 className="mb-3 font-display text-base font-semibold">{t.dispatch}</h2>
          {delivery.tracking ? (
            <p className="break-all text-sm font-medium">{t.dispatchedWith(delivery.tracking)}</p>
          ) : (
            <DeliveryDispatchAction deliveryKey={delivery.key} etag={delivery.etag} lang={lang} />
          )}
        </section>
      )}

      <section className="space-y-3">
        <h2 className="font-display text-base font-semibold">{t.deliveryOrders} · {t.orders(delivery.orders.length)}</h2>
        {delivery.orders.map((order) => (
          <div key={order.reference} className="rounded-2xl border border-[rgb(var(--border))] bg-white p-4">
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
              <Link href={`/admin/warehouse/orders/${encodeURIComponent(order.reference)}`} className="break-all font-medium text-[rgb(var(--accent))]">
                {order.reference}
              </Link>
              <span className="text-xs text-[rgb(var(--muted-foreground))]">
                {order.arrivedAt ? `${t.arrivedAt}: ${formatWarehouseDate(order.arrivedAt, lang, false)}` : t.notArrived}
              </span>
            </div>
            <ItemGallery items={order.items} lang={lang} />
          </div>
        ))}
      </section>
    </div>
  );
}
