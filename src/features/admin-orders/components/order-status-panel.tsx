"use client";

import { formatOrderDate } from '../format';
import { ProcurementSummary, procurementStatusLabel } from "@/features/admin-automation/procurement-summary";
import { orderContentsIdentity } from "@/features/admin-automation/procurement-contract";
import { ReconcileForm } from "@/features/admin-automation/reconcile-form";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { ConfirmDialog } from "@/shared/components/ui/confirm-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import { useToast } from "@/shared/components/ui/toast";
import { INTERNAL_STATUS_VALUES, statusVariant } from "../status";
import type { InternalStatus, OrderDetail } from "../types";

// The secondary dropdown covers every other InternalStatus value manually settable by staff.
// 'Payment Confirmed' gets its own dedicated checkbox below (triggers supplier order
// creation), and 'Order Created' is excluded entirely â€” it's a system-set result of that
// automation succeeding, never something staff pick from a dropdown (same principle as
// 'Payment Confirmed', just without the money-movement risk that needs its own confirm dialog).
const SELECTABLE_STATUSES = INTERNAL_STATUS_VALUES.filter(
  (s) =>
    !["Payment Confirmed", "Order Created", "Awaiting Payment"].includes(s),
);

interface PatchResult {
  ok: boolean;
  etag?: string;
  errorMessage?: string;
  status?: number;
}

