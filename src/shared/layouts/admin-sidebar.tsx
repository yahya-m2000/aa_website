'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { HelpCircle, LayoutDashboard, ListOrdered, LogOut, Menu, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react';
import { cn } from '@/core/utils';

interface AdminSidebarProps {
  userLabel: string;
  onSignOut: () => Promise<void>;
}

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/orders', label: 'Orders', icon: ListOrdered, exact: false },
  { href: '/admin/help', label: 'Help Centre', icon: HelpCircle, exact: false },
];

function NavLinks({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex-1 space-y-1 p-3">
      {NAV_ITEMS.map((item) => {
        const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            title={collapsed ? item.label : undefined}
            className={cn(
              'flex items-center gap-3 rounded-(--radius) px-3 py-2 text-sm font-medium transition-colors',
              collapsed && 'justify-center px-0',
              isActive
                ? 'bg-[rgb(var(--primary))] text-white'
                : 'text-[rgb(var(--muted-foreground))] hover:bg-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))]'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

function SignOutForm({ userLabel, onSignOut, collapsed }: AdminSidebarProps & { collapsed: boolean }) {
  return (
    <div className="border-t border-[rgb(var(--border))] p-3">
      {!collapsed && (
        <p className="mb-2 truncate px-3 text-xs text-[rgb(var(--muted-foreground))]" title={userLabel}>
          {userLabel}
        </p>
      )}
      <form action={onSignOut}>
        <button
          type="submit"
          title={collapsed ? 'Sign out' : undefined}
          className={cn(
            'flex w-full items-center gap-3 rounded-(--radius) px-3 py-2 text-sm font-medium text-[rgb(var(--muted-foreground))] transition-colors hover:bg-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))]',
            collapsed && 'justify-center px-0'
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </form>
    </div>
  );
}

export function AdminSidebar({ userLabel, onSignOut }: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // A route change (tapping a nav link) should close the mobile drawer — Link's onClick
  // alone isn't enough if the target route is already active (no navigation event fires),
  // so this covers that edge case too.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Desktop/tablet: the always-visible, user-collapsible sidebar - unchanged from
          before, just now gated to `lg:` and up. Below that it was eating 64-240px of a
          phone's ~375px width with no way to reclaim it, which cramped every other page. */}
      <aside
        className={cn(
          'sticky top-0 hidden h-screen shrink-0 flex-col border-r border-[rgb(var(--border))] bg-[rgb(var(--background))] transition-[width] duration-200 lg:flex',
          collapsed ? 'w-16' : 'w-60'
        )}
      >
        <div
          className={cn(
            'flex h-16 items-center border-b border-[rgb(var(--border))] px-4',
            collapsed ? 'justify-center' : 'justify-between'
          )}
        >
          {!collapsed && <span className="font-display text-sm font-semibold text-[rgb(var(--foreground))]">A&amp;A Admin</span>}
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className="rounded-(--radius) p-1.5 text-[rgb(var(--muted-foreground))] hover:bg-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))]"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        </div>
        <NavLinks collapsed={collapsed} />
        <SignOutForm userLabel={userLabel} onSignOut={onSignOut} collapsed={collapsed} />
      </aside>

      {/* Mobile/tablet: a slim top bar (the only chrome that existed below `lg` before was
          nothing at all - the sidebar was simply squeezed) with a hamburger that opens the
          same nav content as an off-canvas drawer, instead of an always-inline sidebar. */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-[rgb(var(--border))] bg-[rgb(var(--background))] px-4 lg:hidden">
        <span className="font-display text-sm font-semibold text-[rgb(var(--foreground))]">A&amp;A Admin</span>
        <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
          <Dialog.Trigger asChild>
            <button
              type="button"
              className="rounded-(--radius) p-2 text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))]"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
            <Dialog.Content
              className="fixed inset-y-0 left-0 z-50 flex h-full w-72 max-w-[85vw] flex-col border-r border-[rgb(var(--border))] bg-[rgb(var(--background))]"
              aria-describedby={undefined}
            >
              <div className="flex h-14 items-center justify-between border-b border-[rgb(var(--border))] px-4">
                <Dialog.Title className="font-display text-sm font-semibold text-[rgb(var(--foreground))]">
                  A&amp;A Admin
                </Dialog.Title>
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="rounded-(--radius) p-1.5 text-[rgb(var(--muted-foreground))] hover:bg-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))]"
                    aria-label="Close menu"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </Dialog.Close>
              </div>
              <NavLinks collapsed={false} onNavigate={() => setMobileOpen(false)} />
              <SignOutForm userLabel={userLabel} onSignOut={onSignOut} collapsed={false} />
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </header>
    </>
  );
}
