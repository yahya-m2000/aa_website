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
  const [supplierId, setSupplierId] = useState(operation.data.supplierId ?? "");
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
            supplierId,
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
      showToast("Verified result recorded");
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
        Record verified supplier result
      </summary>
      <div className="mt-3 space-y-3">
        <p>
          Check HIOBuy/Taobao first. This records an existing{" "}
          {operation.data.kind === "pay"
            ? "successful payment"
            : "supplier order"}
          ; it does not create or pay anything. If nothing succeeded, resolve
          with the supplier before recording a result.
        </p>
        <label className="block">
          Supplier order ID
          <input
            value={supplierId}
            disabled={operation.data.kind === "pay"}
            onChange={(e) => setSupplierId(e.target.value)}
            className="mt-1 min-h-11 w-full rounded-lg border px-3"
          />
        </label>
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
          disabled={!supplierId.trim() || evidence.trim().length < 20}
          onClick={() => setOpen(true)}
        >
          Record verified result
        </Button>
        <ConfirmDialog
          open={open}
          onOpenChange={setOpen}
          title="Record verified success?"
          description="Only continue after verifying the supplier order and, for payment, the actual payment receipt. This changes the CMS record without making a supplier request."
          confirmLabel="I verified the result"
          onConfirm={reconcile}
        />
      </div>
    </details>
  );
}
