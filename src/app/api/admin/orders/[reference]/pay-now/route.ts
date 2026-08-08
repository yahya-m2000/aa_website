import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/core/admin-auth/session';
import { toErrorResponse } from '@/core/utils/http-error';
import { getOrderItemByReference, updateOrderItemFields } from '@/features/admin-orders/orders.repository';
import { payNowSchema } from '@/features/admin-orders/schemas';

// Distinct, later, explicit action from "Payment Confirmed" (2026-07-25 procurement split —
// a combined create+pay function used to spend real money the moment Payment Confirmed was
// ticked, with no separate review step first). This route only sets PayNowConfirmed (a
// boolean, renamed from the old PayNowRequestedAt timestamp field — see types.ts's comment
// for why), a signal field a dedicated Power Automate flow watches (while InternalStatus is
// still 'Order Created') to call the aa_catalog server's separate POST
// /orders/:reference/pay, which is the only code path that actually calls HIOBuy's
// orders/pay. This route itself never calls HIOBuy or the aa_catalog server directly — same
// "admin API never calls Power Automate/HIOBuy directly" boundary as the Payment Confirmed
// write path.
export async function PATCH(request: Request, { params }: { params: Promise<{ reference: string }> }) {
  try {
    const session = await requireAdminSession();
    const { reference } = await params;

    const body = await request.json();
    const parsed = payNowSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message ?? 'Invalid payload' } },
        { status: 400 },
      );
    }
    const { etag, confirmPayNow } = parsed.data;

    // Same "yes I really mean this" wire-payload requirement as Payment Confirmed — the
    // confirm dialog on the client is not itself a safeguard against a replayed/forged request.
    if (confirmPayNow !== true) {
      return NextResponse.json(
        { error: { code: 'CONFIRMATION_REQUIRED', message: 'confirmPayNow must be true.' } },
        { status: 400 },
      );
    }

    const item = await getOrderItemByReference(decodeURIComponent(reference));
    if (!item) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Order not found' } }, { status: 404 });
    }

    // Re-read server-side before writing: only orders currently sitting at 'Order Created'
    // (HIOBuy order exists, not yet paid) are eligible. Refuses a re-click after payment has
    // already moved the order back to 'Payment Confirmed', and refuses clicking Pay Now before
    // the HIOBuy order has even been created yet.
    if (item.fields.InternalStatus !== 'Order Created') {
      return NextResponse.json(
        {
          error: {
            code: 'WRONG_STATUS',
            message: `Order is currently "${item.fields.InternalStatus}" — Pay Now is only available once the HIOBuy order has been created (status "Order Created").`,
          },
        },
        { status: 409 },
      );
    }

    const newEtag = await updateOrderItemFields(item.id, etag, {
      PayNowConfirmed: true,
    });

    const actor = session.user?.email ?? 'unknown';
    console.log(`[admin-orders] PAY NOW REQUESTED: order ${reference} requested by ${actor} at ${new Date().toISOString()}`);

    return NextResponse.json({ success: true, data: { etag: newEtag } });
  } catch (error) {
    return toErrorResponse(error);
  }
}
