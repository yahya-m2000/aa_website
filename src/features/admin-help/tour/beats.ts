import type { Beat, Scene, SceneId } from './types';

export const DASHBOARD_BEATS: Beat[] = [
  {
    target: 'revenue-chart',
    title: 'Service fee revenue',
    body: 'This is our earnings — the service fee only, for the last 30 days. It does not include the product cost or delivery cost, since those pass straight through to the customer.',
    placement: 'bottom',
  },
  {
    target: 'status-breakdown',
    title: 'Status breakdown',
    body: 'A quick read on how many orders are sitting in each status right now. Handy for spotting a backlog at a glance.',
    placement: 'top',
  },
  {
    target: 'country-breakdown',
    title: 'By country',
    body: 'Order volume and value by delivery country. This page updates itself automatically every 30 seconds — you never need to refresh it.',
    placement: 'top',
  },
];

export const ORDERS_LIST_BEATS: Beat[] = [
  {
    target: 'orders-filters',
    title: 'Finding an order',
    body: 'Search by reference, customer name, or email — or filter to just one status. Most of your day will start here.',
    placement: 'bottom',
  },
  {
    target: 'status-column',
    title: 'Reading the status column',
    body: 'The customer-facing status always shows. If the order is in an internal-only state — like "Order Created" — you\'ll see a second badge for that too.',
    placement: 'bottom',
  },
  {
    target: 'payment-confirmed-column',
    title: 'The "Payment confirmed" checkbox',
    body: 'A fast way to confirm payment right from the list — but it only works while an order is still Awaiting Payment. We\'ll see exactly what it does on the next page.',
    placement: 'left',
  },
  {
    target: 'first-order-row',
    title: "Let's open one",
    body: 'This order — AA-10482 — just came in and is still waiting on payment. Click Continue and we\'ll follow it all the way through to delivery.',
    placement: 'right',
  },
];

// The full lifecycle, told as one continuous story on a single order. Each beat's `stage`
// advances OrderDetailScene's local state before the beat's callout appears, so the page
// visibly changes in step with the narration instead of the trainee needing to click
// anything themselves — this is a guided tour, not a graded exercise.
//
// Real sequence (owner-confirmed, 2026-08-08): pay for goods -> pay supplier -> arrives at
// our warehouse -> weighed -> contact customer to collect delivery payment (outside this
// portal) -> ship -> complete. Do not reorder this without re-confirming with the owner —
// an earlier version of this tour had warehouse/weigh before paying the supplier, which was
// wrong.
export const ORDER_DETAIL_BEATS: Beat[] = [
  {
    target: 'customer-status-bar',
    stage: 'awaiting-payment',
    title: 'A new order comes in',
    body: 'AA-10482 was just placed. The customer sees "Order Received." Notice the delivery cost is still an estimate — we don\'t know the real weight yet.',
    placement: 'left',
  },
  {
    target: 'payment-card',
    stage: 'payment-confirmed',
    title: 'The customer pays for the goods',
    body: 'Once payment actually comes in, staff tick "Payment confirmed." This immediately notifies our procurement system, which automatically creates a supplier order — but does not charge the supplier yet.',
    placement: 'left',
  },
  {
    target: 'pay-now-card',
    stage: 'paid-supplier',
    title: 'We pay the supplier',
    body: 'Now that a supplier order exists, staff click "Pay now" to actually charge the supplier and start procurement. This is the one step that spends real money — it always asks for confirmation first.',
    placement: 'left',
  },
  {
    target: 'warehouse-card',
    stage: 'arrived-at-warehouse',
    title: 'The order reaches our warehouse',
    body: 'Once procured, the physical order arrives at our China warehouse. Staff click "Mark as arrived" — this starts a 7-day-free storage clock, then $0.50/day after that. This can\'t be undone, so only click it once it has genuinely arrived.',
    placement: 'right',
  },
  {
    target: 'weight-card',
    stage: 'weighed',
    title: 'We weigh it',
    body: 'Staff weigh the physical package and enter the real number. Look at the pricing breakdown above — the delivery cost just updated from an estimate to a real figure, and the "Estimated" badge is gone.',
    placement: 'right',
  },
  {
    target: 'pricing-card',
    stage: 'awaiting-delivery-payment',
    title: 'Check the pricing breakdown before shipping',
    body: 'The "Delivery & storage" group is split out separately for exactly this reason — its Subtotal line adds up Delivery and any accruing warehouse storage fee for you. That figure is what to ask the customer for.',
    placement: 'right',
  },
  {
    target: 'delivery-payment-note',
    stage: 'awaiting-delivery-payment',
    title: 'We collect the delivery payment',
    body: 'Now staff contact the customer directly — a call or WhatsApp, not through this portal — to collect that combined delivery + storage total before anything ships.',
    placement: 'right',
  },
  {
    target: 'manage-order-card',
    stage: 'shipped',
    title: 'The order ships',
    body: 'Once the customer has paid for delivery, staff open this "Internal status" dropdown, pick "Shipped," and click "Save changes." Notice it shows what the status is changing from, so you can double-check before saving. The customer is notified and sees "Shipped" too.',
    placement: 'left',
  },
  {
    target: 'manage-order-card',
    stage: 'completed',
    title: 'Delivered',
    body: 'Finally, once the order is delivered, staff pick "Completed" from this same dropdown and save. That\'s the whole lifecycle — payment, supplier payment, warehouse, weighing, delivery payment, shipped, completed — all handled from this one order page.',
    placement: 'left',
  },
];

export const TOUR_SCENES: Scene[] = [
  { id: 'dashboard', label: 'Dashboard', beats: DASHBOARD_BEATS },
  { id: 'orders-list', label: 'Orders list', beats: ORDERS_LIST_BEATS },
  { id: 'order-detail', label: 'Order detail', beats: ORDER_DETAIL_BEATS },
];

export function sceneById(id: SceneId): Scene {
  const scene = TOUR_SCENES.find((s) => s.id === id);
  if (!scene) throw new Error(`Unknown tour scene: ${id}`);
  return scene;
}
