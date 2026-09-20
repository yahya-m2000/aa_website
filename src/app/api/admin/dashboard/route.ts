import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/core/admin-auth/session";
import { toErrorResponse } from "@/core/utils/http-error";
import { parseSelection } from "@/features/admin-dashboard/reporting";
import { getDashboardReport } from "@/features/admin-dashboard/reporting.repository";

export async function GET(request: NextRequest) {
  try {
    await requireAdminSession();
    let selection;
    try {
      selection = parseSelection(request.nextUrl.searchParams);
    } catch {
      return NextResponse.json(
        { error: { message: "Choose a valid reporting period." } },
        { status: 400 },
      );
    }
    const { report } = await getDashboardReport(selection);
    return NextResponse.json(
      { success: true, data: report },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return toErrorResponse(error);
  }
}
