'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { HelpCircle, LayoutDashboard, ListOrdered, LogOut, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
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

export function AdminSidebar({ userLabel, onSignOut }: AdminSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'sticky top-0 flex h-screen shrink-0 flex-col border-r border-[rgb(var(--border))] bg-[rgb(var(--background))] transition-[width] duration-200',
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

      <nav className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
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
    </aside>
  );
}
