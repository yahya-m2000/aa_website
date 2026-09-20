"use client";

import { Copy } from "lucide-react";
import { useToast } from "@/shared/components/ui/toast";

export function CopyButton({ value, label }: { value: string; label: string }) {
  const { showToast } = useToast();
  return (
    <button
      type="button"
      aria-label={`Copy ${label}`}
      title={`Copy ${label}`}
      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[rgb(var(--muted-foreground))] hover:bg-[rgb(var(--muted))]"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          showToast(`${label} copied`);
        } catch {
          showToast(
            "Could not copy. Select and copy the text manually.",
            "error",
          );
        }
      }}
    >
      <Copy className="h-4 w-4" />
    </button>
  );
}
