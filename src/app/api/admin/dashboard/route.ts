import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/core/admin-auth/session';
import { toErrorResponse } from '@/core/utils/http-error';
import { getOrderStats } from '@/features/admin-orders/orders.repository';

const DEFAULT_RANGE_DAYS = 30;

export async function GET(request: NextRequest) {
  try {
    await requireAdminSession();

    const { searchParams } = new URL(request.url);
    const now = new Date();
    const to = searchParams.get('to') ?? now.toISOString();
    const from =
      searchParams.get('from') ?? new Date(now.getTime() - DEFAULT_RANGE_DAYS * 24 * 60 * 60 * 1000).toISOString();

    const stats = await getOrderStats(from, to);
    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    return toErrorResponse(error);
  }
}
