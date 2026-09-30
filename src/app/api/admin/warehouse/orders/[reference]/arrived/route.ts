import { NextResponse } from 'next/server';
import { requireStaffSession } from '@/core/admin-auth/session';
import { toErrorResponse } from '@/core/utils/http-error';
import { markArrivedAtWarehouseSchema } from '@/features/admin-orders/schemas';
import { markOrderArrived, WarehouseActionError } from '@/features/admin-orders/warehouse-actions';
import { WAREHOUSE_ACTIVE_STATUSES } from '@/features/warehouse/warehouse.repository';

export async function PATCH(request: Request, { params }: { params: Promise<{ reference: string }> }) {
  try {
    const { actor } = await requireStaffSession();
    const { reference } = await params;
    const parsed = markArrivedAtWarehouseSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: { code: 'VALIDATION_ERROR' } }, { status: 400 });
    const result = await markOrderArrived({
      reference: decodeURIComponent(reference),
      etag: parsed.data.etag,
      actor,
      allowedStatuses: WAREHOUSE_ACTIVE_STATUSES,
    });
    return NextResponse.json({ data: { etag: result.etag, arrivedAt: result.arrivedAt } });
  } catch (error) {
    if (error instanceof WarehouseActionError)
      return NextResponse.json({ error: { code: error.code } }, { status: error.status });
    return toErrorResponse(error);
  }
}
