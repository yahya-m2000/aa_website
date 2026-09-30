import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireStaffSession } from '@/core/admin-auth/session';
import { toErrorResponse } from '@/core/utils/http-error';
import { recordOrderWeight, WarehouseActionError } from '@/features/admin-orders/warehouse-actions';
import { getWarehouseOrder, WAREHOUSE_ACTIVE_STATUSES } from '@/features/warehouse/warehouse.repository';

const schema = z.object({ etag: z.string().min(1), weightKg: z.number().positive().max(1000) });

export async function PATCH(request: Request, { params }: { params: Promise<{ reference: string }> }) {
  try {
    const { actor } = await requireStaffSession();
    const reference = decodeURIComponent((await params).reference);
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: { code: 'VALIDATION_ERROR' } }, { status: 400 });
    const order = await getWarehouseOrder(reference);
    if (order && !order.arrivedAt)
      return NextResponse.json({ error: { code: 'NOT_ARRIVED' } }, { status: 409 });
    const result = await recordOrderWeight({
      reference,
      etag: parsed.data.etag,
      weightKg: parsed.data.weightKg,
      actor,
      allowedStatuses: WAREHOUSE_ACTIVE_STATUSES,
    });
    // Delivery charges and totals are deliberately not returned to warehouse staff.
    return NextResponse.json({ data: { etag: result.etag, weightKg: parsed.data.weightKg } });
  } catch (error) {
    if (error instanceof WarehouseActionError)
      return NextResponse.json({ error: { code: error.code } }, { status: error.status });
    return toErrorResponse(error);
  }
}
