'use client';

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { INTERNAL_STATUS_VALUES, statusVariant } from '@/features/admin-orders/status';
import type { CustomerStatus, InternalStatus } from '@/features/admin-orders/types';

// Mirrors OrderStatusPanel's own SELECTABLE_STATUSES filter exactly — 'Payment Confirmed'
// and 'Order Created' are excluded from the manual dropdown since they're only ever set via
// their own dedicated confirm-dialog flows, never picked here (same rule the real page follows).
const SELECTABLE_STATUSES = INTERNAL_STATUS_VALUES.filter(
  (s) => s !== 'Payment Confirmed' && s !== 'Order Created',
);

export const DEMO_REFERENCE = 'AA-10482';

/**
 * Every stage the order-detail scene's story passes through, in order. Each beat in
 * beats.ts sets `stage` to move the story forward as the tour narrates it.
 *
 * Real sequence (owner-confirmed, 2026-08-08): the customer pays for the goods first, THEN
 * staff pay the supplier, THEN the order physically reaches our warehouse, THEN it's
 * weighed to finalize delivery cost, THEN staff contact the customer separately (outside
 * this portal — call/WhatsApp, no dedicated UI step) to collect the delivery payment now
 * that the real weight-based cost is known, and only then is it shipped.
 */
export type Stage =
  | 'awaiting-payment'
  | 'payment-confirmed'
  | 'paid-supplier'
  | 'arrived-at-warehouse'
  | 'weighed'
  | 'awaiting-delivery-payment'
  | 'shipped'
  | 'completed';

const STAGE_INTERNAL_STATUS: Record<Stage, InternalStatus> = {
  'awaiting-payment': 'Awaiting Payment',
  'payment-confirmed': 'Payment Confirmed',
  'paid-supplier': 'Payment Confirmed',
  'arrived-at-warehouse': 'Payment Confirmed',
  weighed: 'Payment Confirmed',
  'awaiting-delivery-payment': 'Payment Confirmed',
  shipped: 'Shipped',
  completed: 'Completed',
};

const STAGE_CUSTOMER_STATUS: Record<Stage, CustomerStatus> = {
  'awaiting-payment': 'Order Received',
  'payment-confirmed': 'Payment Confirmed',
  'paid-supplier': 'Payment Confirmed',
  'arrived-at-warehouse': 'Payment Confirmed',
  weighed: 'Payment Confirmed',
  'awaiting-delivery-payment': 'Payment Confirmed',
  shipped: 'Shipped',
  completed: 'Completed',
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[rgb(var(--muted-foreground))]">{label}</span>
      <span className="text-[rgb(var(--foreground))]">{value}</span>
    </div>
  );
}

// Ordered so "has this stage happened yet" can be a single index comparison instead of an
// error-prone OR chain repeating every downstream stage by name (that repetition is exactly
// how the story's step order drifted from reality the first time this was built).
const STAGE_ORDER: Stage[] = [
  'awaiting-payment',
  'payment-confirmed',
  'paid-supplier',
  'arrived-at-warehouse',
  'weighed',
  'awaiting-delivery-payment',
  'shipped',
  'completed',
];

function isAtOrPast(stage: Stage, milestone: Stage): boolean {
  return STAGE_ORDER.indexOf(stage) >= STAGE_ORDER.indexOf(milestone);
}

