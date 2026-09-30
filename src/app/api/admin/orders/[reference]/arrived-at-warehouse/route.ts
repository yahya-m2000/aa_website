import { actorFromSession } from '@/features/admin-orders/audit';
import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/core/admin-auth/session';
import { toErrorResponse } from '@/core/utils/http-error';
import { markArrivedAtWarehouseSchema } from '@/features/admin-orders/schemas';
import { markOrderArrived, WarehouseActionError } from '@/features/admin-orders/warehouse-actions';

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

    const result = await markOrderArrived({
      reference: decodeURIComponent(reference),
      etag: parsed.data.etag,
      actor: actorFromSession(session),
    });

    console.log(`[admin-orders] ${session.user?.email ?? 'unknown'} marked order ${reference} as arrived at warehouse: ${result.arrivedAt}`);

    return NextResponse.json({ success: true, data: { etag: result.etag, arrivedAtWarehouseAt: result.arrivedAt } });
  } catch (error) {
    if (error instanceof WarehouseActionError)
      return NextResponse.json({ error: { code: error.code, message: error.message } }, { status: error.status });
    return toErrorResponse(error);
  }
}
