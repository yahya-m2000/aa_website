import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/core/admin-auth/session";
import { toErrorResponse } from "@/core/utils/http-error";
import { parseSelection } from "@/features/admin-dashboard/reporting";
import { getDashboardReport } from "@/features/admin-dashboard/reporting.repository";
import { createReportWorkbook } from "@/features/admin-dashboard/report-workbook";

export const runtime = "nodejs";
export const maxDuration = 60;
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
    const { report, orders } = await getDashboardReport(selection);
    const workbook = await createReportWorkbook(report, orders);
    const bytes = await workbook.xlsx.writeBuffer();
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="AA-report-${report.period.label.replaceAll(" ", "-")}.xlsx"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
