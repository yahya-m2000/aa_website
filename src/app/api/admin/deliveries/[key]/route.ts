import { actorFromSession } from '@/features/admin-orders/audit';
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/core/admin-auth/session";
import { toErrorResponse } from "@/core/utils/http-error";
import { updateDelivery } from "@/features/admin-automation/deliveries";
const schema = z.object({
  etag: z.string().min(1),
  action: z.enum(["resume", "dissolve", "weigh", "paid", "ship", "complete"]),
  weightKg: z.number().positive().max(10000).optional(),
  tracking: z.string().max(250).optional(),
  confirm: z.literal(true),
});
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  try {
    const session = await requireAdminSession();
    const { key } = await params;
    const input = schema.safeParse(await request.json());
    if (!input.success)
      return NextResponse.json(
        {
          error: {
            message: "Check the delivery details and confirm the action.",
          },
        },
        { status: 400 },
      );
    try {
      const d = input.data;
      return NextResponse.json({
        data: await updateDelivery(
          key,
          d.etag,
          d.action,
          actorFromSession(session),
          d.weightKg,
          d.tracking,
        ),
      });
    } catch (error) {
      return NextResponse.json(
        {
          error: {
            message:
              error instanceof Error
                ? error.message
                : "Unable to update delivery.",
          },
        },
        { status: 409 },
      );
    }
  } catch (error) {
    return toErrorResponse(error);
  }
}
