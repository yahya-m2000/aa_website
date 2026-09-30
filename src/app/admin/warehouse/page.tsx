/* eslint-disable @next/next/no-img-element -- Alibaba CDN images load directly for staff in China. */
import Link from "next/link";
import { redirect } from "next/navigation";
import { Search } from "lucide-react";
import { requireWarehousePage } from "@/core/admin-auth/session";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { formatWarehouseDate, normalizeReference } from "@/features/warehouse/format";
import type { WarehouseCopy, WarehouseLang } from "@/features/warehouse/i18n";
import { getWarehouseCopy } from "@/features/warehouse/language";
import { getWarehouseQueue, type WarehouseDelivery, type WarehouseOrder } from "@/features/warehouse/warehouse.repository";

export const metadata = { title: "Warehouse — A&A" };

function OrderCard({ order, lang, t }: { order: WarehouseOrder; lang: WarehouseLang; t: WarehouseCopy }) {
  const photos = order.items.filter((item) => item.imageUrl).slice(0, 4);
  const place = [order.recipient.city, order.recipient.country].filter(Boolean).join(", ");
  return (
    <Link
      href={`/admin/warehouse/orders/${encodeURIComponent(order.reference)}`}
      className="block rounded-2xl border border-[rgb(var(--border))] bg-white p-4 active:bg-[rgb(var(--muted))]"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="break-all font-display text-base font-semibold text-[rgb(var(--accent))]">{order.reference}</p>
        <span className="shrink-0 text-xs text-[rgb(var(--muted-foreground))]">{formatWarehouseDate(order.createdAt, lang, false)}</span>
      </div>
      <p className="mt-1 break-words text-sm">{order.recipient.name}{place ? ` · ${place}` : ""}</p>
      <div className="mt-3 flex items-center gap-2">
        {photos.map((item, index) => (
          <img key={index} src={item.imageUrl} alt="" loading="lazy" referrerPolicy="no-referrer" className="h-11 w-11 rounded-lg border border-[rgb(var(--border))] object-cover" />
        ))}
        <span className="ml-auto text-xs text-[rgb(var(--muted-foreground))]">{t.items(order.items.length)}</span>
      </div>
    </Link>
  );
}

function DeliveryCard({ delivery, lang, t }: { delivery: WarehouseDelivery; lang: WarehouseLang; t: WarehouseCopy }) {
  const status = delivery.weightKg === undefined ? t.needsWeighing : delivery.paid ? t.dispatch : t.waitingPayment;
  return (
    <Link
      href={`/admin/warehouse/deliveries/${encodeURIComponent(delivery.key)}`}
      className="block rounded-2xl border border-[rgb(var(--border))] bg-white p-4 active:bg-[rgb(var(--muted))]"
      lang={lang === "zh" ? "zh-CN" : "en"}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="break-all font-display text-base font-semibold text-[rgb(var(--accent))]">{delivery.key}</p>
        <span className="shrink-0 text-xs text-[rgb(var(--muted-foreground))]">{t.orders(delivery.orderCount)}</span>
      </div>
      <p className="mt-1 break-words text-sm">{delivery.recipient.name}</p>
      <p className="mt-2 text-xs text-[rgb(var(--muted-foreground))]">{status}</p>
    </Link>
  );
}

function Section({ title, hint, count, children }: { title: string; hint: string; count: number; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="font-display text-lg font-semibold">
          {title} <span className="ml-1 rounded-full bg-[rgb(var(--muted))] px-2 py-0.5 text-sm tabular-nums">{count}</span>
        </h2>
        <p className="text-xs text-[rgb(var(--muted-foreground))]">{hint}</p>
      </div>
      {children}
    </section>
  );
}

export default async function WarehouseHomePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireWarehousePage();
  const { lang, t } = await getWarehouseCopy();
  const { q } = await searchParams;
  if (q && normalizeReference(q)) redirect(`/admin/warehouse/orders/${encodeURIComponent(normalizeReference(q))}`);
  const queue = await getWarehouseQueue();
  const empty = <p className="rounded-2xl border border-dashed border-[rgb(var(--border))] p-4 text-sm text-[rgb(var(--muted-foreground))]">{t.empty}</p>;

  return (
    <div className="space-y-8">
      <form method="get" className="space-y-2" role="search">
        <label htmlFor="warehouse-search" className="block text-sm font-medium">{t.searchLabel}</label>
        <div className="flex gap-2">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-[rgb(var(--muted-foreground))]" aria-hidden="true" />
            <Input id="warehouse-search" name="q" placeholder={t.searchPlaceholder} autoCapitalize="characters" autoCorrect="off" spellCheck={false} className="h-11 pl-10" />
          </div>
          <Button type="submit">{t.searchButton}</Button>
        </div>
      </form>
      <Section title={t.awaitingArrival} hint={t.awaitingArrivalHint} count={queue.awaitingArrival.length}>
        {queue.awaitingArrival.length ? queue.awaitingArrival.map((order) => <OrderCard key={order.reference} order={order} lang={lang} t={t} />) : empty}
      </Section>
      <Section title={t.needsWeighing} hint={t.needsWeighingHint} count={queue.needsWeighing.length}>
        {queue.needsWeighing.length ? queue.needsWeighing.map((order) => <OrderCard key={order.reference} order={order} lang={lang} t={t} />) : empty}
      </Section>
      <Section title={t.combinedDeliveries} hint={t.combinedHint} count={queue.deliveries.length}>
        {queue.deliveries.length ? queue.deliveries.map((delivery) => <DeliveryCard key={delivery.key} delivery={delivery} lang={lang} t={t} />) : empty}
      </Section>
    </div>
  );
}
