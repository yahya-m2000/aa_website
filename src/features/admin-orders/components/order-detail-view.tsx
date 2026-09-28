import { ProductImageViewer } from './product-image-viewer';
import { LastChanged, OrderActivity } from './order-activity';
import { taobaoItemUrl } from '../product-media';
import Link from "next/link";
import { getPricingDisplay, storageFeeForDisplay } from "../pricing-display";
import { formatUsd, formatOrderDate } from "../format";
import { CopyButton } from "./copy-button";
import { Badge } from "@/shared/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { statusVariant } from "../status";
import type { OrderDetail } from "../types";
import { ArrivedAtWarehouseCard } from "./arrived-at-warehouse-card";
import { OrderStatusPanel } from "./order-status-panel";
import { WeightEntryCard } from "./weight-entry-card";

export function OrderDetailView({ order }: { order: OrderDetail }) {
  const f = order.fields;
  const storageFeeUsd = storageFeeForDisplay(f.ArrivedAtWarehouseAt);
  const pricing = getPricingDisplay(
    f.DeliveryGroupId
      ? { ...f, DeliveryUsd: 0, IsDeliveryEstimated: false }
      : f,
    storageFeeUsd,
  );
  return (
    <div className="admin-order-detail">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={statusVariant(f.InternalStatus)}>
            {f.InternalStatus}
          </Badge>
          {f.InternalStatus !== f.CustomerStatus && (
            <span className="text-xs text-[rgb(var(--muted-foreground))]">
              Customer: {f.CustomerStatus}
            </span>
          )}
        </div>
        <LastChanged fields={f} />
      </div>
      <div className="flex flex-col gap-6 lg:grid lg:min-w-0 lg:items-start lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="contents lg:block lg:min-w-0 lg:space-y-6 lg:col-start-1 lg:row-start-1">
          <Card id="order-items" className="order-1 lg:order-none">
            <CardHeader>
              <CardTitle className="text-lg">
                Order items{" "}
                <span className="ml-1 text-sm font-normal text-[rgb(var(--muted-foreground))]">
                  ({order.lineItems.length})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.lineItems.length === 0 && (
                <p className="text-sm text-[rgb(var(--muted-foreground))]">
                  No item details available. Check the source order.
                </p>
              )}
              {order.lineItems.map((item, index) => (
                <article
                  key={`${item.productId}-${index}`}
                  className="grid grid-cols-[64px_minmax(0,1fr)] min-w-0 gap-3 border-b border-[rgb(var(--border))] pb-4 last:border-0 last:pb-0 sm:grid-cols-[64px_minmax(0,1fr)_auto]"
                >
                  <ProductImageViewer items={order.lineItems} index={index} />
                  <div className="min-w-0">
                    <h3 className="break-words text-sm font-medium leading-relaxed">
                      {item.productTitle}
                    </h3>
                    {!!item.variantOptions?.length && (
                      <p className="mt-1 text-xs leading-relaxed text-[rgb(var(--muted-foreground))]">
                        {item.variantOptions
                          .map((v) => `${v.name}: ${v.value}`)
                          .join(" · ")}
                      </p>
                    )}
                    {taobaoItemUrl(item) && <a className="mt-2 inline-block text-xs text-[rgb(var(--accent))] underline" href={taobaoItemUrl(item)} target="_blank" rel="noopener noreferrer">View on Taobao &#8599;</a>}
                    <p className="mt-2 text-xs text-[rgb(var(--muted-foreground))]">
                      {item.quantity} ×{" "}
                      <span className="whitespace-nowrap tabular-nums">
                        {formatUsd(item.finalAmount)}
                      </span>
                    </p>
                  </div>
                  <p className="col-start-2 sm:col-start-3 whitespace-nowrap text-right text-base font-semibold tabular-nums">
                    {formatUsd(item.finalAmount * item.quantity)}
                  </p>
                </article>
              ))}
            </CardContent>
          </Card>
          <Card id="order-customer" className="order-2 lg:order-none">
            <CardHeader>
              <CardTitle className="text-lg">Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="font-medium">
                {f.CustomerFullName || "Not provided"}
              </p>
              <div className="flex min-w-0 items-center justify-between gap-3">
                <span className="min-w-0 break-all text-[rgb(var(--muted-foreground))]">
                  {f.CustomerEmail || "No email provided"}
                </span>
                {f.CustomerEmail && (
                  <CopyButton value={f.CustomerEmail} label="Email" />
                )}
              </div>
              <div className="flex min-w-0 items-center justify-between gap-3">
                {f.CustomerPhone ? (
                  <a
                    href={`tel:${f.CustomerPhone}`}
                    className="min-w-0 break-words text-[rgb(var(--accent))]"
                  >
                    {f.CustomerPhone}
                  </a>
                ) : (
                  <span className="text-[rgb(var(--muted-foreground))]">
                    No phone provided
                  </span>
                )}
                {f.CustomerPhone && (
                  <CopyButton value={f.CustomerPhone} label="Phone number" />
                )}
              </div>
              <address className="border-t border-[rgb(var(--border))] pt-3 not-italic leading-relaxed text-[rgb(var(--muted-foreground))]">
                <p>{f.ShippingAddress || "No address provided"}</p>
                <p>{[f.City, f.Postcode].filter(Boolean).join(", ")}</p>
                <p>{f.Country}</p>
              </address>
            </CardContent>
          </Card>
          <Card id="order-pricing" className="order-3 lg:order-none">
            <CardHeader>
              <CardTitle className="text-lg">
                Pricing breakdown{" "}
                <span className="ml-1 text-xs font-normal text-[rgb(var(--muted-foreground))]">
                  USD
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 text-sm">
              <dl className="space-y-3">
                <PriceRow
                  label="Items"
                  value={formatUsd(pricing.goodsAndServiceUsd === null ? null : pricing.goodsAndServiceUsd - f.ServiceFeeUsd)}
                />
                <PriceRow label="Service fee" value={formatUsd(f.ServiceFeeUsd)} />
                <PriceRow
                  label="Delivery"
                  value={f.DeliveryGroupId ? "Charged separately" : pricing.deliveryPending ? "Awaiting weight" : formatUsd(f.DeliveryUsd)}
                />
                {storageFeeUsd > 0 && <PriceRow label="Storage" value={formatUsd(storageFeeUsd)} />}
              </dl>
              <div className="rounded-xl bg-[rgb(var(--muted))] p-4">
                <p className="text-xs font-medium text-[rgb(var(--muted-foreground))]">
                  Order total
                </p>
                <p className="mt-2 text-xl font-semibold leading-tight tabular-nums sm:text-3xl">
                  {formatUsd(pricing.knownChargesUsd)}
                </p>
              </div>
              {(pricing.deliveryPending || f.DeliveryGroupId) && (
                <p className="text-xs text-[rgb(var(--muted-foreground))]">
                  {f.DeliveryGroupId ? "Delivery is charged once for the combined shipment." : "Delivery will be added after weighing."}
                </p>
              )}
              <details className="border-t border-[rgb(var(--border))] pt-3">
                <summary className="cursor-pointer py-2 text-xs font-medium text-[rgb(var(--muted-foreground))]">Cost and margin</summary>
                <dl className="mt-3 space-y-3">
                  <PriceRow label="Product cost" value={formatUsd(f.SubtotalUsd)} />
                  <PriceRow label="Markup" value={formatUsd(f.MarkupUsd)} />
                </dl>
              </details>
              {pricing.knownChargesUsd === null && (
                <p role="status" className="text-xs text-[rgb(var(--danger))]">
                  Pricing data is incomplete. Verify the order before collecting
                  payment.
                </p>
              )}
            </CardContent>
          </Card>
          <section aria-labelledby="fulfilment-heading" className="order-5 space-y-4 lg:order-none">
            <h2 id="fulfilment-heading" className="font-display text-lg font-semibold">Delivery and warehouse</h2>
          {f.DeliveryGroupId && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Combined delivery</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <Link
                  className="text-[rgb(var(--accent))] break-all"
                  href={`/admin/deliveries/${f.DeliveryGroupId}`}
                >
                  {f.DeliveryGroupId}
                </Link>
                {order.delivery ? (
                  <>
                    <p>
                      {order.delivery.data.references.length} orders -{" "}
                      {order.delivery.state}
                    </p>
                    <p>
                      Shared delivery:{" "}
                      {formatUsd(order.delivery.data.chargeUsd ?? null)}
                      {order.delivery.data.paidAt ? " - Paid" : ""}
                    </p>
                    <p className="text-xs">
                      Collected once for the whole delivery; excluded from this
                      order&apos;s charges.
                    </p>
                  </>
                ) : (
                  <p>Delivery details temporarily unavailable.</p>
                )}
              </CardContent>
            </Card>
          )}
          <div className={`grid min-w-0 gap-6 ${f.DeliveryGroupId ? "" : "2xl:grid-cols-2"}`}>
            {!f.DeliveryGroupId && (
              <WeightEntryCard key={`weight-${order.etag}`} order={order} />
            )}
            <ArrivedAtWarehouseCard
              key={`arrival-${order.etag}`}
              order={order}
            />
          </div>
          </section>
          <Card className="order-6 lg:order-none">
            <CardHeader>
              <CardTitle className="text-lg">Order details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3 text-sm">
                <InfoRow label="Payment method" value={f.PaymentMethod} />
                <InfoRow
                  label="Created (UTC)"
                  value={formatOrderDate(f.CreatedAt, true)}
                />
                {f.InternalStatus === "Awaiting Payment" && <InfoRow label="Payment deadline (UTC)" value={formatOrderDate(f.ExpiresAt, true)} />}
                {f.HiobuyOrderId && (
                  <InfoRow label="Supplier order" value={f.HiobuyOrderId} />
                )}
                {f.ProcuredAt && (
                  <InfoRow
                    label="Procured (UTC)"
                    value={formatOrderDate(f.ProcuredAt, true)}
                  />
                )}
              </dl>
            </CardContent>
          </Card>
          <OrderActivity events={order.activity} />
        </div>
        <aside aria-label="Order actions" className="order-4 min-w-0 space-y-4 lg:order-none lg:col-start-2 lg:row-start-1">
          <h2 className="font-display text-lg font-semibold">Manage order</h2>
          <div id="order-manage" className="space-y-4">
            <OrderStatusPanel order={order} />
          </div>
        </aside>
      </div>
    </div>
  );
}
function PriceRow({
  label,
  value,
  total = false,
}: {
  label: string;
  value: string;
  total?: boolean;
}) {
  return (
    <div
      className={`flex flex-wrap items-baseline justify-between gap-x-5 gap-y-1 ${total ? "border-t border-[rgb(var(--border))] pt-3 font-medium" : ""}`}
    >
      <dt className={total ? "" : "text-[rgb(var(--muted-foreground))]"}>
        {label}
      </dt>
      <dd className="ml-auto min-w-0 break-words text-right tabular-nums">
        {value}
      </dd>
    </div>
  );
}
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-3">
      <dt className="text-[rgb(var(--muted-foreground))]">{label}</dt>
      <dd className="min-w-0 break-words text-right leading-relaxed">
        {value || "—"}
      </dd>
    </div>
  );
}
