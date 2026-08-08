import { NextResponse } from 'next/server';
import { UnauthorizedError } from '@/core/admin-auth/session';
import { GraphConflictError, GraphRequestError } from '@/core/graph/graph.client';

export function toErrorResponse(error: unknown): NextResponse {
  if (error instanceof UnauthorizedError) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: error.message } }, { status: 401 });
  }
  if (error instanceof GraphConflictError) {
    return NextResponse.json({ error: { code: 'CONFLICT', message: error.message } }, { status: 409 });
  }
  if (error instanceof GraphRequestError) {
    return NextResponse.json(
      { error: { code: 'GRAPH_ERROR', message: error.message } },
      { status: error.statusCode ?? 502 },
    );
  }
  console.error('[admin-api] Unhandled error:', error);
  return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' } }, { status: 500 });
}
