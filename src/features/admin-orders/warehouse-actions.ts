import { auditFields, recordActivity, type Actor } from './audit';
import { getOrderItemByReference, updateOrderItemFields } from './orders.repository';
import type { InternalStatus } from './types';

// Mirrors aa_catalog/server/src/config/pricing.config.ts's DELIVERY_RATE_USD_PER_KG default
// (owner-supplied rule, 2026-07-25: delivery is a flat $/kg rate). If the backend's rate
// changes, update this to match — no shared package exists between the two repos.
export const DELIVERY_RATE_USD_PER_KG = 13;

export class WarehouseActionError extends Error {
  constructor(message: string, readonly status: number, readonly code: string) {
    super(message);
    this.name = 'WarehouseActionError';
  }
}

interface ActionOptions {
  reference: string;
  etag: string;
  actor: Actor;
  // Warehouse staff may only act on orders still being fulfilled; admins keep full control.
  allowedStatuses?: InternalStatus[];
}

async function loadOrder({ reference, allowedStatuses }: ActionOptions) {
  const item = await getOrderItemByReference(reference);
  if (!item) throw new WarehouseActionError('Order not found', 404, 'NOT_FOUND');
  if (allowedStatuses && !allowedStatuses.includes(item.fields.InternalStatus))
    throw new WarehouseActionError('This order is not open for warehouse work.', 409, 'NOT_ACTIVE');
  return item;
}

// Staff-entered warehouse-arrival timestamp (owner-supplied storage-fee rule, 2026-07-28). The
// storage fee itself is never written anywhere — it's always live-computed from this timestamp.
export async function markOrderArrived(options: ActionOptions) {
  const item = await loadOrder(options);
  if (item.fields.ArrivedAtWarehouseAt)
    throw new WarehouseActionError('This order is already marked as arrived at the warehouse.', 409, 'ALREADY_ARRIVED');
  const arrivedAt = new Date().toISOString();
  const action = 'Marked arrived at warehouse';
  const audit = auditFields(options.actor, action);
  const etag = await updateOrderItemFields(item.id, options.etag, { ...audit, ArrivedAtWarehouseAt: arrivedAt });
  await recordActivity({ reference: item.fields.OrderReference, actor: options.actor, action, occurredAt: audit.LastModifiedAt });
  return { etag, arrivedAt };
}

// Staff-entered real order weight (owner-supplied pricing rules, 2026-07-25 — no product/SKU
// weight data exists anywhere upstream). Recalculates DeliveryUsd and TotalUsd from the real
// weight and flips IsDeliveryEstimated to false — the only place that clears that flag.
export async function recordOrderWeight(options: ActionOptions & { weightKg: number }) {
  const item = await loadOrder(options);
  if (item.fields.DeliveryGroupId)
    throw new WarehouseActionError('Weigh the combined delivery instead.', 409, 'COMBINED_DELIVERY');
  const deliveryUsd = Math.round(options.weightKg * DELIVERY_RATE_USD_PER_KG * 100) / 100;
  const totalUsd = Math.round((item.fields.TotalUsd + deliveryUsd - item.fields.DeliveryUsd) * 100) / 100;
  const action = `Recorded weight ${options.weightKg} kg (delivery $${deliveryUsd.toFixed(2)})`;
  const audit = auditFields(options.actor, action);
  const etag = await updateOrderItemFields(item.id, options.etag, {
    ...audit,
    WeightKg: options.weightKg,
    DeliveryUsd: deliveryUsd,
    IsDeliveryEstimated: false,
    TotalUsd: totalUsd,
  });
  await recordActivity({ reference: item.fields.OrderReference, actor: options.actor, action, occurredAt: audit.LastModifiedAt });
  return { etag, deliveryUsd, totalUsd };
}
