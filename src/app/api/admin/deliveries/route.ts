import { actorFromSession } from '@/features/admin-orders/audit';
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/core/admin-auth/session";
import { toErrorResponse } from "@/core/utils/http-error";
import { combineDelivery } from "@/features/admin-automation/deliveries";
const schema = z.object({
  references: z.array(z.string().min(1).max(100)).min(2).max(25),
  confirm: z.literal(true),
});
export async function POST(request: Request) {
  try {
    const session = await requireAdminSession();
    const input = schema.safeParse(await request.json());
    if (!input.success)
      return NextResponse.json(
        { error: { message: "Confirm the orders to combine." } },
        { status: 400 },
      );
    try {
      return NextResponse.json({
        data: await combineDelivery(
          input.data.references,
          actorFromSession(session),
        ),
      });
    } catch (error) {
      return NextResponse.json(
        {
          error: {
            message:
              error instanceof Error
                ? error.message
                : "Unable to combine orders.",
          },
        },
        { status: 409 },
      );
    }
  } catch (error) {
    return toErrorResponse(error);
  }
}
