import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/core/admin-auth/session';
import { toErrorResponse } from '@/core/utils/http-error';
import { getOrderItemByReference, updateOrderItemFields } from '@/features/admin-orders/orders.repository';
import { markArrivedAtWarehouseSchema } from '@/features/admin-orders/schemas';

// Staff-entered warehouse-arrival timestamp (owner-supplied storage-fee rule, 2026-07-28) —
// mirrors the weight route's pattern exactly, since no automated warehouse-scanning
// integration exists either. Storage fee itself is never written here or anywhere — it's
// always live-computed from this timestamp (calculateStorageFeeUsd in aa_catalog/server's
// pricing.service.ts, mirrored for display in ArrivedAtWarehouseCard), so there's nothing
// to recalculate/store on this write beyond the timestamp itself.
export async function PATCH(request: Request, { params }: { params: Promise<{ reference: string }> }) {
  try {
    const session = await requireAdminSession();
    const { reference } = await params;

    const body = await request.json();
    const parsed = markArrivedAtWarehouseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message ?? 'Invalid payload' } },
        { status: 400 },
      );
    }
    const { etag } = parsed.data;

    const item = await getOrderItemByReference(decodeURIComponent(reference));
    if (!item) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Order not found' } }, { status: 404 });
    }

    if (item.fields.ArrivedAtWarehouseAt) {
      return NextResponse.json(
        { error: { code: 'ALREADY_ARRIVED', message: 'This order is already marked as arrived at the warehouse.' } },
        { status: 409 },
      );
    }

    const arrivedAt = new Date().toISOString();
    const newEtag = await updateOrderItemFields(item.id, etag, {
      ArrivedAtWarehouseAt: arrivedAt,
    });

    const actor = session.user?.email ?? 'unknown';
    console.log(`[admin-orders] ${actor} marked order ${reference} as arrived at warehouse: ${arrivedAt}`);

    return NextResponse.json({ success: true, data: { etag: newEtag, arrivedAtWarehouseAt: arrivedAt } });
  } catch (error) {
    return toErrorResponse(error);
  }
}
