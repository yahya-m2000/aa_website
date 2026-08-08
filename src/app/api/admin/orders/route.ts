import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/core/admin-auth/session';
import { toErrorResponse } from '@/core/utils/http-error';
import { listOrders } from '@/features/admin-orders/orders.repository';

export async function GET(request: NextRequest) {
  try {
    await requireAdminSession();

    const { searchParams } = new URL(request.url);
    const pageSizeParam = Number(searchParams.get('pageSize'));
    const pageSize = pageSizeParam === 50 ? 50 : 25;
    const cursor = searchParams.get('cursor') ?? undefined;
    const status = searchParams.get('status') ?? undefined;
    const search = searchParams.get('search') ?? undefined;

    const result = await listOrders({ pageSize, cursor, status, search });
    return NextResponse.json({
      success: true,
      data: result.items,
      pageInfo: { nextCursor: result.nextCursor, hasMore: result.nextCursor !== null },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
