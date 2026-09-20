"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

export function OrdersRefresh({ paused = false }: { paused?: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  useEffect(() => {
    const timer = setInterval(() => {
      const active = document.activeElement;
      const editing =
        active instanceof HTMLElement &&
        (["INPUT", "TEXTAREA", "SELECT"].includes(active.tagName) ||
          active.isContentEditable);
      if (
        paused ||
        pending ||
        editing ||
        document.visibilityState !== "visible" ||
        !navigator.onLine ||
        document.querySelector('[role="dialog"][data-state="open"]')
      )
        return;
      startTransition(() => router.refresh());
    }, 60000);
    return () => clearInterval(timer);
  }, [router, paused, pending]);
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[rgb(var(--border))] px-4 py-2">
      <p role="status" className="text-xs text-[rgb(var(--muted-foreground))]">
        {pending
          ? "Refreshing orders…"
          : paused
            ? "Auto-refresh paused during selection"
            : "Auto-refresh every minute"}
      </p>
      <Button
        variant="ghost"
        size="sm"
        className="min-h-11"
        disabled={pending || paused}
        onClick={() => {
          if (!document.querySelector('[role="dialog"][data-state="open"]'))
            startTransition(() => router.refresh());
        }}
      >
        <RefreshCw className={`h-3.5 w-3.5 ${pending ? "animate-spin" : ""}`} />
        Refresh
      </Button>
    </div>
  );
}
