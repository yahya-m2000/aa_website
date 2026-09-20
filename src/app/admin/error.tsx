"use client";

import Link from "next/link";
import { Button } from "@/shared/components/ui/button";

export default function AdminError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-xl px-5 py-16">
      <div className="admin-panel">
        <p className="admin-eyebrow">Workspace unavailable</p>
        <h1 className="mt-3">Unable to load page</h1>
        <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--muted-foreground))]">
          This page could not be loaded. Check your connection and try again. If
          this happened after saving, check the current order before repeating
          the action.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={reset}>Try again</Button>
          <Button asChild variant="ghost">
            <Link href="/admin/help?topic=common-issues">Troubleshooting</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
