import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireStaffSession } from '@/core/admin-auth/session';
import { toErrorResponse } from '@/core/utils/http-error';
import { updateDelivery } from '@/features/admin-automation/deliveries';

// Warehouse staff may weigh a combined delivery and dispatch it once an admin has confirmed the
// delivery payment. Confirming payment, dissolving and completing stay admin-only.
const schema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('weigh'), etag: z.string().min(1), weightKg: z.number().positive().max(10000) }),
  z.object({ action: z.literal('ship'), etag: z.string().min(1), tracking: z.string().trim().min(3).max(250) }),
]);

export async function PATCH(request: Request, { params }: { params: Promise<{ key: string }> }) {
  try {
    const { actor } = await requireStaffSession();
    const { key } = await params;
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: { code: 'VALIDATION_ERROR' } }, { status: 400 });
    const input = parsed.data;
    try {
      const saved = await updateDelivery(
        decodeURIComponent(key),
        input.etag,
        input.action,
        actor,
        input.action === 'weigh' ? input.weightKg : undefined,
        input.action === 'ship' ? input.tracking : undefined,
      );
      return NextResponse.json({ data: { etag: saved.etag, state: saved.state } });
    } catch (error) {
      // updateDelivery reports business-rule failures (stale etag, unpaid, not ready) as plain Errors.
      console.warn('[warehouse] delivery action rejected', key, input.action, error instanceof Error ? error.message : error);
      return NextResponse.json({ error: { code: 'DELIVERY_REJECTED' } }, { status: 409 });
    }
  } catch (error) {
    return toErrorResponse(error);
  }
}
