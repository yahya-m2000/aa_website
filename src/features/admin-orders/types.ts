// Simplified 2026-07-26 to mirror aa_catalog/server/src/integrations/graph/orders.types.ts
// (WhatsApp-notification project) — 'Payment Pending' and 'Processing' both retired, collapsed
// into 'Payment Confirmed' (no meaningful customer-facing gap between "we got your payment" and
// "we're now procuring it," since staff confirm payment and kick off procurement as one action).
export type CustomerStatus =
  | 'Order Received'
  | 'Payment Confirmed'
  | 'Shipped'
  | 'Completed'
  | 'Cancelled'
  | 'Expired';

// Simplified 2026-07-25 to mirror aa_catalog/server/src/integrations/graph/orders.types.ts —
// dropped 'New' (redundant with 'Awaiting Payment') and 'Shipped' (folded into 'Procuring');
// added 'Order Created' as the deliberate split point between HIOBuy orders/create (automatic,
// fires on Payment Confirmed) and orders/pay (a separate, explicit "Pay now" action — see
// order-status-panel.tsx's PayNowButton).
//
// Revised again 2026-07-26 (WhatsApp-notification project, mirrors server exactly): 'Procuring'
// retired — absorbed into 'Payment Confirmed', which now covers "payment just confirmed" through
// "being procured." 'Shipped' re-added as its own real, distinct status (dispatch). CustomerStatus
// is derived from this via mapInternalToCustomerStatus (statusMapping.ts) — never independently
// settable by the client anymore (see schemas.ts/route.ts changes, same date). 'Order Created' and
// 'Needs Review' deliberately have no CustomerStatus mapping — internal-only, never surfaced.
export type InternalStatus =
  | 'Awaiting Payment'
  | 'Payment Confirmed'
  | 'Order Created'
  | 'Shipped'
  | 'Completed'
  | 'Cancelled'
  | 'Expired'
  | 'Needs Review';

export type PaymentMethod = 'Cash' | 'Zaad';
export type EmailDeliveryStatus = 'Sent' | 'Failed' | 'Pending Retry';
export type PushNotificationStatus = 'Sent' | 'Failed' | 'Not Provided';

// Mirrors aa_catalog/server/src/types/order.ts's OrderLineItem exactly — this is the real
// shape written into LineItemsJson by the checkout flow, not a re-derived guess.
export interface OrderLineItem {
  productId: string;
  productTitle: string;
  skuId?: string;
  variantOptions?: Array<{ name: string; value: string }>;
  quantity: number;
  originalAmount: number;
  originalCurrency: string;
  usdAmount: number;
  markupAmount: number;
  finalAmount: number;
  hiobuySourceProductId?: string;
  hiobuySourceUrl?: string;
}

// Fields as written to / read from the SharePoint "Orders" list — mirrors
// aa_catalog/server/src/integrations/graph/orders.types.ts exactly, since both
// projects read/write the same live SharePoint list.
export interface OrderListItemFields {
  OrderReference: string;
  CustomerFullName: string;
  CustomerEmail: string;
  CustomerPhone: string;
  ShippingAddress: string;
  City: string;
  Postcode: string;
  Country: string;
  PaymentMethod: PaymentMethod;
  CustomerStatus: CustomerStatus;
  InternalStatus: InternalStatus;
  InternalNotes?: string;
  LineItemsJson: string;
  SubtotalUsd: number;
  DeliveryUsd: number;
  // True while DeliveryUsd is only a checkout-time estimate (owner-supplied pricing rules,
  // 2026-07-25: delivery is $/kg, but real weight isn't known until staff weigh the order).
  // Staff enter the real WeightKg here (order-status-panel.tsx) to recalculate and finalize it.
  IsDeliveryEstimated: boolean;
  WeightKg?: number;
  // Set by staff once the order physically arrives at the China warehouse (owner-supplied
  // rule, 2026-07-28) — mirrors WeightKg's staff-entered pattern exactly, no automated
  // warehouse-scanning integration exists. Storage fee (calculateStorageFeeUsd in
  // aa_catalog/server/src/services/pricing.service.ts) is 0/unset until this is set, then
  // live-accrues daily after the first free-days period.
  ArrivedAtWarehouseAt?: string;
  ServiceFeeUsd: number;
  MarkupUsd: number;
  TotalUsd: number;
  PricingPolicyVersion: string;
  FxRate: number;
  FxRateAt: string;
  PriceValidatedAt: string;
  CreatedAt: string;
  ExpiresAt: string;
  ExpiredAt?: string;
  CustomerEmailStatus?: EmailDeliveryStatus;
  InternalEmailStatus?: EmailDeliveryStatus;
  PushToken?: string;
  PushNotificationStatus?: PushNotificationStatus;
  HiobuyOrderId?: string;
  HiobuyPurchaseStatus?: string;
  ProcuredAt?: string;
  /**
   * Set to true via the "Pay now" button (order-status-panel.tsx) — a distinct signal from
   * InternalStatus so a dedicated Power Automate flow can trigger on it while
   * InternalStatus is still 'Order Created', and call the aa_catalog server's separate
   * POST /orders/:reference/pay endpoint (2026-07-25 procurement split).
   *
   * SharePoint column: Yes/No (boolean), default false — renamed from PayNowRequestedAt
   * (2026-07-27, aa_catalog server-side) after that dateTime field turned out to make the
   * Power Automate flow's "has this been set" condition ambiguous (a null date doesn't
   * reliably compare as "not equal to blank"), letting the flow fire on every order
   * regardless of whether Pay Now had actually been clicked. A boolean checked with a plain
   * "is equal to true" condition has no equivalent ambiguity.
   */
  PayNowConfirmed?: boolean;
  /** Timestamp the customer ticked the checkout Terms & Conditions consent checkbox
   * (owner-supplied T&Cs, 2026-07-25) — an audit record only, never editable here. */
  TermsAcceptedAt: string;
}

export interface GraphListItem {
  id: string;
  '@odata.etag': string;
  fields: OrderListItemFields;
}

// Trimmed row shape for the order list view — excludes LineItemsJson/pricing detail,
// which only the detail page needs (plan's API route shape section).
export interface OrderListRow {
  id: string;
  etag: string;
  reference: string;
  customerFullName: string;
  customerEmail: string;
  paymentMethod: PaymentMethod;
  customerStatus: CustomerStatus;
  internalStatus: InternalStatus;
  totalUsd: number;
  createdAt: string;
}

export interface OrderDetail {
  id: string;
  etag: string;
  fields: OrderListItemFields;
  lineItems: OrderLineItem[];
}
