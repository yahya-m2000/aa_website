'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { AdminSidebar } from './admin-sidebar';

// Routes that render their own full-screen experience and must not be wrapped in the
// sidebar shell — currently just the interactive tour, which needs to feel like a
// distinct "mode" rather than a page embedded in the normal admin frame.
const FULLSCREEN_ROUTES = ['/admin/help/tour'];

interface AdminChromeProps {
  userLabel: string;
  onSignOut: () => Promise<void>;
  children: ReactNode;
}

export function AdminChrome({ userLabel, onSignOut, children }: AdminChromeProps) {
  const pathname = usePathname();
  const isFullscreen = FULLSCREEN_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));

  if (isFullscreen) {
    return <>{children}</>;
  }

  return (
    <div className="flex">
      <AdminSidebar userLabel={userLabel} onSignOut={onSignOut} />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
