import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/core/admin-auth/session';
import { toErrorResponse } from '@/core/utils/http-error';
import { sendOrderStatusWhatsApp } from '@/core/whatsapp/whatsapp.service';
import type { WhatsAppNotifiableStatus } from '@/core/whatsapp/whatsapp.types';
import { getOrderItemByReference, updateOrderItemFields } from '@/features/admin-orders/orders.repository';
import { updateOrderStatusSchema } from '@/features/admin-orders/schemas';
import { mapInternalToCustomerStatus } from '@/features/admin-orders/statusMapping';
import type { OrderListItemFields } from '@/features/admin-orders/types';

// Only 'Payment Confirmed'/'Shipped'/'Completed'/'Cancelled' ever trigger a WhatsApp send —
// 'Order Received' uses a push notification instead (sent from aa_catalog's server at checkout
// time, not from here), and 'Expired' never notifies at all.
function isWhatsAppNotifiable(status: string): status is WhatsAppNotifiableStatus {
  return status === 'Payment Confirmed' || status === 'Shipped' || status === 'Completed' || status === 'Cancelled';
}

export async function PATCH(request: Request, { params }: { params: Promise<{ reference: string }> }) {
  try {
    const session = await requireAdminSession();
    const { reference } = await params;

    const body = await request.json();
    const parsed = updateOrderStatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message ?? 'Invalid payload' } },
        { status: 400 },
      );
    }
    const input = parsed.data;
    const isPaymentConfirmedTransition = input.internalStatus === 'Payment Confirmed';

    // Payment Confirmed is the exact field the live Power Automate -> HIOBuy procurement
    // automation watches — ticking it here triggers real money-moving action, identically to
    // editing it directly in SharePoint. The confirm dialog on the client is not itself a
    // safeguard (a replayed/forged request could skip straight to this route), so the "yes I
    // really mean this" intent must be part of the wire payload: reject unless
    // confirmPaymentConfirmed is explicitly true.
    if (isPaymentConfirmedTransition && input.confirmPaymentConfirmed !== true) {
      return NextResponse.json(
        {
          error: {
            code: 'CONFIRMATION_REQUIRED',
            message: 'confirmPaymentConfirmed must be true to set InternalStatus to Payment Confirmed.',
          },
        },
        { status: 400 },
      );
    }

    const item = await getOrderItemByReference(decodeURIComponent(reference));
    if (!item) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Order not found' } }, { status: 404 });
    }

    // Re-read the current InternalStatus server-side (never trust the client's view) before
    // writing; if it's already Payment Confirmed, this is a no-op transition, not a real one —
    // reject it rather than silently re-triggering the procurement automation a second time
    // (e.g. a rapid double-click, or a stale page re-submitting).
    if (isPaymentConfirmedTransition && item.fields.InternalStatus === 'Payment Confirmed') {
      return NextResponse.json(
        {
          error: {
            code: 'ALREADY_CONFIRMED',
            message: 'This order is already marked Payment Confirmed.',
          },
        },
        { status: 409 },
      );
    }

    // CustomerStatus is always derived from internalStatus, never client-supplied (2026-07-26,
    // WhatsApp-notification project) — see statusMapping.ts. null means "Order Created" or
    // "Needs Review": leave CustomerStatus untouched, and don't notify the customer of anything.
    const derivedCustomerStatus = input.internalStatus
      ? mapInternalToCustomerStatus(input.internalStatus as OrderListItemFields['InternalStatus'])
      : null;

    const fields: Partial<OrderListItemFields> = {};
    if (input.internalStatus) fields.InternalStatus = input.internalStatus as OrderListItemFields['InternalStatus'];
    if (derivedCustomerStatus) fields.CustomerStatus = derivedCustomerStatus;
    if (input.internalNotes !== undefined) fields.InternalNotes = input.internalNotes;

    const newEtag = await updateOrderItemFields(item.id, input.etag, fields);

    const actor = session.user?.email ?? 'unknown';
    if (isPaymentConfirmedTransition) {
      // Minimum audit trail for a write that triggers real money-spending automation.
      console.log(
        `[admin-orders] PAYMENT CONFIRMED: order ${reference} confirmed by ${actor} at ${new Date().toISOString()}`,
      );
    } else {
      console.log(`[admin-orders] ${actor} updated order ${reference}: ${JSON.stringify(Object.keys(fields))}`);
    }

    // Fire-and-forget, matching order.service.ts's email-delivery pattern exactly — the
    // SharePoint write above has already succeeded, nothing here may affect that outcome.
    if (derivedCustomerStatus && isWhatsAppNotifiable(derivedCustomerStatus)) {
      void sendOrderStatusWhatsApp(derivedCustomerStatus, {
        customerName: item.fields.CustomerFullName,
        customerPhone: item.fields.CustomerPhone,
        orderReference: item.fields.OrderReference,
      });
    }

    return NextResponse.json({ success: true, data: { etag: newEtag } });
  } catch (error) {
    return toErrorResponse(error);
  }
}
