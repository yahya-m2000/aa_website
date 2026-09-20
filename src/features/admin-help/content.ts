import type { HelpCategory } from "./types";

export const HELP_CATEGORIES: HelpCategory[] = [
  {
    slug: "getting-started",
    label: "Getting Started",
    articles: [
      {
        slug: "combined-deliveries",
        title: "Combine orders into one delivery",
        body: [
          {
            type: "p",
            text: "On Orders, select two or more orders for the same customer phone and destination, then choose Combine delivery. Orders must not already be grouped, dispatched, cancelled or have finalized delivery charges.",
          },
          {
            type: "list",
            items: [
              "Enter the combined weight on the delivery page. The $13/kg delivery charge is recorded once for the group; goods and storage remain per order.",
              "Confirm delivery payment received, add tracking, then mark the delivery shipped. All included orders must have recorded supplier payment before dispatch.",
              "Open the delivery from the Deliveries tab or any linked order. A partially linked group can be resumed. An unweighed, unpaid group can be dissolved.",
            ],
          },
        ],
      },
      {
        slug: "supplier-progress",
        title: "Payment buttons and supplier progress",
        body: [
          {
            type: "p",
            text: "Confirm customer payment once, then wait for supplier creation to complete. When Pay now appears, review the supplier order and confirm once. Accepted actions remain locked after refresh or a status change.",
          },
          {
            type: "list",
            items: [
              "Queued and Processing mean the server is handling your request. The detail page refreshes while you are not editing.",
              "Needs review means the result is uncertain or failed. Do not create another order or repeat payment. Known supplier payments are checked read-only for reconciliation.",
              "After checking the supplier order and payment receipt, use Record verified supplier result with an evidence note. This only repairs records and does not purchase or pay anything.",
              "If automation is unavailable, the CMS refuses a new supplier request. Retry once service returns; existing accepted requests remain in SharePoint.",
            ],
          },
        ],
      },
      {
        slug: "export-reports",
        title: "Excel reports and adjustments",
        body: [
          {
            type: "p",
            text: "Apply a reporting period on Dashboard, then choose Export Excel. The workbook includes Summary, Periods, Countries, Orders, Adjustments, and Definitions. It includes the previous full period for comparison, even when the selected period is still in progress.",
          },
          {
            type: "list",
            items: [
              "Summary contains counts, completion/cancellation/expiry ratios, service fees, markup, completed income, open potential, and cancelled/expired opportunity.",
              "Orders contains the selected and previous cohorts with formulas used by the summaries. Keep this source snapshot unchanged; export again to refresh it.",
              "Refunds are not stored by the order system. Enter verified refunded-order counts, refunded fees/markup, allocated costs, and other income adjustments in the yellow cells on Adjustments. Blank means unknown; enter zero only when verified.",
              "Adjusted contribution subtracts refunded fees/markup and allocated costs from completed income, then adds other adjustments. It is before taxes and is not cash profit.",
            ],
          },
          {
            type: "callout",
            tone: "info",
            text: "All figures are grouped by order creation date using current statuses. Exports exclude delivery, storage, and customer contact details. Missing pricing is n.a. rather than zero. A zero denominator has no ratio.",
          },
        ],
      },
      {
        slug: "daily-workspace",
        title: "Daily workflow and mobile tools",
        body: [
          {
            type: "p",
            text: "Use Orders to search and filter by status. The list refreshes every minute while visible and pauses during selection, typing, or a confirmation dialog. Dashboard provides a 30-day overview and detailed reports.",
          },
          {
            type: "list",
            items: [
              "On mobile, orders appear as cards with status, reference, payment controls, and known charges. Tap the reference to open the full order.",
              "Search matches the beginning of a reference, customer name, or email. Combine it with a status filter, or use Clear filters to start again.",
              "Use the copy icons beside order references, emails, and phone numbers when handing work to a colleague.",
              "The Manage order card shows unsaved changes. Save them before moving to another order, or use Discard changes to restore the saved values.",
            ],
          },
          {
            type: "callout",
            tone: "info",
            text: "The order list and detail page show known charges, excluding unweighed delivery and including applicable storage fees. Delivery pending identifies orders awaiting weighing. No payment is collected by copying or opening an order.",
          },
        ],
      },
      {
        slug: "pricing-breakdown",
        title: "Understanding known charges and delivery",
        body: [
          {
            type: "p",
            text: "Goods and service includes product cost, service fee, and markup. Delivery and storage are grouped separately to make the later delivery payment easy to review.",
          },
          {
            type: "steps",
            items: [
              "Before weighing, delivery reads Pending weighing and has no amount. Known charges includes goods, service, and any applicable storage, but excludes delivery.",
              "After staff save the actual weight, the breakdown includes the actual delivery charge. Review the delivery and storage subtotal before contacting the customer.",
              "Collect delivery payment outside this portal before shipping. A displayed total is a charge breakdown, not a balance due or proof of payment.",
            ],
          },
          {
            type: "callout",
            tone: "warning",
            text: "A dash or missing-data notice means pricing needs review. Do not treat missing amounts as zero or collect payment from an incomplete breakdown.",
          },
        ],
      },
      {
        slug: "signing-in",
        title: "Signing in",
        body: [
          {
            type: "p",
            text: 'Go to /admin and click "Sign in with Microsoft." Use your normal A&A Microsoft 365 work account — there is no separate admin password to remember.',
          },
          {
            type: "p",
            text: 'Only accounts that belong to the A&A Microsoft organization can get in. If you sign in with a personal Microsoft account, or an account from a different company, you\'ll land on an "Access denied" page. If that happens, click "Try a different account" and sign in again with your work account.',
          },
          {
            type: "callout",
            tone: "info",
            text: "You'll be signed out automatically after 8 hours and need to sign in again — this is a security setting, not a bug, and happens roughly once per shift.",
          },
        ],
      },
      {
        slug: "layout-overview",
        title: "Around the admin portal",
        body: [
          {
            type: "p",
            text: "The sidebar contains Dashboard, Orders, and Help Centre. On a phone, open the menu in the top bar.",
          },
          {
            type: "p",
            text: "Collapse the sidebar when you need more room; your preference is remembered on this browser. Your account and Sign out remain at the bottom. Visit website opens the public site in a separate tab.",
          },
        ],
      },
    ],
  },
  {
    slug: "dashboard",
    label: "Dashboard",
    articles: [
      {
        slug: "reading-the-dashboard",
        title: "What the dashboard shows you",
        body: [
          {
            type: "p",
            text: "Overview shows the last 30 days. Open Reports to choose Month, Quarter, or Year, select the period, and click Apply. Periods use calendar dates in UTC. Current periods are to date. The dashboard refreshes every minute while visible; Refresh updates it immediately.",
          },
          {
            type: "list",
            items: [
              "Income charts separate service fees and markup. Switch between completed orders and all quoted orders, and between bar and area charts.",
              "Order outcomes show the current internal status of orders created in the selected period. Completed, open, cancelled, and expired totals reconcile to all placed orders.",
              "By country shows orders, completion rates, and completed-order income by destination.",
            ],
          },
          {
            type: "callout",
            tone: "info",
            text: "Completed-order income is service fees plus markup on completed orders, before refunds and costs. It is not verified cash receipts or net profit. Historical figures use current statuses and can change as orders progress.",
          },
        ],
      },
    ],
  },
  {
    slug: "orders-list",
    label: "Orders List",
    articles: [
      {
        slug: "finding-orders",
        title: "Searching and filtering orders",
        body: [
          {
            type: "p",
            text: "Use the search box to find an order by its reference number, the customer's name, or their email — type and press Enter. Use the status dropdown next to it to show only orders in a particular status.",
          },
          {
            type: "p",
            text: "The list shows 25 orders per page. There's no page-number list — just a \"Next page\" link at the bottom, because of how our order data is stored. If you're looking for an older order, searching by reference or customer name is much faster than paging through.",
          },
        ],
      },
      {
        slug: "reading-the-table",
        title: "Reading the orders table",
        body: [
          {
            type: "table",
            headers: ["Column", "What it means"],
            rows: [
              ["Reference", "Click it to open the full order detail page."],
              [
                "Customer",
                "Name and email of the person who placed the order.",
              ],
              ["Payment", "How they're paying — Cash or Zaad."],
              [
                "Status",
                'The customer-facing status. If the order is in an internal-only state (like "Order Created" or "Needs Review"), you\'ll see a second badge for that too.',
              ],
              [
                "Payment confirmed",
                'A checkbox — ticked once we\'ve confirmed we received payment. See "Confirming payment" for what this actually does.',
              ],
              ["Total", "The order total in USD."],
              ["Created", "When the order was placed."],
            ],
          },
          {
            type: "p",
            text: 'You can select multiple orders with the checkboxes on the left and apply one status change to all of them at once using the bar that appears above the table. Note that "Payment Confirmed" is deliberately not available as a bulk action — that one always needs to be done one order at a time, on purpose (see "Confirming payment").',
          },
        ],
      },
    ],
  },
  {
    slug: "order-workflow",
    label: "Order Status & Workflow",
    articles: [
      {
        slug: "status-overview",
        title: "How an order moves from placed to delivered",
        body: [
          {
            type: "p",
            text: "Every order follows the same basic path. Here it is from start to finish:",
          },
          {
            type: "steps",
            items: [
              'Awaiting Payment - the order was just placed. The customer sees "Order Received." Delivery is pending until the actual package weight is entered.',
              'Payment Confirmed — staff tick the "Payment confirmed" checkbox once payment has actually come in. This automatically creates the supplier order for procurement (but doesn\'t pay the supplier yet). The customer is notified by WhatsApp.',
              "Order Created — the system sets this automatically once the supplier order has been created. It's an internal-only status; the customer never sees it and isn't notified. This unlocks the \"Pay now\" step.",
              'Staff click "Pay now" — this actually charges the supplier and kicks off procurement. Once it\'s processed, the order moves back to Payment Confirmed internally (this is the one step that goes "backwards" — see "Confirming payment" for why).',
              'Shipped — staff set this manually once the order has physically shipped. Customer sees "Shipped" and gets a WhatsApp notification.',
              'Completed — staff set this manually once the order is delivered/done. Customer sees "Completed" and gets a WhatsApp notification.',
            ],
          },
          {
            type: "p",
            text: "At any point, an order can instead be moved to one of these instead of the normal path:",
          },
          {
            type: "list",
            items: [
              "Cancelled — customer is notified by WhatsApp.",
              'Expired — the order\'s payment window passed without payment. Customer sees "Expired," but is not sent a WhatsApp message for this one.',
              "Needs Review — an internal-only flag for an order that needs a closer look. Customer isn't notified and doesn't see this status.",
            ],
          },
        ],
      },
      {
        slug: "confirming-payment",
        title: "Confirming payment (and why it triggers an automation)",
        body: [
          {
            type: "p",
            text: "Ticking \"Payment confirmed\" — whether from the orders list or the order detail page — is not just a label change. It immediately notifies our procurement system, which automatically creates a supplier order for the items in that order. You'll be asked to confirm before this happens, because it can't be undone from the admin portal afterwards.",
          },
          {
            type: "callout",
            tone: "warning",
            text: 'Confirming payment does NOT charge the supplier yet — it only creates the supplier order. Charging the supplier is a separate "Pay now" step (see below), so that spending money is always a deliberate, second action.',
          },
          {
            type: "p",
            text: 'This is also why "Payment Confirmed" is the one status you can\'t apply to several orders at once from the bulk action bar — it always needs its own individual confirmation, order by order.',
          },
        ],
      },
      {
        slug: "pay-now",
        title: 'Paying the supplier ("Pay now")',
        body: [
          {
            type: "p",
            text: 'Once an order reaches the internal "Order Created" status (which happens automatically right after payment is confirmed), a "Pay supplier" card appears on the order detail page with a "Pay now" button.',
          },
          {
            type: "callout",
            tone: "warning",
            text: "This is the step that actually spends real money — it charges our linked supplier account. Only click it once you're sure. You'll get a confirmation prompt first, and the button becomes \"Payment requested\" and locks once you've clicked it, so it can't be clicked twice by accident.",
          },
          {
            type: "p",
            text: "After the payment goes through, the order's internal status moves back to \"Payment Confirmed.\" That's expected — it doesn't mean anything went wrong. It simply reflects that the order is now paid-for and being procured.",
          },
        ],
      },
      {
        slug: "weight-and-warehouse",
        title: "Weight entry and warehouse arrival",
        body: [
          {
            type: "p",
            text: "These two cards on the order detail page are both manual, staff-entered steps — there's no automatic scale or warehouse scanner feeding this data in.",
          },
          {
            type: "list",
            items: [
              "Order weight - enter the actual package weight to calculate delivery and update the total. Before weighing, the admin breakdown shows known charges only. You can correct the weight later if needed.",
              'Warehouse storage — click "Mark as arrived" the moment the order physically reaches the warehouse. This starts the storage-fee clock: the first 7 days are free, then it accrues at $0.50 per day. Unlike weight, this is one-way — once marked, it can\'t be undone from here, so only click it once the order has genuinely arrived.',
            ],
          },
        ],
      },
      {
        slug: "manage-order",
        title: "Changing status manually and adding notes",
        body: [
          {
            type: "p",
            text: 'The "Manage order" card on the order detail page is where you set a status by hand — for everything except Payment Confirmed and Order Created, which are only ever set through their own dedicated flows described above.',
          },
          {
            type: "p",
            text: "Pick a new status from the dropdown, optionally add or edit the internal notes underneath, then click \"Save changes.\" Unlike Payment Confirmed and Pay Now, this doesn't ask for confirmation first — it's meant for the routine day-to-day updates (marking something Shipped, Completed, or adding a note for a colleague).",
          },
          {
            type: "callout",
            tone: "info",
            text: "Internal notes are for staff only — the customer never sees them. Use them to leave context for whoever picks up the order next.",
          },
        ],
      },
    ],
  },
  {
    slug: "troubleshooting",
    label: "Troubleshooting & FAQ",
    articles: [
      {
        slug: "common-issues",
        title: "Common issues",
        body: [
          {
            type: "p",
            text: "\"This order was changed elsewhere — refresh to see the latest before saving.\" — This means someone else (or another browser tab) saved a change to this exact order after you opened it. Refresh the page to load the latest version, then make your change again. This is a safety check, not an error — it exists specifically so two people can't accidentally overwrite each other's work.",
          },
          {
            type: "p",
            text: "\"No line items recorded (or the stored data could not be parsed).\" — The order's item details didn't save correctly, usually from a manual edit outside the normal order flow. The order itself is still valid; flag it so the underlying data can be corrected.",
          },
          {
            type: "p",
            text: 'The "Payment confirmed" checkbox is greyed out — It\'s only clickable while an order is still "Awaiting Payment." Once payment has been confirmed (or the order has moved past that point, or been cancelled/expired), the checkbox locks to prevent it being toggled again by accident.',
          },
          {
            type: "p",
            text: '"Pending weighing" next to delivery: the admin breakdown excludes delivery until the charge is finalized. Enter the actual package weight. Known charges are not the final total and do not mean delivery is free.',
          },
        ],
      },
      {
        slug: "good-habits",
        title: "A few good habits",
        body: [
          {
            type: "list",
            items: [
              'Double-check the order reference before clicking "Payment confirmed" or "Pay now" — both trigger real, hard-to-reverse actions.',
              "Leave a quick internal note whenever you do something unusual to an order, so the next person has context.",
              "Weigh and record the order as soon as you can. Collect delivery payment using the actual delivery charge and applicable storage fees.",
              'Mark "arrived at warehouse" the same day it actually arrives — the storage-fee clock is date-based, so a late click means missed free days for the customer.',
            ],
          },
        ],
      },
    ],
  },
];

export function findArticle(topicSlug: string | undefined) {
  for (const category of HELP_CATEGORIES) {
    const article = category.articles.find((a) => a.slug === topicSlug);
    if (article) return { category, article };
  }
  return null;
}

export const DEFAULT_TOPIC_SLUG = HELP_CATEGORIES[0].articles[0].slug;
