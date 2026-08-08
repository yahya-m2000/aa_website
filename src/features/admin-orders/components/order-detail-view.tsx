import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { statusVariant } from '../status';
import type { OrderDetail } from '../types';
import { ArrivedAtWarehouseCard } from './arrived-at-warehouse-card';
import { OrderStatusPanel } from './order-status-panel';
import { WeightEntryCard } from './weight-entry-card';

// Mirrors ArrivedAtWarehouseCard's own duplicate of aa_catalog/server's
// pricing.config.ts/pricing.service.ts (owner-supplied rule, 2026-07-28) — kept here too
// since the pricing-breakdown card needs the same live total, not just the warehouse card.
const STORAGE_FREE_DAYS = 7;
const STORAGE_RATE_USD_PER_DAY = 0.5;

function calculateStorageFeeUsd(arrivedAtWarehouseAt: string | undefined, asOf: Date = new Date()): number {
  if (!arrivedAtWarehouseAt) return 0;
  const arrivedAt = new Date(arrivedAtWarehouseAt);
  if (Number.isNaN(arrivedAt.getTime())) return 0;
  const daysSinceArrival = Math.floor((asOf.getTime() - arrivedAt.getTime()) / (24 * 60 * 60 * 1000));
  const billableDays = Math.max(0, daysSinceArrival - STORAGE_FREE_DAYS);
  return billableDays * STORAGE_RATE_USD_PER_DAY;
}

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

// SharePoint number columns aren't guaranteed non-null at runtime (a manually-edited or
// malformed list item — same class of issue as LineItemsJson — can leave a pricing field
// undefined despite the OrderDetail type claiming `number`), so this must not assume a
// valid number reached it. Matches parseLineItems' own "degrade, don't crash the page" rule.
function formatUsd(amount: number | undefined | null): string {
  if (typeof amount !== 'number' || Number.isNaN(amount)) return '—';
  return `$${amount.toFixed(2)}`;
}

// SharePoint pricing fields aren't guaranteed numeric at runtime (see formatUsd above) — a
// bad value here should drop out of the group subtotal rather than turning the whole
// subtotal into NaN, matching the same "degrade, don't crash" rule used everywhere else in
// this admin CMS for the exact same class of issue.
function sumUsd(...amounts: Array<number | undefined | null>): number {
  return amounts.reduce<number>((sum, a) => (typeof a === 'number' && !Number.isNaN(a) ? sum + a : sum), 0);
}

