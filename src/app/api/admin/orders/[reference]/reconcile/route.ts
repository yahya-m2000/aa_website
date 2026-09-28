import { actorFromSession, recordActivity } from '@/features/admin-orders/audit';
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/core/admin-auth/session";
import { toErrorResponse } from "@/core/utils/http-error";
import {
  findRecord,
  replaceRecord,
  type OperationData,
} from "@/features/admin-automation/records";
const schema = z.object({
  key: z.string().max(250),
  etag: z.string().min(1),
  evidence: z.string().trim().min(20).max(2000),
  confirm: z.literal(true),
});
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ reference: string }> },
) {
  try {
    const session = await requireAdminSession();
    const { reference } = await params;
    const input = schema.safeParse(await request.json());
    if (!input.success)
      return NextResponse.json(
        {
          error: {
            message:
              "Enter the support reference or reconciliation note (at least 20 characters).",
          },
        },
        { status: 400 },
      );
    const d = input.data;
    const op = await findRecord<OperationData>("operations", d.key);
    if (
      !op ||
      op.reference !== reference ||
      op.etag !== d.etag ||
      op.state !== "Review"
    )
      return NextResponse.json(
        {
          error: {
            message: "The operation changed. Refresh before resolving.",
          },
        },
        { status: 409 },
      );
    if (!op.data.manifest || !op.data.supplierIds?.length) {
      return NextResponse.json({ error: { message: 'This legacy/incomplete order needs a supplier audit. A single ID or staff note cannot establish complete procurement.' } }, { status: 409 });
    }
    // Staff may request evidence refresh, never assert whole-order success themselves.
    const result = await replaceRecord("operations", op, "Review", {
      ...op.data, nextCheckAt: undefined, synced: false,
      updatedAt: new Date().toISOString(),
      message: `Read-only reconciliation requested by ${session.user?.email ?? "unknown"}: ${d.evidence}`,
    });
    await recordActivity({ reference: op.reference, actor: actorFromSession(session), action: 'Requested supplier reconciliation', details: d.evidence });
    return NextResponse.json({ data: result });
  } catch (error) {
    return toErrorResponse(error);
  }
}
