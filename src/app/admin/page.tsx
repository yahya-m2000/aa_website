import { redirect } from "next/navigation";
import { auth } from "@/core/admin-auth/auth";
import { DashboardContent } from "@/features/admin-dashboard/components/dashboard-content";
import { getDashboardReport } from "@/features/admin-dashboard/reporting.repository";
import {
  defaultSelection,
  parseSelection,
} from "@/features/admin-dashboard/reporting";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  const params = await searchParams;
  const query = new URLSearchParams();
  for (const key of ["period", "year", "month", "quarter"])
    if (typeof params[key] === "string") query.set(key, params[key]);
  let selection;
  let notice: string | undefined;
  try {
    selection = parseSelection(query);
  } catch {
    selection = defaultSelection();
    notice = "Invalid reporting period. Showing the last 30 days.";
  }
  const { report } = await getDashboardReport(selection);
  return (
    <div className="admin-page-transition mx-auto max-w-[1600px] px-4 py-10 sm:px-6">
      <h1 className="mb-6 font-display">Dashboard</h1>
      {notice && (
        <p role="status" className="mb-4 text-sm text-[rgb(var(--warning))]">
          {notice}
        </p>
      )}
      <DashboardContent
        key={JSON.stringify(selection)}
        initialReport={report}
      />
    </div>
  );
}