export function OrderDetailView({ order }: { order: OrderDetail }) {
  const f = order.fields;
  const storageFeeUsd = calculateStorageFeeUsd(f.ArrivedAtWarehouseAt);
  // Grouped so staff can read "what we charge for the service" and "what to collect for
  // shipping/handling" as two glanceable numbers, rather than five flat rows they have to
  // mentally add up themselves — the delivery+storage group in particular is exactly the
  // figure staff need when contacting a customer to collect the delivery payment.
  const goodsAndServiceUsd = sumUsd(f.SubtotalUsd, f.ServiceFeeUsd, f.MarkupUsd);
  const deliveryAndStorageUsd = sumUsd(f.DeliveryUsd, storageFeeUsd);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)_minmax(0,340px)]">
      {/* Left: customer + order info — glanceable at a fixed width, no scroll needed */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Customer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 text-sm">
            <p className="font-medium text-[rgb(var(--foreground))]">{f.CustomerFullName}</p>
            <p className="text-[rgb(var(--muted-foreground))]">{f.CustomerEmail}</p>
            <p className="text-[rgb(var(--muted-foreground))]">{f.CustomerPhone}</p>
            <div className="mt-2 border-t border-[rgb(var(--border))] pt-2 text-[rgb(var(--muted-foreground))]">
              <p>{f.ShippingAddress}</p>
              <p>
                {f.City}
                {f.Postcode ? `, ${f.Postcode}` : ''}
              </p>
              <p>{f.Country}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Order info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 text-sm">
            <Row label="Payment method" value={f.PaymentMethod} />
            <Row label="Created" value={formatDateTime(f.CreatedAt)} />
            <Row label="Expires" value={formatDateTime(f.ExpiresAt)} />
            {f.HiobuyOrderId && <Row label="Supplier order ID" value={f.HiobuyOrderId} />}
            {f.ProcuredAt && <Row label="Procured" value={formatDateTime(f.ProcuredAt)} />}
          </CardContent>
        </Card>

        {f.InternalNotes && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Internal notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm text-[rgb(var(--foreground))]">{f.InternalNotes}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Middle: line items + pricing */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Order items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {order.lineItems.length === 0 && (
              <p className="text-sm text-[rgb(var(--muted-foreground))]">
                No line items recorded (or the stored data could not be parsed).
              </p>
            )}
            {order.lineItems.map((item, index) => (
              <div
                key={`${item.productId}-${index}`}
                className="flex items-center justify-between border-b border-[rgb(var(--border))] pb-3 last:border-none last:pb-0"
              >
                <div>
                  <p className="text-sm font-medium text-[rgb(var(--foreground))]">{item.productTitle}</p>
                  {item.variantOptions && item.variantOptions.length > 0 && (
                    <p className="text-xs text-[rgb(var(--muted-foreground))]">
                      {item.variantOptions.map((v) => `${v.name}: ${v.value}`).join(', ')}
                    </p>
                  )}
                  <p className="text-xs text-[rgb(var(--muted-foreground))]">
                    Qty {item.quantity} × {formatUsd(item.finalAmount)}
                  </p>
                </div>
                <p className="text-sm font-medium tabular-nums">{formatUsd(item.finalAmount * item.quantity)}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pricing breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="space-y-1.5">
              <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--muted-foreground))]">
                Goods &amp; service
              </p>
              <Row label="Product cost" value={formatUsd(f.SubtotalUsd)} />
              <Row label="Service fee" value={formatUsd(f.ServiceFeeUsd)} />
              <Row label="Markup" value={formatUsd(f.MarkupUsd)} />
              <div className="flex items-center justify-between border-t border-[rgb(var(--border))] pt-1.5 font-medium">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatUsd(goodsAndServiceUsd)}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--muted-foreground))]">
                Delivery &amp; storage
              </p>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[rgb(var(--muted-foreground))]">
                  Delivery
                  {f.IsDeliveryEstimated && <Badge variant="warning">Estimated</Badge>}
                </span>
                <span className="text-[rgb(var(--foreground))]">{formatUsd(f.DeliveryUsd)}</span>
              </div>
              {storageFeeUsd > 0 && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[rgb(var(--muted-foreground))]">
                    Storage
                    <Badge variant="warning">Accruing</Badge>
                  </span>
                  <span className="text-[rgb(var(--foreground))]">{formatUsd(storageFeeUsd)}</span>
                </div>
              )}
              <div className="flex items-center justify-between border-t border-[rgb(var(--border))] pt-1.5 font-medium">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatUsd(deliveryAndStorageUsd)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-[rgb(var(--border))] pt-2 font-medium">
              <span>Total</span>
              <span className="tabular-nums">{formatUsd(f.TotalUsd + storageFeeUsd)}</span>
            </div>
          </CardContent>
        </Card>

        <WeightEntryCard order={order} />
        <ArrivedAtWarehouseCard order={order} />
      </div>

      {/* Right: status + management controls */}
      <div className="space-y-6">
        <div className="flex items-center justify-between rounded-(--radius) border border-[rgb(var(--border))] bg-[rgb(var(--background))] px-4 py-3 text-sm">
          <span className="text-[rgb(var(--muted-foreground))]">Customer-facing status</span>
          <Badge variant={statusVariant(f.CustomerStatus)}>{f.CustomerStatus}</Badge>
        </div>

        <OrderStatusPanel order={order} />
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[rgb(var(--muted-foreground))]">{label}</span>
      <span className="text-[rgb(var(--foreground))]">{value}</span>
    </div>
  );
}
