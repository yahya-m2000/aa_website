import { requestOperation } from '@/features/admin-automation/commands';
import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/core/admin-auth/session';
import { toErrorResponse } from '@/core/utils/http-error';
import { getOrderItemByReference } from '@/features/admin-orders/orders.repository';
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

    const operation = await requestOperation('pay', item, session.user?.email ?? 'unknown', etag);
    return NextResponse.json({ success: true, data: { etag: item['@odata.etag'], operation } }, { status: 202 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
