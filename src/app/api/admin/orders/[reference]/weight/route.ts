import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/core/admin-auth/session';
import { toErrorResponse } from '@/core/utils/http-error';
import { getOrderItemByReference, updateOrderItemFields } from '@/features/admin-orders/orders.repository';
import { updateWeightSchema } from '@/features/admin-orders/schemas';

// Mirrors aa_catalog/server/src/config/pricing.config.ts's DELIVERY_RATE_USD_PER_KG default
// (owner-supplied rule, 2026-07-25: delivery is a flat $/kg rate). If the backend's rate
// changes, update this to match — same duplication rationale as the app's own display-only
// pricing mirrors (no shared package between the two repos).
const DELIVERY_RATE_USD_PER_KG = 13;

// Staff-entered real order weight (owner-supplied pricing rules, 2026-07-25 — no product/SKU
// weight data exists anywhere upstream, so staff weigh the order once it's being processed).
// Recalculates DeliveryUsd and TotalUsd from the real weight and flips IsDeliveryEstimated to
// false — this is the only place that clears the "estimated" flag set at checkout.
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

    const item = await getOrderItemByReference(decodeURIComponent(reference));
    if (!item) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Order not found' } }, { status: 404 });
    }

    const newDeliveryUsd = Math.round(weightKg * DELIVERY_RATE_USD_PER_KG * 100) / 100;
    const deliveryDelta = newDeliveryUsd - item.fields.DeliveryUsd;
    const newTotalUsd = Math.round((item.fields.TotalUsd + deliveryDelta) * 100) / 100;

    const newEtag = await updateOrderItemFields(item.id, etag, {
      WeightKg: weightKg,
      DeliveryUsd: newDeliveryUsd,
      IsDeliveryEstimated: false,
      TotalUsd: newTotalUsd,
    });

    const actor = session.user?.email ?? 'unknown';
    console.log(
      `[admin-orders] ${actor} set real weight on order ${reference}: ${weightKg}kg -> delivery $${newDeliveryUsd.toFixed(2)}`,
    );

    return NextResponse.json({ success: true, data: { etag: newEtag, deliveryUsd: newDeliveryUsd, totalUsd: newTotalUsd } });
  } catch (error) {
    return toErrorResponse(error);
  }
}
