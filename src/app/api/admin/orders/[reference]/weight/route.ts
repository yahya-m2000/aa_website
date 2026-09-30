import { actorFromSession } from '@/features/admin-orders/audit';
import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/core/admin-auth/session';
import { toErrorResponse } from '@/core/utils/http-error';
import { updateWeightSchema } from '@/features/admin-orders/schemas';
import { recordOrderWeight, WarehouseActionError } from '@/features/admin-orders/warehouse-actions';

export async function PATCH(request: Request, { params }: { params: Promise<{ reference: string }> }) {
  try {
    const session = await requireAdminSession();
    const { reference } = await params;

    const body = await request.json();
    const parsed = updateWeightSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message ?? 'Invalid payload' } },
        { status: 400 },
      );
    }
    const { etag, weightKg } = parsed.data;

    const result = await recordOrderWeight({
      reference: decodeURIComponent(reference),
      etag,
      weightKg,
      actor: actorFromSession(session),
    });

    console.log(
      `[admin-orders] ${session.user?.email ?? 'unknown'} set real weight on order ${reference}: ${weightKg}kg -> delivery $${result.deliveryUsd.toFixed(2)}`,
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof WarehouseActionError)
      return NextResponse.json({ error: { code: error.code, message: error.message } }, { status: error.status });
    return toErrorResponse(error);
  }
}
