"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowUpRight,
  HelpCircle,
  LayoutDashboard,
  ListOrdered,
  Truck,
  LogOut,
  PackageCheck,
  Users,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from "lucide-react";
import { cn } from "@/core/utils";

interface AdminSidebarProps {
  userLabel: string;
  onSignOut: () => Promise<void>;
}

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Orders", icon: ListOrdered, exact: false },
  { href: "/admin/deliveries", label: "Deliveries", icon: Truck, exact: false },
  { href: "/admin/warehouse", label: "Warehouse", icon: PackageCheck, exact: false },
  { href: "/admin/staff", label: "Staff", icon: Users, exact: false },
  { href: "/admin/help", label: "Help Centre", icon: HelpCircle, exact: false },
];

function NavLinks({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Main navigation"
      className="flex-1 space-y-1.5 overflow-y-auto p-3"
    >
      {NAV_ITEMS.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            title={collapsed ? item.label : undefined}
            aria-label={collapsed ? item.label : undefined}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex min-h-11 items-center gap-3 rounded-(--radius) px-3 py-2 text-sm font-medium transition-colors",
              collapsed && "justify-center px-0",
              isActive
                ? "bg-[rgb(var(--accent))] text-white shadow-sm"
                : "text-[rgb(var(--muted-foreground))] hover:bg-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))]",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        );
      })}
      {!collapsed && (
        <div className="mt-8 border-t border-[rgb(var(--border))] pt-5">
          <Link
            href="/en"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-xl px-3 py-2 text-xs text-[rgb(var(--muted-foreground))] hover:bg-white"
          >
            Visit website <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </nav>
  );
}

function SignOutForm({
  userLabel,
  onSignOut,
  collapsed,
}: AdminSidebarProps & { collapsed: boolean }) {
  return (
    <div className="border-t border-[rgb(var(--border))] p-3">
      {!collapsed && (
        <p
          className="mb-2 truncate px-3 text-xs text-[rgb(var(--muted-foreground))]"
          title={userLabel}
        >
          {userLabel}
        </p>
      )}
      <form action={onSignOut}>
        <button
          type="submit"
          title={collapsed ? "Sign out" : undefined}
          className={cn(
            "flex w-full items-center gap-3 rounded-(--radius) px-3 py-2 text-sm font-medium text-[rgb(var(--muted-foreground))] transition-colors hover:bg-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))]",
            collapsed && "justify-center px-0",
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </form>
    </div>
  );
}

let fallbackCollapsed = false;
function readCollapsed() {
  try {
    return localStorage.getItem("aa-admin-sidebar") === "collapsed";
  } catch {
    return fallbackCollapsed;
  }
}
function subscribeSidebar(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("aa-sidebar-change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("aa-sidebar-change", callback);
  };
}

export function AdminSidebar({ userLabel, onSignOut }: AdminSidebarProps) {
  const collapsed = useSyncExternalStore(
    subscribeSidebar,
    readCollapsed,
    () => false,
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => {
      if (desktop.matches) setMobileOpen(false);
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  const [previousPath, setPreviousPath] = useState(pathname);
  if (pathname !== previousPath) {
    setPreviousPath(pathname);
    setMobileOpen(false);
  }

  function toggleSidebar() {
    fallbackCollapsed = !collapsed;
    try {
      localStorage.setItem(
        "aa-admin-sidebar",
        fallbackCollapsed ? "collapsed" : "expanded",
      );
    } catch {
      /* Use the in-memory preference when storage is unavailable. */
    }
    window.dispatchEvent(new Event("aa-sidebar-change"));
  }

  return (
    <>
      {/* Desktop/tablet: the always-visible, user-collapsible sidebar - unchanged from
          before, just now gated to `lg:` and up. Below that it was eating 64-240px of a
          phone's ~375px width with no way to reclaim it, which cramped every other page. */}
      <aside
        className={cn(
          "admin-sidebar sticky top-0 hidden h-screen shrink-0 flex-col border-r border-[rgb(var(--border))] bg-[rgb(var(--background))] transition-[width] duration-200 lg:flex",
          collapsed ? "w-20" : "w-64",
        )}
      >
        <div
          className={cn(
            "flex h-16 items-center border-b border-[rgb(var(--border))] px-4",
            collapsed ? "justify-center" : "justify-between",
          )}
        >
          {!collapsed && (
            <span className="font-display text-base font-semibold text-[rgb(var(--foreground))]">
              A&amp;A{" "}
              <span className="font-normal text-[rgb(var(--muted-foreground))]">
                workspace
              </span>
            </span>
          )}
          <button
            type="button"
            onClick={toggleSidebar}
            className="rounded-(--radius) p-1.5 text-[rgb(var(--muted-foreground))] hover:bg-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))]"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
        </div>
        <NavLinks collapsed={collapsed} />
        <SignOutForm
          userLabel={userLabel}
          onSignOut={onSignOut}
          collapsed={collapsed}
        />
      </aside>

      {/* Mobile/tablet: a slim top bar (the only chrome that existed below `lg` before was
          nothing at all - the sidebar was simply squeezed) with a hamburger that opens the
          same nav content as an off-canvas drawer, instead of an always-inline sidebar. */}
      <header className="admin-topbar sticky top-0 z-40 flex h-14 items-center justify-between border-b border-[rgb(var(--border))] bg-[rgb(var(--background))] px-4 lg:hidden">
        <span className="font-display text-base font-semibold text-[rgb(var(--foreground))]">
          A&amp;A{" "}
          <span className="font-normal text-[rgb(var(--muted-foreground))]">
            workspace
          </span>
        </span>
        <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
          <Dialog.Trigger asChild>
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-[rgb(var(--border))] text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))]"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="admin-menu-overlay fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
            <Dialog.Content
              className="admin-sidebar admin-mobile-drawer fixed inset-y-0 right-0 z-50 flex h-dvh w-80 max-w-[calc(100vw-2rem)] flex-col border-l border-[rgb(var(--border))] bg-[rgb(var(--background))] shadow-2xl"
              aria-describedby={undefined}
            >
              <div className="flex h-14 shrink-0 items-center justify-between border-b border-[rgb(var(--border))] px-4">
                <Dialog.Title className="font-display text-sm font-semibold text-[rgb(var(--foreground))]">
                  A&amp;A Admin
                </Dialog.Title>
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="flex h-11 w-11 items-center justify-center rounded-xl text-[rgb(var(--muted-foreground))] hover:bg-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))]"
                    aria-label="Close menu"
                  >
                    <X className="h-5 w-5" aria-hidden="true" />
                  </button>
                </Dialog.Close>
              </div>
              <NavLinks
                collapsed={false}
                onNavigate={() => setMobileOpen(false)}
              />
              <SignOutForm
                userLabel={userLabel}
                onSignOut={onSignOut}
                collapsed={false}
              />
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </header>
    </>
  );
}
