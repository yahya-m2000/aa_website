import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/core/admin-auth/session';
import { toErrorResponse } from '@/core/utils/http-error';
import { bulkUpdateInternalStatus } from '@/features/admin-orders/orders.repository';
import { bulkUpdateStatusSchema } from '@/features/admin-orders/schemas';

export async function POST(request: Request) {
  try {
    const session = await requireAdminSession();

    const body = await request.json();
    const parsed = bulkUpdateStatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message ?? 'Invalid payload' } },
        { status: 400 },
      );
    }
    const { references, internalStatus } = parsed.data;

    const results = await bulkUpdateInternalStatus(references, internalStatus as never);

    const actor = session.user?.email ?? 'unknown';
    const succeeded = results.filter((r) => r.ok).map((r) => r.reference);
    const failed = results.filter((r) => !r.ok);
    console.log(
      `[admin-orders] ${actor} bulk-updated ${succeeded.length}/${references.length} orders to InternalStatus=${internalStatus}${
        failed.length > 0 ? ` (failed: ${failed.map((f) => f.reference).join(', ')})` : ''
      }`,
    );

    return NextResponse.json({ success: true, data: { results } });
  } catch (error) {
    return toErrorResponse(error);
  }
}