async function patchOrder(
  reference: string,
  path: string,
  body: Record<string, unknown>,
): Promise<PatchResult> {
  try {
    const res = await fetch(
      `/api/admin/orders/${encodeURIComponent(reference)}${path}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );
    const json = await res.json();
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        errorMessage: json?.error?.message ?? "Failed to save changes",
      };
    }
    return { ok: true, etag: json.data.etag };
  } catch {
    return {
      ok: false,
      errorMessage: "Failed to save changes â€” check your connection",
    };
  }
}

export function OrderStatusPanel({ order }: { order: OrderDetail }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [etag, setEtag] = useState(order.etag);
  const [internalStatus, setInternalStatus] = useState<InternalStatus>(
    order.fields.InternalStatus,
  );
  const [payNowRequested, setPayNowRequested] = useState(
    Boolean(
      order.fields.PayNowConfirmed ||
      order.operations?.some((o) => o.data.kind === "pay"),
    ),
  );
  const [notes, setNotes] = useState(order.fields.InternalNotes ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [payNowDialogOpen, setPayNowDialogOpen] = useState(false);

  // router.refresh() re-runs the server component and passes a fresh `order` prop, but
  // useState only reads its initializer on first mount â€” without this, the panel would keep
  // showing stale local state after any status change (e.g. changing to "Cancelled" appearing
  // to do nothing) even though the write succeeded and the server data is correct.
  useEffect(() => {
    setEtag(order.etag);
    setInternalStatus(order.fields.InternalStatus);
    setPayNowRequested(
      Boolean(
        order.fields.PayNowConfirmed ||
        order.operations?.some((o) => o.data.kind === "pay"),
      ),
    );
    setNotes(order.fields.InternalNotes ?? "");
  }, [order]);

  const createOperation = order.operations?.find(
    (o) => o.data.kind === "create",
  );
  const payOperation = order.operations?.find((o) => o.data.kind === "pay");
  const isAlreadyConfirmed =
    Boolean(createOperation) ||
    ["Payment Confirmed", "Order Created", "Shipped", "Completed"].includes(
      order.fields.InternalStatus,
    );
  const canConfirmPayment =
    !createOperation &&
    !order.fields.HiobuyOrderId &&
    !order.fields.ProcuredAt &&
    order.fields.InternalStatus === "Awaiting Payment";
  const isOrderCreated = order.fields.InternalStatus === "Order Created";
  const statusDirty = internalStatus !== order.fields.InternalStatus;
  const notesDirty = notes !== (order.fields.InternalNotes ?? "");
  const hasUnsavedChanges = statusDirty || notesDirty;
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    if (hasUnsavedChanges || confirmDialogOpen || payNowDialogOpen || isSaving)
      return;
    const timer = setInterval(() => {
      if (
        document.visibilityState === "visible" &&
        !document.querySelector("details[open]") &&
        !document.querySelector('[role="dialog"][data-state="open"]') &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(
          document.activeElement?.tagName ?? "",
        )
      )
        router.refresh();
    }, 5000);
    return () => clearInterval(timer);
  }, [
    hasUnsavedChanges,
    confirmDialogOpen,
    payNowDialogOpen,
    isSaving,
    router,
  ]);

  async function handleSave() {
    setIsSaving(true);
    try {
      const body: Record<string, unknown> = { etag };
      if (statusDirty) body.internalStatus = internalStatus;
      if (notesDirty) body.internalNotes = notes;

      const result = await patchOrder(
        order.fields.OrderReference,
        "/status",
        body,
      );
      if (!result.ok) {
        if (result.status === 409) {
          showToast(
            "This order was changed elsewhere â€” refresh to see the latest before saving.",
            "error",
          );
        } else {
          showToast(result.errorMessage ?? "Failed to save changes", "error");
        }
        return;
      }

      setEtag(result.etag!);
      showToast("Order updated");
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  }

  async function handleConfirmPayment() {
    const result = await patchOrder(order.fields.OrderReference, "/status", {
      etag,
      internalStatus: "Payment Confirmed",
      confirmPaymentConfirmed: true,
    });

    if (!result.ok) {
      if (result.status === 409) {
        showToast(
          result.errorMessage ??
            "Unable to confirm this order. Refresh and check its progress.",
          "error",
        );
      } else {
        showToast(result.errorMessage ?? "Failed to confirm payment", "error");
      }
      return;
    }

    setEtag(result.etag!);
    setInternalStatus("Payment Confirmed");
    showToast(
      "Payment confirmed â€” the supplier order will be created automatically.",
    );
    router.refresh();
  }

  async function handlePayNow() {
    const result = await patchOrder(order.fields.OrderReference, "/pay-now", {
      etag,
      confirmPayNow: true,
    });

    if (!result.ok) {
      if (result.status === 409) {
        showToast(
          result.errorMessage ?? "This order is no longer ready to pay.",
          "error",
        );
      } else {
        showToast(result.errorMessage ?? "Failed to request payment", "error");
      }
      return;
    }

    setEtag(result.etag!);
    setPayNowRequested(true);
    showToast("Payment requested â€” the supplier will be charged shortly.");
    router.refresh();
  }

  return (
    <>
      {(createOperation || payOperation) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Supplier</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {[createOperation, payOperation].filter(Boolean).map(
              (op) =>
                op && (
                  <div key={op.key}>
                    <p className="font-medium">
                      {op.data.kind === "create"
                        ? "Order creation"
                        : "Pay supplier"}
                      :{" "}
                      {procurementStatusLabel(op.state, op.data, orderContentsIdentity(order.fields))}
                    </p>
                    <p className="mt-1 text-xs text-[rgb(var(--muted-foreground))]">Requested by {op.data.actorName ?? op.data.actor} &middot; {formatOrderDate(op.data.requestedAt, true)}</p>
                    <ProcurementSummary data={op.data} contentsIdentity={orderContentsIdentity(order.fields)} />
                    {(op.data.requestId || op.data.previewRequestId) && (
                      <details className="mt-2 text-xs text-[rgb(var(--muted-foreground))]">
                        <summary className="cursor-pointer py-1">Support reference</summary>
                        <p className="mt-1 break-all">{op.data.requestId || op.data.previewRequestId}</p>
                      </details>
                    )}
                    {op.state === "Review" && op.data.message && (
                      <p
                        role="status"
                        className="mt-1 text-[rgb(var(--muted-foreground))]"
                      >
                        {op.data.message}
                      </p>
                    )}
                    {op.state === "Review" && <ReconcileForm operation={op} />}
                    {op.state === "Succeeded" &&
                      !op.data.synced &&
                      !op.data.legacy && <p>Updating order record...</p>}
                  </div>
                ),
            )}
          </CardContent>
        </Card>
      )}
      <Card
        className={
          isAlreadyConfirmed ? undefined : "border-[rgb(var(--accent))]/30"
        }
      >
        <CardHeader>
          <CardTitle className="text-lg">Payment</CardTitle>
        </CardHeader>
        <CardContent>
          <label className="flex cursor-pointer items-start gap-3">
            <Checkbox
              checked={isAlreadyConfirmed}
              disabled={!canConfirmPayment}
              onCheckedChange={(checked) => {
                if (checked === true && canConfirmPayment) {
                  setConfirmDialogOpen(true);
                }
              }}
            />
            <span className="text-sm">
              <span className="block font-medium text-[rgb(var(--foreground))]">
                Payment confirmed
              </span>
              <span className="block text-[rgb(var(--muted-foreground))]">
                {isAlreadyConfirmed
                  ? "Customer payment received."
                  : "Confirm receipt of the customer's payment to create the supplier order."}
              </span>
            </span>
          </label>
        </CardContent>
      </Card>

      {isOrderCreated && (
        <Card
          className={
            payNowRequested ? undefined : "border-[rgb(var(--accent))]/30"
          }
        >
          <CardHeader>
            <CardTitle className="text-lg">Pay supplier</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-[rgb(var(--muted-foreground))]">
              {payNowRequested
                ? "Supplier payment is processing."
                : `The supplier order is ready for payment.`}
            </p>
            <Button
              variant="accent"
              className="w-full"
              onClick={() => setPayNowDialogOpen(true)}
              disabled={payNowRequested}
            >
              {payNowRequested ? "Payment requested" : "Pay now"}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Manage order</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[rgb(var(--muted-foreground))]">
              Internal status
            </label>
            <Select
              value={internalStatus}
              onValueChange={(v) => setInternalStatus(v as InternalStatus)}
            >
              <SelectTrigger
                disabled={Boolean(order.fields.DeliveryGroupId)}
                aria-label="Internal status"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {!SELECTABLE_STATUSES.some(
                  (status) => status === internalStatus,
                ) && (
                  <SelectItem value={internalStatus} disabled>
                    {internalStatus}
                  </SelectItem>
                )}
                {SELECTABLE_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {statusDirty && (
              <p className="mt-1.5 text-xs text-[rgb(var(--muted-foreground))]">
                Currently{" "}
                <Badge variant={statusVariant(order.fields.InternalStatus)}>
                  {order.fields.InternalStatus}
                </Badge>
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-[rgb(var(--muted-foreground))]">
              Internal notes
            </label>
            <Textarea
              aria-label="Internal notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add a note for the teamâ€¦"
            />
          </div>

          {hasUnsavedChanges && (
            <div
              className="rounded-xl bg-[rgb(var(--warning-bg))] p-3 text-xs text-[rgb(var(--warning))]"
              role="status"
            >
              You have unsaved changes. Save before leaving this order.
            </div>
          )}
          <Button
            onClick={handleSave}
            disabled={isSaving || (!statusDirty && !notesDirty)}
            className="w-full"
          >
            {isSaving ? "Savingâ€¦" : "Save changes"}
          </Button>
          {hasUnsavedChanges && (
            <Button
              variant="ghost"
              className="w-full"
              disabled={isSaving}
              onClick={() => {
                setInternalStatus(order.fields.InternalStatus);
                setNotes(order.fields.InternalNotes ?? "");
              }}
            >
              Discard changes
            </Button>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        title="Confirm payment received?"
        description={`Confirm you received the customer's payment for ${order.fields.OrderReference}. This creates the supplier order. You will pay the supplier separately.`}
        confirmLabel="Yes, payment confirmed"
        onConfirm={handleConfirmPayment}
      />

      <ConfirmDialog
        open={payNowDialogOpen}
        onOpenChange={setPayNowDialogOpen}
        title="Pay supplier now?"
        description={`Pay the supplier for ${order.fields.OrderReference} using the linked account? This payment cannot be undone here.`}
        confirmLabel="Yes, pay now"
        onConfirm={handlePayNow}
      />
    </>
  );
}
