"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/components/ui/button";
import { ConfirmDialog } from "@/shared/components/ui/confirm-dialog";
import { useToast } from "@/shared/components/ui/toast";
import type { DurableRecord, OperationData } from "./records";
export function ReconcileForm({
  operation,
}: {
  operation: DurableRecord<OperationData>;
}) {
  const [evidence, setEvidence] = useState("");
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();
  async function reconcile() {
    try {
      const response = await fetch(
        `/api/admin/orders/${encodeURIComponent(operation.reference)}/reconcile`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            key: operation.key,
            etag: operation.etag,
            evidence,
            confirm: true,
          }),
        },
      );
      const json = await response.json();
      if (!response.ok) {
        showToast(json.error?.message ?? "Unable to save result.", "error");
        return;
      }
      showToast("Supplier recheck requested");
      router.refresh();
    } catch {
      showToast(
        "Connection lost. Refresh to check whether the result was saved.",
        "error",
      );
    }
  }
  return (
    <details className="mt-3 rounded-lg border p-3">
      <summary className="cursor-pointer">
        Recheck supplier evidence
      </summary>
      <div className="mt-3 space-y-3">
        <p>This requests a read-only check of every recorded supplier purchase. It does not create orders, retry payments, or mark an order paid without complete evidence.</p>
        <label className="block">
          Verification evidence
          <textarea
            value={evidence}
            onChange={(e) => setEvidence(e.target.value)}
            maxLength={2000}
            rows={3}
            className="mt-1 w-full rounded-lg border p-3"
            placeholder="Payment receipt, supplier confirmation or support reference"
          />
        </label>
        <Button
          variant="outline"
          disabled={!operation.data.manifest || !operation.data.supplierIds?.length || evidence.trim().length < 20}
          onClick={() => setOpen(true)}
        >
          Recheck supplier evidence
        </Button>
        <ConfirmDialog
          open={open}
          onOpenChange={setOpen}
          title="Recheck all supplier purchases?"
          description="The worker will read supplier records and verify all items, amounts and payments. Missing evidence remains in review. No money will be spent."
          confirmLabel="Request recheck"
          onConfirm={reconcile}
        />
      </div>
    </details>
  );
}
