"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/components/ui/button";
import { ConfirmDialog } from "@/shared/components/ui/confirm-dialog";
import { useToast } from "@/shared/components/ui/toast";
export function CombineButton({ references }: { references: string[] }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();
  async function combine() {
    try {
      const response = await fetch("/api/admin/deliveries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ references, confirm: true }),
      });
      const json = await response.json();
      if (!response.ok) {
        showToast(
          json.error?.message ??
            "Unable to group orders. Check Deliveries for unfinished groups.",
          "error",
        );
        return;
      }
      router.push(`/admin/deliveries/${json.data.key}`);
    } catch {
      showToast(
        "Connection lost. Refresh to check the saved result before trying again.",
        "error",
      );
    }
  }
  return (
    <>
      <Button
        variant="outline"
        disabled={references.length < 2 || references.length > 25}
        onClick={() => setOpen(true)}
      >
        Combine delivery
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Combine delivery?"
        description={`Group ${references.length} orders for one recipient and destination: ${references.join(", ")}. You will enter one combined weight and collect delivery payment once.`}
        confirmLabel="Combine orders"
        onConfirm={combine}
      />
    </>
  );
}
