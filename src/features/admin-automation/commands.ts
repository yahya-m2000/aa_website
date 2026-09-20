import { createHash } from "node:crypto";
import {
  createRecord,
  findRecord,
  operationKey,
  workerControl,
  type OperationData,
} from "./records";
import type { GraphListItem } from "../admin-orders/types";
export class OperationRequestError extends Error {}

export async function requestOperation(
  kind: "create" | "pay",
  item: GraphListItem,
  actor: string,
  expectedEtag: string,
) {
  const f = item.fields;
  const key = operationKey(kind, f.OrderReference, f.HiobuyOrderId);
  const existing = await findRecord<OperationData>("operations", key);
  if (existing) {
    if (existing.reference !== f.OrderReference)
      throw new OperationRequestError(
        "Supplier order is already assigned to another order.",
      );
    return existing;
  }
  if (item["@odata.etag"] !== expectedEtag)
    throw new OperationRequestError(
      "This order changed. Refresh before confirming.",
    );
  const control = await workerControl();
  if (
    !control?.data.enabled ||
    !control.data.heartbeat ||
    !Number.isFinite(Date.parse(control.data.heartbeat)) ||
    Date.now() - Date.parse(control.data.heartbeat) > 120000
  )
    throw new OperationRequestError(
      "Order automation is temporarily unavailable. Please try again shortly. No supplier request was made.",
    );
  if (
    kind === "create" &&
    (f.InternalStatus !== "Awaiting Payment" ||
      f.HiobuyOrderId ||
      f.ProcuredAt ||
      f.PayNowConfirmed)
  )
    throw new OperationRequestError(
      "Payment has already been confirmed or this order requires review.",
    );
  if (
    kind === "pay" &&
    (f.InternalStatus !== "Order Created" ||
      !f.HiobuyOrderId ||
      f.PayNowConfirmed ||
      f.HiobuyPurchaseStatus)
  )
    throw new OperationRequestError(
      "Supplier payment has already been requested or requires review.",
    );
  const now = new Date().toISOString();
  const created = await createRecord<OperationData>(
    "operations",
    key,
    "Queued",
    f.OrderReference,
    {
      kind,
      actor,
      requestedAt: now,
      updatedAt: now,
      supplierId: f.HiobuyOrderId,
      approvedFingerprint: createHash("sha256")
        .update(
          JSON.stringify([
            f.LineItemsJson,
            f.SubtotalUsd,
            f.ServiceFeeUsd,
            f.MarkupUsd,
            f.HiobuyOrderId ?? null,
          ]),
        )
        .digest("hex"),
    },
  );
  if (created.reference !== f.OrderReference)
    throw new OperationRequestError(
      "Supplier order is already assigned to another order.",
    );
  return created;
}
