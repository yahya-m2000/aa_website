"use client";

import Link from "next/link";
import { ChevronRight, HelpCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { usePushSubscription } from "@/core/push/use-push-subscription";
import { AdminSidebar } from "./admin-sidebar";

// Routes that render their own full-screen experience and must not be wrapped in the
// sidebar shell — currently just the interactive tour, which needs to feel like a
// distinct "mode" rather than a page embedded in the normal admin frame.
const FULLSCREEN_ROUTES = ["/admin/help/tour"];

interface AdminChromeProps {
  userLabel: string;
  onSignOut: () => Promise<void>;
  children: ReactNode;
}

export function AdminChrome({
  userLabel,
  onSignOut,
  children,
}: AdminChromeProps) {
  const pathname = usePathname();
  const isFullscreen = FULLSCREEN_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
  usePushSubscription();

  if (isFullscreen) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col lg:flex-row">
      <a href="#admin-main" className="admin-skip">
        Skip to workspace
      </a>
      <AdminSidebar userLabel={userLabel} onSignOut={onSignOut} />
      <div className="min-w-0 flex-1">
        <header className="admin-topbar flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-[rgb(var(--border))] px-4 py-3 sm:px-6 xl:px-10">
          <nav
            aria-label="Breadcrumb"
            className="inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-xs text-[rgb(var(--muted-foreground))]"
          >
            <Link href="/admin" className="inline-flex min-h-11 items-center hover:text-[rgb(var(--accent))]">
              Workspace
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="font-medium text-[rgb(var(--foreground))]">
              {pathname.startsWith("/admin/orders/")
                ? "Order details"
                : pathname.startsWith("/admin/orders")
                  ? "Orders"
                  : pathname.startsWith("/admin/deliveries")
                    ? "Deliveries"
                    : pathname.startsWith("/admin/warehouse")
                    ? "Warehouse"
                    : pathname.startsWith("/admin/staff")
                    ? "Staff"
                    : pathname.startsWith("/admin/help")
                      ? "Help Centre"
                      : "Overview"}
            </span>
          </nav>
          <Link
            href="/admin/help"
            className="inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-xs text-[rgb(var(--muted-foreground))]"
          >
            <HelpCircle className="h-4 w-4" /> Help
          </Link>
        </header>
        <main id="admin-main" tabIndex={-1} className="min-w-0 outline-none">
          {children}
        </main>
      </div>
    </div>
  );
}
