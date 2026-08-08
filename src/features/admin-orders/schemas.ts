import { z } from 'zod';
import { INTERNAL_STATUS_VALUES } from './status';

// customerStatus is deliberately NOT a client-settable field here (removed 2026-07-26,
// WhatsApp-notification project) — it is always derived server-side from internalStatus via
// mapInternalToCustomerStatus, so 'Order Created'/'Needs Review' (internal-only concepts) can
// never leak into the customer-facing field via a crafted request. See route.ts.
export const updateOrderStatusSchema = z
  .object({
    etag: z.string().min(1, 'etag is required'),
    internalStatus: z.enum(INTERNAL_STATUS_VALUES as [string, ...string[]]).optional(),
    internalNotes: z.string().max(63999).optional(),
    // Required (and must be exactly `true`) whenever internalStatus is 'Payment Confirmed' —
    // the route enforces this, not this schema alone, since the check depends on the value of
    // another field. This makes "yes I really mean this" part of the wire payload itself, not
    // just a UI-layer gate a replayed/forged request could bypass (plan's write-path safety
    // section — Payment Confirmed is the exact field the live Power Automate -> HIOBuy
    // procurement automation watches, so ticking it here triggers real money-moving action).
    confirmPaymentConfirmed: z.boolean().optional(),
  })
  .refine((data) => data.internalStatus !== undefined || data.internalNotes !== undefined, {
    message: 'At least one of internalStatus or internalNotes must be provided',
  });

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;

const NON_CRITICAL_INTERNAL_STATUS_VALUES = INTERNAL_STATUS_VALUES.filter(
  (s) => s !== 'Payment Confirmed',
) as [string, ...string[]];

export const bulkUpdateStatusSchema = z.object({
  references: z.array(z.string().min(1)).min(1).max(100),
  internalStatus: z.enum(NON_CRITICAL_INTERNAL_STATUS_VALUES),
});

export type BulkUpdateStatusInput = z.infer<typeof bulkUpdateStatusSchema>;

export const payNowSchema = z.object({
  etag: z.string().min(1, 'etag is required'),
  confirmPayNow: z.boolean().optional(),
});

export type PayNowInput = z.infer<typeof payNowSchema>;

export const updateWeightSchema = z.object({
  etag: z.string().min(1, 'etag is required'),
  weightKg: z.number().positive('Weight must be a positive number'),
});

export type UpdateWeightInput = z.infer<typeof updateWeightSchema>;

export const markArrivedAtWarehouseSchema = z.object({
  etag: z.string().min(1, 'etag is required'),
});

export type MarkArrivedAtWarehouseInput = z.infer<typeof markArrivedAtWarehouseSchema>;
