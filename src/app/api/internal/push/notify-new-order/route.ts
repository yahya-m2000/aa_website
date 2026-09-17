import { NextResponse } from 'next/server';
import { z } from 'zod';
import { notifyStaff } from '@/core/push/push.service';

const notifySchema = z.object({
  orderReference: z.string().min(1),
  customerFullName: z.string().min(1),
  totalUsd: z.number(),
});

// Called by aa_catalog's server (order.service.ts, right after an order is persisted to
// SharePoint) — not an admin-session route, since the caller is a server, not a signed-in staff
// browser. Authenticated via a shared secret header instead (PUSH_NOTIFY_SECRET, an independent
// value from aa_catalog's own INTERNAL_TASK_SECRET — same "separate copy, not routed through
// the other repo's auth" precedent as ADMIN_WHATSAPP_*/ADMIN_GRAPH_* elsewhere in this app).
export async function POST(request: Request) {
  const expectedSecret = process.env.PUSH_NOTIFY_SECRET;
  if (!expectedSecret) {
    console.error('[push] PUSH_NOTIFY_SECRET is not configured; rejecting notify-new-order call.');
    return NextResponse.json({ error: { code: 'NOT_CONFIGURED', message: 'Push notify is not configured' } }, { status: 503 });
  }

  const providedSecret = request.headers.get('x-push-notify-secret');
  if (providedSecret !== expectedSecret) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Invalid secret' } }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = notifySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message ?? 'Invalid payload' } },
        { status: 400 },
      );
    }

    const { orderReference, customerFullName, totalUsd } = parsed.data;
    await notifyStaff({
      title: 'New order received',
      body: `${orderReference} — ${customerFullName} — $${totalUsd.toFixed(2)}`,
      url: `/admin/orders/${encodeURIComponent(orderReference)}`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[push] Failed to process notify-new-order:', error);
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' } }, { status: 500 });
  }
}
