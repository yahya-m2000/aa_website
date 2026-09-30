import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireWarehousePage } from "@/core/admin-auth/session";
import { ItemGallery } from "@/features/warehouse/components/item-gallery";
import { MarkArrivedAction, OrderWeightAction } from "@/features/warehouse/components/warehouse-actions";
import { formatWarehouseDate, normalizeReference } from "@/features/warehouse/format";
import { getWarehouseCopy } from "@/features/warehouse/language";
import { getWarehouseOrder, WAREHOUSE_ACTIVE_STATUSES } from "@/features/warehouse/warehouse.repository";

export const metadata = { title: "Warehouse order — A&A" };

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-[rgb(var(--border))] bg-white p-4">
      <h2 className="mb-3 font-display text-base font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export default async function WarehouseOrderPage({ params }: { params: Promise<{ reference: string }> }) {
  await requireWarehousePage();
  const { lang, t } = await getWarehouseCopy();
  const reference = normalizeReference(decodeURIComponent((await params).reference));
  const order = await getWarehouseOrder(reference);
  const back = (
    <Link href="/admin/warehouse" className="inline-flex min-h-11 items-center gap-1.5 text-sm text-[rgb(var(--muted-foreground))]">
      <ArrowLeft className="h-4 w-4" /> {t.back}
    </Link>
  );

  if (!order) {
    return (
      <div className="space-y-4">
        {back}
        <p className="rounded-2xl border border-[rgb(var(--border))] bg-white p-4 text-sm">{t.notFound}</p>
      </div>
    );
  }

  const active = WAREHOUSE_ACTIVE_STATUSES.includes(order.status);
  const r = order.recipient;

  return (
    <div className="space-y-4">
      {back}
      <header>
        <h1 className="break-all font-display text-2xl font-semibold">{order.reference}</h1>
        <p className="mt-1 text-sm text-[rgb(var(--muted-foreground))]">
          {t.statusLabel}: <span className="font-medium text-[rgb(var(--foreground))]">{t.status[order.status] ?? order.status}</span>
        </p>
      </header>

      <Card title={`${t.orderItems} · ${t.items(order.items.length)}`}>
        <ItemGallery items={order.items} lang={lang} />
      </Card>

      <Card title={t.destination}>
        <address className="space-y-0.5 break-words text-sm not-italic leading-relaxed">
          <p className="font-medium">{r.name}</p>
          {r.address && <p>{r.address}</p>}
          <p>{[r.city, r.postcode].filter(Boolean).join(", ")}</p>
          {r.country && <p>{r.country}</p>}
        </address>
      </Card>

      <Card title={t.arrival}>
        {order.arrivedAt ? (
          <p className="text-sm">{t.arrivedAt}: <span className="font-medium">{formatWarehouseDate(order.arrivedAt, lang)}</span></p>
        ) : active ? (
          <div className="space-y-3">
            <p className="text-sm text-[rgb(var(--muted-foreground))]">{t.notArrived}</p>
            <MarkArrivedAction reference={order.reference} etag={order.etag} lang={lang} />
          </div>
        ) : (
          <p className="text-sm text-[rgb(var(--muted-foreground))]">{t.notArrived}</p>
        )}
      </Card>

      <Card title={t.weight}>
        {order.deliveryGroupId ? (
          <div className="space-y-3 text-sm">
            <p>{t.inCombined}</p>
            <Link href={`/admin/warehouse/deliveries/${encodeURIComponent(order.deliveryGroupId)}`} className="inline-flex min-h-11 items-center font-medium text-[rgb(var(--accent))]">
              {t.openDelivery} →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {order.weighed && order.weightKg !== undefined && <p className="text-sm font-medium">{t.weighed(order.weightKg)}</p>}
            {!order.arrivedAt ? (
              <p className="text-sm text-[rgb(var(--muted-foreground))]">{t.weighFirst}</p>
            ) : active ? (
              <OrderWeightAction reference={order.reference} etag={order.etag} lang={lang} initial={order.weightKg} />
            ) : null}
          </div>
        )}
      </Card>
    </div>
  );
}
