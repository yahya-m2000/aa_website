import type { HelpCategory } from './types';

export const HELP_CATEGORIES: HelpCategory[] = [
  {
    slug: 'getting-started',
    label: 'Getting Started',
    articles: [
      {
        slug: 'signing-in',
        title: 'Signing in',
        body: [
          {
            type: 'p',
            text: 'Go to /admin and click "Sign in with Microsoft." Use your normal A&A Microsoft 365 work account — there is no separate admin password to remember.',
          },
          {
            type: 'p',
            text: 'Only accounts that belong to the A&A Microsoft organization can get in. If you sign in with a personal Microsoft account, or an account from a different company, you\'ll land on an "Access denied" page. If that happens, click "Try a different account" and sign in again with your work account.',
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'You\'ll be signed out automatically after 8 hours and need to sign in again — this is a security setting, not a bug, and happens roughly once per shift.',
          },
        ],
      },
      {
        slug: 'layout-overview',
        title: 'Around the admin portal',
        body: [
          {
            type: 'p',
            text: 'The sidebar on the left has three sections: Dashboard (a quick overview of recent orders), Orders (the full list of every order, where you\'ll spend most of your time), and Help Centre (this page).',
          },
          {
            type: 'p',
            text: 'Click the panel icon at the top of the sidebar to collapse it to icons-only if you want more screen space. Your name/email and a "Sign out" button are at the bottom of the sidebar.',
          },
        ],
      },
    ],
  },
  {
    slug: 'dashboard',
    label: 'Dashboard',
    articles: [
      {
        slug: 'reading-the-dashboard',
        title: 'What the dashboard shows you',
        body: [
          {
            type: 'p',
            text: 'The dashboard always covers the last 30 days and refreshes itself automatically every 30 seconds — you never need to reload the page. A "Last updated" time in the corner tells you how fresh the numbers are.',
          },
          {
            type: 'list',
            items: [
              'Service fee revenue chart — day-by-day earnings from orders. This is our service fee only, not the full order total — the product cost and delivery cost pass straight through to the customer and aren\'t counted as our revenue.',
              'Status breakdown — how many orders are in each customer-facing status right now, and what share of all orders that is.',
              'By country — order count and total value grouped by delivery country, sorted with the highest-value country first.',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'The dashboard is read-only. If you need to act on an order, use the Orders page.',
          },
        ],
      },
    ],
  },
  {
    slug: 'orders-list',
    label: 'Orders List',
    articles: [
      {
        slug: 'finding-orders',
        title: 'Searching and filtering orders',
        body: [
          {
            type: 'p',
            text: 'Use the search box to find an order by its reference number, the customer\'s name, or their email — type and press Enter. Use the status dropdown next to it to show only orders in a particular status.',
          },
          {
            type: 'p',
            text: 'The list shows 25 orders per page. There\'s no page-number list — just a "Next page" link at the bottom, because of how our order data is stored. If you\'re looking for an older order, searching by reference or customer name is much faster than paging through.',
          },
        ],
      },
      {
        slug: 'reading-the-table',
        title: 'Reading the orders table',
        body: [
          {
            type: 'table',
            headers: ['Column', 'What it means'],
            rows: [
              ['Reference', 'Click it to open the full order detail page.'],
              ['Customer', 'Name and email of the person who placed the order.'],
              ['Payment', 'How they\'re paying — Cash or Zaad.'],
              ['Status', 'The customer-facing status. If the order is in an internal-only state (like "Order Created" or "Needs Review"), you\'ll see a second badge for that too.'],
              ['Payment confirmed', 'A checkbox — ticked once we\'ve confirmed we received payment. See "Confirming payment" for what this actually does.'],
              ['Total', 'The order total in USD.'],
              ['Created', 'When the order was placed.'],
            ],
          },
          {
            type: 'p',
            text: 'You can select multiple orders with the checkboxes on the left and apply one status change to all of them at once using the bar that appears above the table. Note that "Payment Confirmed" is deliberately not available as a bulk action — that one always needs to be done one order at a time, on purpose (see "Confirming payment").',
          },
        ],
      },
    ],
  },
  {
    slug: 'order-workflow',
    label: 'Order Status & Workflow',
    articles: [
      {
        slug: 'status-overview',
        title: 'How an order moves from placed to delivered',
        body: [
          {
            type: 'p',
            text: 'Every order follows the same basic path. Here it is from start to finish:',
          },
          {
            type: 'steps',
            items: [
              'Awaiting Payment — the order was just placed. The customer sees "Order Received." Delivery cost is still an estimate at this point, because we don\'t know the real weight yet.',
              'Payment Confirmed — staff tick the "Payment confirmed" checkbox once payment has actually come in. This automatically creates the supplier order for procurement (but doesn\'t pay the supplier yet). The customer is notified by WhatsApp.',
              'Order Created — the system sets this automatically once the supplier order has been created. It\'s an internal-only status; the customer never sees it and isn\'t notified. This unlocks the "Pay now" step.',
              'Staff click "Pay now" — this actually charges the supplier and kicks off procurement. Once it\'s processed, the order moves back to Payment Confirmed internally (this is the one step that goes "backwards" — see "Confirming payment" for why).',
              'Shipped — staff set this manually once the order has physically shipped. Customer sees "Shipped" and gets a WhatsApp notification.',
              'Completed — staff set this manually once the order is delivered/done. Customer sees "Completed" and gets a WhatsApp notification.',
            ],
          },
          {
            type: 'p',
            text: 'At any point, an order can instead be moved to one of these instead of the normal path:',
          },
          {
            type: 'list',
            items: [
              'Cancelled — customer is notified by WhatsApp.',
              'Expired — the order\'s payment window passed without payment. Customer sees "Expired," but is not sent a WhatsApp message for this one.',
              'Needs Review — an internal-only flag for an order that needs a closer look. Customer isn\'t notified and doesn\'t see this status.',
            ],
          },
        ],
      },
      {
        slug: 'confirming-payment',
        title: 'Confirming payment (and why it triggers an automation)',
        body: [
          {
            type: 'p',
            text: 'Ticking "Payment confirmed" — whether from the orders list or the order detail page — is not just a label change. It immediately notifies our procurement system, which automatically creates a supplier order for the items in that order. You\'ll be asked to confirm before this happens, because it can\'t be undone from the admin portal afterwards.',
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'Confirming payment does NOT charge the supplier yet — it only creates the supplier order. Charging the supplier is a separate "Pay now" step (see below), so that spending money is always a deliberate, second action.',
          },
          {
            type: 'p',
            text: 'This is also why "Payment Confirmed" is the one status you can\'t apply to several orders at once from the bulk action bar — it always needs its own individual confirmation, order by order.',
          },
        ],
      },
      {
        slug: 'pay-now',
        title: 'Paying the supplier ("Pay now")',
        body: [
          {
            type: 'p',
            text: 'Once an order reaches the internal "Order Created" status (which happens automatically right after payment is confirmed), a "Pay supplier" card appears on the order detail page with a "Pay now" button.',
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'This is the step that actually spends real money — it charges our linked supplier account. Only click it once you\'re sure. You\'ll get a confirmation prompt first, and the button becomes "Payment requested" and locks once you\'ve clicked it, so it can\'t be clicked twice by accident.',
          },
          {
            type: 'p',
            text: 'After the payment goes through, the order\'s internal status moves back to "Payment Confirmed." That\'s expected — it doesn\'t mean anything went wrong. It simply reflects that the order is now paid-for and being procured.',
          },
        ],
      },
      {
        slug: 'weight-and-warehouse',
        title: 'Weight entry and warehouse arrival',
        body: [
          {
            type: 'p',
            text: 'These two cards on the order detail page are both manual, staff-entered steps — there\'s no automatic scale or warehouse scanner feeding this data in.',
          },
          {
            type: 'list',
            items: [
              'Order weight — when the physical order is weighed, enter the real weight here. This recalculates the delivery cost from an estimate to the real figure, and updates the order total. You can update this again later if needed — there\'s no confirmation prompt, since it\'s a correction you might make more than once.',
              'Warehouse storage — click "Mark as arrived" the moment the order physically reaches the warehouse. This starts the storage-fee clock: the first 7 days are free, then it accrues at $0.50 per day. Unlike weight, this is one-way — once marked, it can\'t be undone from here, so only click it once the order has genuinely arrived.',
            ],
          },
        ],
      },
      {
        slug: 'manage-order',
        title: 'Changing status manually and adding notes',
        body: [
          {
            type: 'p',
            text: 'The "Manage order" card on the order detail page is where you set a status by hand — for everything except Payment Confirmed and Order Created, which are only ever set through their own dedicated flows described above.',
          },
          {
            type: 'p',
            text: 'Pick a new status from the dropdown, optionally add or edit the internal notes underneath, then click "Save changes." Unlike Payment Confirmed and Pay Now, this doesn\'t ask for confirmation first — it\'s meant for the routine day-to-day updates (marking something Shipped, Completed, or adding a note for a colleague).',
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Internal notes are for staff only — the customer never sees them. Use them to leave context for whoever picks up the order next.',
          },
        ],
      },
    ],
  },
  {
    slug: 'troubleshooting',
    label: 'Troubleshooting & FAQ',
    articles: [
      {
        slug: 'common-issues',
        title: 'Common issues',
        body: [
          {
            type: 'p',
            text: '"This order was changed elsewhere — refresh to see the latest before saving." — This means someone else (or another browser tab) saved a change to this exact order after you opened it. Refresh the page to load the latest version, then make your change again. This is a safety check, not an error — it exists specifically so two people can\'t accidentally overwrite each other\'s work.',
          },
          {
            type: 'p',
            text: '"No line items recorded (or the stored data could not be parsed)." — The order\'s item details didn\'t save correctly, usually from a manual edit outside the normal order flow. The order itself is still valid; flag it so the underlying data can be corrected.',
          },
          {
            type: 'p',
            text: 'The "Payment confirmed" checkbox is greyed out — It\'s only clickable while an order is still "Awaiting Payment." Once payment has been confirmed (or the order has moved past that point, or been cancelled/expired), the checkbox locks to prevent it being toggled again by accident.',
          },
          {
            type: 'p',
            text: '"Estimated" badge next to delivery cost — this means the order weight hasn\'t been entered yet, so the delivery figure is a placeholder. Enter the real weight once it\'s known and the figure updates automatically.',
          },
        ],
      },
      {
        slug: 'good-habits',
        title: 'A few good habits',
        body: [
          {
            type: 'list',
            items: [
              'Double-check the order reference before clicking "Payment confirmed" or "Pay now" — both trigger real, hard-to-reverse actions.',
              'Leave a quick internal note whenever you do something unusual to an order, so the next person has context.',
              'Weigh and record the order as soon as you can — the delivery total customers see stays an estimate until you do.',
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
