'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { ConfirmDialog } from '@/shared/components/ui/confirm-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Textarea } from '@/shared/components/ui/textarea';
import { useToast } from '@/shared/components/ui/toast';
import { INTERNAL_STATUS_VALUES, statusVariant } from '../status';
import type { InternalStatus, OrderDetail } from '../types';

// The secondary dropdown covers every other InternalStatus value manually settable by staff.
// 'Payment Confirmed' gets its own dedicated checkbox below (triggers supplier order
// creation), and 'Order Created' is excluded entirely — it's a system-set result of that
// automation succeeding, never something staff pick from a dropdown (same principle as
// 'Payment Confirmed', just without the money-movement risk that needs its own confirm dialog).
const SELECTABLE_STATUSES = INTERNAL_STATUS_VALUES.filter(
  (s) => s !== 'Payment Confirmed' && s !== 'Order Created',
);

interface PatchResult {
  ok: boolean;
  etag?: string;
  errorMessage?: string;
  status?: number;
}

async function patchOrder(reference: string, path: string, body: Record<string, unknown>): Promise<PatchResult> {
  try {
    const res = await fetch(`/api/admin/orders/${encodeURIComponent(reference)}${path}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) {
      return { ok: false, status: res.status, errorMessage: json?.error?.message ?? 'Failed to save changes' };
    }
    return { ok: true, etag: json.data.etag };
  } catch {
    return { ok: false, errorMessage: 'Failed to save changes — check your connection' };
  }
}

export function OrderStatusPanel({ order }: { order: OrderDetail }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [etag, setEtag] = useState(order.etag);
  const [internalStatus, setInternalStatus] = useState<InternalStatus>(order.fields.InternalStatus);
  const [payNowRequested, setPayNowRequested] = useState(Boolean(order.fields.PayNowConfirmed));
  const [notes, setNotes] = useState(order.fields.InternalNotes ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [payNowDialogOpen, setPayNowDialogOpen] = useState(false);

  // router.refresh() re-runs the server component and passes a fresh `order` prop, but
  // useState only reads its initializer on first mount — without this, the panel would keep
  // showing stale local state after any status change (e.g. changing to "Cancelled" appearing
  // to do nothing) even though the write succeeded and the server data is correct.
  useEffect(() => {
    setEtag(order.etag);
    setInternalStatus(order.fields.InternalStatus);
    setPayNowRequested(Boolean(order.fields.PayNowConfirmed));
    setNotes(order.fields.InternalNotes ?? '');
  }, [order]);

  const isAlreadyConfirmed = internalStatus === 'Payment Confirmed' || internalStatus === 'Order Created';
  const isOrderCreated = internalStatus === 'Order Created';
  const statusDirty = internalStatus !== order.fields.InternalStatus;
  const notesDirty = notes !== (order.fields.InternalNotes ?? '');

  async function handleSave() {
    setIsSaving(true);
    try {
      const body: Record<string, unknown> = { etag };
      if (statusDirty) body.internalStatus = internalStatus;
      if (notesDirty) body.internalNotes = notes;

      const result = await patchOrder(order.fields.OrderReference, '/status', body);
      if (!result.ok) {
        if (result.status === 409) {
          showToast('This order was changed elsewhere — refresh to see the latest before saving.', 'error');
        } else {
          showToast(result.errorMessage ?? 'Failed to save changes', 'error');
        }
        return;
      }

      setEtag(result.etag!);
      showToast('Order updated');
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  }

  async function handleConfirmPayment() {
    const result = await patchOrder(order.fields.OrderReference, '/status', {
      etag,
      internalStatus: 'Payment Confirmed',
      confirmPaymentConfirmed: true,
    });

    if (!result.ok) {
      if (result.status === 409) {
        showToast('This order is already marked Payment Confirmed.', 'error');
      } else {
        showToast(result.errorMessage ?? 'Failed to confirm payment', 'error');
      }
      return;
    }

    setEtag(result.etag!);
    setInternalStatus('Payment Confirmed');
    showToast('Payment confirmed — the supplier order will be created automatically.');
    router.refresh();
  }

  async function handlePayNow() {
    const result = await patchOrder(order.fields.OrderReference, '/pay-now', {
      etag,
      confirmPayNow: true,
    });

    if (!result.ok) {
      if (result.status === 409) {
        showToast(result.errorMessage ?? 'This order is no longer ready to pay.', 'error');
      } else {
        showToast(result.errorMessage ?? 'Failed to request payment', 'error');
      }
      return;
    }

    setEtag(result.etag!);
    setPayNowRequested(true);
    showToast('Payment requested — the supplier will be charged shortly.');
    router.refresh();
  }

  return (
    <>
      <Card className={isAlreadyConfirmed ? undefined : 'border-[rgb(var(--accent))]/30'}>
        <CardHeader>
          <CardTitle className="text-lg">Payment</CardTitle>
        </CardHeader>
        <CardContent>
          <label className="flex cursor-pointer items-start gap-3">
            <Checkbox
              checked={isAlreadyConfirmed}
              disabled={isAlreadyConfirmed}
              onCheckedChange={(checked) => {
                if (checked === true && !isAlreadyConfirmed) {
                  setConfirmDialogOpen(true);
                }
              }}
            />
            <span className="text-sm">
              <span className="block font-medium text-[rgb(var(--foreground))]">Payment confirmed</span>
              <span className="block text-[rgb(var(--muted-foreground))]">
                {isAlreadyConfirmed
                  ? 'Confirmed — a supplier order has been created for this order (not yet paid).'
                  : 'Automatically creates a supplier order for this order. This does not charge the supplier — see "Pay supplier" below for that separate step.'}
              </span>
            </span>
          </label>
        </CardContent>
      </Card>

      {isOrderCreated && (
        <Card className={payNowRequested ? undefined : 'border-[rgb(var(--accent))]/30'}>
          <CardHeader>
            <CardTitle className="text-lg">Pay supplier</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-[rgb(var(--muted-foreground))]">
              {payNowRequested
                ? 'Payment requested — waiting for the automation to charge the supplier and move this order back to Payment Confirmed.'
                : `A supplier order has been created for ${order.fields.OrderReference} but not yet paid. Click below to charge the supplier and start procurement.`}
            </p>
            <Button
              variant="accent"
              className="w-full"
              onClick={() => setPayNowDialogOpen(true)}
              disabled={payNowRequested}
            >
              {payNowRequested ? 'Payment requested' : 'Pay now'}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Manage order</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[rgb(var(--muted-foreground))]">
              Internal status
            </label>
            <Select value={internalStatus} onValueChange={(v) => setInternalStatus(v as InternalStatus)}>
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
            {statusDirty && (
              <p className="mt-1.5 text-xs text-[rgb(var(--muted-foreground))]">
                Currently <Badge variant={statusVariant(order.fields.InternalStatus)}>{order.fields.InternalStatus}</Badge>
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-[rgb(var(--muted-foreground))]">
              Internal notes
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add a note for the team…"
            />
          </div>

          <Button onClick={handleSave} disabled={isSaving || (!statusDirty && !notesDirty)} className="w-full">
            {isSaving ? 'Saving…' : 'Save changes'}
          </Button>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        title="Confirm payment received?"
        description={`This marks ${order.fields.OrderReference} as Payment Confirmed and automatically creates a supplier order for it. This does NOT charge the supplier — a separate "Pay now" step is required after this to actually spend money.`}
        confirmLabel="Yes, payment confirmed"
        onConfirm={handleConfirmPayment}
      />

      <ConfirmDialog
        open={payNowDialogOpen}
        onOpenChange={setPayNowDialogOpen}
        title="Pay supplier now?"
        description={`This will charge the linked supplier account to pay for ${order.fields.OrderReference}'s supplier order and start procurement. This spends real money and cannot be undone from here.`}
        confirmLabel="Yes, pay now"
        onConfirm={handlePayNow}
      />
    </>
  );
}
