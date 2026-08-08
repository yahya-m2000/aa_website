import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/core/admin-auth/session';
import { toErrorResponse } from '@/core/utils/http-error';
import { getOrderDetailByReference } from '@/features/admin-orders/orders.repository';

export async function GET(_request: Request, { params }: { params: Promise<{ reference: string }> }) {
  try {
    await requireAdminSession();
    const { reference } = await params;

    const order = await getOrderDetailByReference(reference);
    if (!order) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Order not found' } }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    return toErrorResponse(error);
  }
}
