import type { OrderListItemFields } from "./types";

// Display-only mirror of the existing warehouse policy; no fees are persisted here.
export function storageFeeForDisplay(
  arrivedAt: string | undefined,
  now = new Date(),
): number {
  if (!arrivedAt) return 0;
  const timestamp = Date.parse(arrivedAt);
  if (!Number.isFinite(timestamp)) return 0;
  return (
    Math.max(0, Math.floor((now.getTime() - timestamp) / 86400000) - 7) * 0.5
  );
}

function validAmount(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

/** Display-only: legacy checkout estimates remain untouched in SharePoint. */
export function getPricingDisplay(
  fields: Pick<
    OrderListItemFields,
    | "SubtotalUsd"
    | "ServiceFeeUsd"
    | "MarkupUsd"
    | "DeliveryUsd"
    | "IsDeliveryEstimated"
  >,
  storageFeeUsd: number,
) {
  const goods = [fields.SubtotalUsd, fields.ServiceFeeUsd, fields.MarkupUsd];
  const goodsAndServiceUsd = goods.every(validAmount)
    ? goods.reduce((sum, value) => sum + value, 0)
    : null;
  // An absent flag is not evidence that a legacy delivery charge is final.
  const deliveryPending =
    fields.IsDeliveryEstimated !== false || !validAmount(fields.DeliveryUsd);
  const deliveryUsd = deliveryPending ? null : fields.DeliveryUsd;
  const deliveryAndStorageUsd = validAmount(storageFeeUsd)
    ? (deliveryUsd ?? 0) + storageFeeUsd
    : null;
  const knownChargesUsd =
    goodsAndServiceUsd !== null && deliveryAndStorageUsd !== null
      ? goodsAndServiceUsd + deliveryAndStorageUsd
      : null;
  return {
    deliveryPending,
    deliveryUsd,
    goodsAndServiceUsd,
    deliveryAndStorageUsd,
    knownChargesUsd,
  };
}
