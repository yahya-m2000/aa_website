import type { CustomerStatus, InternalStatus } from './types';

/**
 * Mirrors aa_catalog/server/src/integrations/graph/statusMapping.ts exactly (WhatsApp-notification
 * project, 2026-07-26) — the single source of truth for InternalStatus -> CustomerStatus
 * derivation. CustomerStatus must never be independently settable by a caller (see schemas.ts,
 * route.ts) — it is always derived from whatever InternalStatus is being written, so
 * 'Order Created' and 'Needs Review' (both staff-only concepts) can never leak into the
 * customer-facing field or trigger a customer notification.
 *
 * `null` means "do not touch CustomerStatus at all, and do not send any customer
 * notification" — not "write some default value."
 */
export function mapInternalToCustomerStatus(internalStatus: InternalStatus): CustomerStatus | null {
  switch (internalStatus) {
    case 'Awaiting Payment':
      return 'Order Received';
    case 'Payment Confirmed':
      return 'Payment Confirmed';
    case 'Shipped':
      return 'Shipped';
    case 'Completed':
      return 'Completed';
    case 'Cancelled':
      return 'Cancelled';
    case 'Expired':
      return 'Expired';
    case 'Order Created':
    case 'Needs Review':
      return null;
  }
}
