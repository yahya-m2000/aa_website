import { requireAdminSession } from "@/core/admin-auth/session";
import { StaffManager } from "@/features/admin-staff/components/staff-manager";
import { listStaffAccounts, staffListConfigured, summarize } from "@/features/admin-staff/staff.repository";

export const metadata = { title: "Staff — A&A Admin" };

export default async function StaffPage() {
  await requireAdminSession();
  const configured = staffListConfigured();
  const accounts = configured ? (await listStaffAccounts()).map((account) => summarize(account)) : [];
  return (
    <div className="admin-page-transition mx-auto max-w-[1600px] px-4 py-10 sm:px-6">
      <h1 className="mb-2 font-display text-2xl font-semibold">Staff</h1>
      <p className="mb-8 max-w-2xl text-sm text-[rgb(var(--muted-foreground))]">
        Warehouse accounts sign in with a username and password and can only use the Warehouse section: marking
        orders as arrived, recording weights, and weighing or dispatching combined deliveries. They never see prices
        or customer contact details.
      </p>
      {configured ? (
        <StaffManager accounts={accounts} />
      ) : (
        <p className="admin-panel max-w-xl text-sm">
          Staff accounts aren&apos;t set up yet. Run <code>node scripts/provision-staff.mjs</code>, then set
          <code> ADMIN_GRAPH_STAFF_LIST_ID</code> to the list ID it prints.
        </p>
      )}
    </div>
  );
}
