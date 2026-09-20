import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/core/admin-auth/session";
import { toErrorResponse } from "@/core/utils/http-error";
import {
  createRecord,
  findRecord,
  replaceRecord,
  type OperationData,
} from "@/features/admin-automation/records";
const schema = z.object({
  key: z.string().max(250),
  etag: z.string().min(1),
  supplierId: z.string().min(1).max(150),
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
              "Enter the verified supplier ID and evidence (at least 20 characters).",
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
    if (op.data.kind === "pay" && op.data.supplierId !== d.supplierId)
      return NextResponse.json(
        {
          error: {
            message:
              "Payment must be reconciled against its original supplier order.",
          },
        },
        { status: 409 },
      );
    const owner = await createRecord(
      "operations",
      `supplier-owner:${d.supplierId}`,
      "SupplierOwner",
      reference,
      { reference },
    );
    if (owner.reference !== reference)
      return NextResponse.json(
        {
          error: {
            message: "This supplier ID is already linked to another order.",
          },
        },
        { status: 409 },
      );
    const result = await replaceRecord("operations", op, "Succeeded", {
      ...op.data,
      supplierId: d.supplierId,
      legacy: false,
      synced: false,
      notification: "Skipped",
      updatedAt: new Date().toISOString(),
      message: `Verified by ${session.user?.email ?? "unknown"}: ${d.evidence}`,
    });
    return NextResponse.json({ data: result });
  } catch (error) {
    return toErrorResponse(error);
  }
}
