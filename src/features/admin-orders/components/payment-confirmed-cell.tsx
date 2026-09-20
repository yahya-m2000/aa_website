"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { ConfirmDialog } from "@/shared/components/ui/confirm-dialog";
import { useToast } from "@/shared/components/ui/toast";
import type { InternalStatus, OrderListRow } from "../types";

// Statuses past the point where "confirm payment" is still a meaningful action — procurement
// is already underway or the order is in a final state, so re-confirming payment here would
// either be a no-op the server already rejects (Payment Confirmed/Order Created themselves) or
// nonsensical (Shipped/Completed are downstream of payment; Cancelled/Expired/Needs Review mean
// this order shouldn't be moved forward from this control at all).
const NOT_CONFIRMABLE_STATUSES = new Set<InternalStatus>([
  "Payment Confirmed",
  "Order Created",
  "Shipped",
  "Completed",
  "Cancelled",
  "Expired",
  "Needs Review",
]);

interface PaymentConfirmedCellProps {
  order: OrderListRow;
  etag: string;
  internalStatus: InternalStatus;
  onUpdated: (etag: string, internalStatus: InternalStatus) => void;
}

export function PaymentConfirmedCell({
  order,
  etag,
  internalStatus,
  onUpdated,
}: PaymentConfirmedCellProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const isConfirmed =
    Boolean(order.paymentRequested) ||
    ["Payment Confirmed", "Order Created", "Shipped", "Completed"].includes(
      internalStatus,
    );
  const isDisabled =
    Boolean(order.paymentRequested) ||
    NOT_CONFIRMABLE_STATUSES.has(internalStatus);

  async function handleConfirmPayment() {
    const res = await fetch(
      `/api/admin/orders/${encodeURIComponent(order.reference)}/status`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          etag,
          internalStatus: "Payment Confirmed",
          confirmPaymentConfirmed: true,
        }),
      },
    );
    const json = await res.json();
    if (!res.ok) {
      showToast(
        json?.error?.message ??
          "Unable to confirm payment. Refresh to check the order.",
        "error",
      );
      return;
    }
    onUpdated(json.data.etag, "Payment Confirmed");
    showToast("Payment confirmed — procurement automation has been notified");
    router.refresh();
  }

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      title={
        isDisabled && !isConfirmed
          ? `Can't confirm payment while order is ${internalStatus}`
          : undefined
      }
    >
      <Checkbox
        aria-label={`Confirm payment for ${order.reference}`}
        checked={isConfirmed}
        disabled={isDisabled}
        onCheckedChange={(checked) => {
          if (checked === true && !isDisabled) {
            setConfirmOpen(true);
          }
        }}
      />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Confirm payment received?"
        description={`This immediately marks ${order.reference} as Payment Confirmed and triggers the live procurement automation. This cannot be undone from here.`}
        confirmLabel="Yes, payment confirmed"
        onConfirm={handleConfirmPayment}
      />
    </div>
  );
}