export function OrderDetailScene({ stage }: { stage: Stage }) {
  const isPaid = isAtOrPast(stage, 'payment-confirmed');
  const supplierPaid = isAtOrPast(stage, 'paid-supplier');
  const isArrived = isAtOrPast(stage, 'arrived-at-warehouse');
  const isWeighed = isAtOrPast(stage, 'weighed');
  const deliveryPaymentCollected = isAtOrPast(stage, 'shipped');
  const internalStatus = STAGE_INTERNAL_STATUS[stage];
  const customerStatus = STAGE_CUSTOMER_STATUS[stage];
  // Only set on the two beats that demonstrate an actual manual dropdown change (Shipped,
  // then Completed) — mirrors OrderStatusPanel's real "statusDirty" hint, which only shows
  // once the dropdown's picked value differs from what's saved.
  const previousInternalStatus: InternalStatus | null =
    stage === 'shipped' ? 'Payment Confirmed' : stage === 'completed' ? 'Shipped' : null;

  const deliveryUsd = isWeighed ? 38.5 : 45;
  const subtotalUsd = 120;
  const serviceFeeUsd = 15;
  const markupUsd = 10;
  // Mirrors the real page's calculateStorageFeeUsd: 7 days free from arrival, then
  // $0.50/day. Fixed at "9 days since arrival" once arrived, purely so the story has a
  // real, non-zero figure to point at by the delivery-payment beat (2 billable days -> $1).
  const storageFeeUsd = isArrived ? 1 : 0;
  // Grouped the same way the real order-detail page is (2026-08-08 update): "what we
  // charge for the service" vs. "what to collect from the customer for shipping/storage" —
  // the latter subtotal is exactly the figure the delivery-payment beat asks staff to read.
  const goodsAndServiceUsd = subtotalUsd + serviceFeeUsd + markupUsd;
  const deliveryAndStorageUsd = deliveryUsd + storageFeeUsd;
  const totalUsd = goodsAndServiceUsd + deliveryAndStorageUsd;

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <span className="text-sm text-[rgb(var(--muted-foreground))]">← All orders</span>
        <h1 className="font-display text-xl font-semibold text-[rgb(var(--foreground))]">{DEMO_REFERENCE}</h1>
        <span />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)_minmax(0,300px)]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 text-sm">
              <p className="font-medium text-[rgb(var(--foreground))]">Amina Yusuf</p>
              <p className="text-[rgb(var(--muted-foreground))]">amina@example.com</p>
              <p className="text-[rgb(var(--muted-foreground))]">+252 63 000 0000</p>
              <div className="mt-2 border-t border-[rgb(var(--border))] pt-2 text-[rgb(var(--muted-foreground))]">
                <p>26 Airport Road</p>
                <p>Hargeisa</p>
                <p>Somaliland</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 text-sm">
              <Row label="Payment method" value="Zaad" />
              <Row label="Created" value="08 Aug 2026, 09:14" />
              <Row label="Expires" value="10 Aug 2026, 09:14" />
              {isPaid && <Row label="Supplier order ID" value="HB-88213" />}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between border-b border-[rgb(var(--border))] pb-3 last:border-none last:pb-0">
                <div>
                  <p className="text-sm font-medium text-[rgb(var(--foreground))]">Stainless steel cookware set</p>
                  <p className="text-xs text-[rgb(var(--muted-foreground))]">Size: Large</p>
                  <p className="text-xs text-[rgb(var(--muted-foreground))]">Qty 2 × $60.00</p>
                </div>
                <p className="text-sm font-medium tabular-nums">$120.00</p>
              </div>
            </CardContent>
          </Card>

          <Card data-tour="pricing-card">
            <CardHeader>
              <CardTitle className="text-lg">Pricing breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="space-y-1.5">
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--muted-foreground))]">
                  Goods &amp; service
                </p>
                <Row label="Product cost" value={`$${subtotalUsd.toFixed(2)}`} />
                <Row label="Service fee" value={`$${serviceFeeUsd.toFixed(2)}`} />
                <Row label="Markup" value={`$${markupUsd.toFixed(2)}`} />
                <div className="flex items-center justify-between border-t border-[rgb(var(--border))] pt-1.5 font-medium">
                  <span>Subtotal</span>
                  <span className="tabular-nums">${goodsAndServiceUsd.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--muted-foreground))]">
                  Delivery &amp; storage
                </p>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[rgb(var(--muted-foreground))]">
                    Delivery
                    {!isWeighed && <Badge variant="warning">Estimated</Badge>}
                  </span>
                  <span className="text-[rgb(var(--foreground))]">${deliveryUsd.toFixed(2)}</span>
                </div>
                {storageFeeUsd > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[rgb(var(--muted-foreground))]">
                      Storage
                      <Badge variant="warning">Accruing</Badge>
                    </span>
                    <span className="text-[rgb(var(--foreground))]">${storageFeeUsd.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-[rgb(var(--border))] pt-1.5 font-medium">
                  <span>Subtotal</span>
                  <span className="tabular-nums">${deliveryAndStorageUsd.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-[rgb(var(--border))] pt-2 font-medium">
                <span>Total</span>
                <span className="tabular-nums">${totalUsd.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          <Card data-tour="weight-card" className={isWeighed ? undefined : 'border-[rgb(var(--warning))]/30'}>
            <CardHeader>
              <CardTitle className="text-lg">Order weight</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-[rgb(var(--muted-foreground))]">
                {isWeighed
                  ? 'Delivery cost is finalized based on this weight — 9.2 kg.'
                  : 'Delivery cost is currently an estimate. Weigh the order and enter the real weight to finalize it.'}
              </p>
              <div className="flex items-center gap-2">
                <div className="flex h-11 flex-1 items-center rounded-(--radius) border border-[rgb(var(--input))] px-3 text-sm text-[rgb(var(--foreground))]">
                  {isWeighed ? '9.2' : ''}
                </div>
                <span className="text-sm text-[rgb(var(--muted-foreground))]">kg</span>
              </div>
              <Button disabled className="w-full">
                {isWeighed ? 'Update weight' : 'Confirm weight'}
              </Button>
            </CardContent>
          </Card>

          <Card data-tour="warehouse-card" className={isArrived ? undefined : 'border-[rgb(var(--warning))]/30'}>
            <CardHeader>
              <CardTitle className="text-lg">Warehouse storage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-[rgb(var(--muted-foreground))]">
                {isArrived
                  ? 'Arrived 08 Aug 2026, 15:40 — first 7 days free.'
                  : 'Not yet arrived at the warehouse. Mark it once the order physically arrives to start the storage-fee clock (7 days free, then $0.50/day).'}
              </p>
              <Button disabled className="w-full">
                {isArrived ? 'Arrived' : 'Mark as arrived'}
              </Button>
            </CardContent>
          </Card>

          {isWeighed && (
            <Card
              data-tour="delivery-payment-note"
              className={deliveryPaymentCollected ? undefined : 'border-[rgb(var(--warning))]/30'}
            >
              <CardHeader>
                <CardTitle className="text-lg">Delivery payment</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[rgb(var(--muted-foreground))]">
                  {deliveryPaymentCollected
                    ? 'Collected — the customer paid the delivery and storage total shown in the pricing breakdown.'
                    : 'Not tracked in this portal. Add up Delivery and Storage from the pricing breakdown above — that combined figure is what to collect from the customer, by call or WhatsApp, before shipping.'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <div
            data-tour="customer-status-bar"
            className="flex items-center justify-between rounded-(--radius) border border-[rgb(var(--border))] bg-[rgb(var(--background))] px-4 py-3 text-sm"
          >
            <span className="text-[rgb(var(--muted-foreground))]">Customer-facing status</span>
            <Badge variant={statusVariant(customerStatus)}>{customerStatus}</Badge>
          </div>

          <Card data-tour="payment-card" className={isPaid ? undefined : 'border-[rgb(var(--accent))]/30'}>
            <CardHeader>
              <CardTitle className="text-lg">Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <label className="flex items-start gap-3">
                <Checkbox checked={isPaid} disabled />
                <span className="text-sm">
                  <span className="block font-medium text-[rgb(var(--foreground))]">Payment confirmed</span>
                  <span className="block text-[rgb(var(--muted-foreground))]">
                    {isPaid
                      ? 'Confirmed — a supplier order has been created for this order.'
                      : 'Automatically creates a supplier order for this order. This does not charge the supplier — see "Pay supplier" below for that separate step.'}
                  </span>
                </span>
              </label>
            </CardContent>
          </Card>

          {isPaid && (
            <Card data-tour="pay-now-card" className={supplierPaid ? undefined : 'border-[rgb(var(--accent))]/30'}>
              <CardHeader>
                <CardTitle className="text-lg">Pay supplier</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-[rgb(var(--muted-foreground))]">
                  {supplierPaid
                    ? 'Payment requested — the supplier has been charged and procurement is underway.'
                    : `A supplier order has been created for ${DEMO_REFERENCE} but not yet paid. Click below to charge the supplier and start procurement.`}
                </p>
                <Button variant="accent" disabled className="w-full">
                  {supplierPaid ? 'Payment requested' : 'Pay now'}
                </Button>
              </CardContent>
            </Card>
          )}

          <Card data-tour="manage-order-card">
            <CardHeader>
              <CardTitle className="text-lg">Manage order</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[rgb(var(--muted-foreground))]">
                  Internal status
                </label>
                <Select value={internalStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SELECTABLE_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {previousInternalStatus && (
                  <p className="mt-1.5 text-xs text-[rgb(var(--muted-foreground))]">
                    Currently <Badge variant={statusVariant(previousInternalStatus)}>{previousInternalStatus}</Badge>
                  </p>
                )}
              </div>
              <Button disabled={!previousInternalStatus} className="w-full">
                Save changes
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
