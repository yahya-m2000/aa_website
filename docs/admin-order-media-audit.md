# Order images and activity

Order details now display product thumbnails with an enlarged keyboard-accessible viewer. Orders also show who last changed them, and an activity timeline for staff, customer checkout, and automation changes. Existing orders show their creation date until their next attributed change; no historical attribution is invented.

Provision schema before deploying either application:

```powershell
node scripts/provision-audit.mjs
```

This creates five single-line/date audit columns on Orders, indexes InternalStatus and CreatedAt, and creates the Order Activity list with a unique EventKey. It never edits order data or purchasing controls. It is safe to rerun.

Provisioning was completed and rerun successfully on 2026-09-28. The shared activity list ID is `801b1ff0-583e-4b9e-97fc-fd0583819406`.

Set these environment variables on Render:

```dotenv
# aagroup-web
ADMIN_GRAPH_ACTIVITY_LIST_ID=801b1ff0-583e-4b9e-97fc-fd0583819406
# aa_catalog/server
GRAPH_ACTIVITY_LIST_ID=801b1ff0-583e-4b9e-97fc-fd0583819406
```

The local web `.env` has been configured. Both repos' `.env.example` files include the new setting (the web repo already ignores `.env*`). After schema provisioning, deploy both applications; either can deploy first. Without the activity-list setting, timeline reads and writes no-op, while order attribution fields are still written. Schema provisioning is therefore required even when timeline logging is disabled.

Attribution is included in existing conditional order writes. Purchase fingerprints, supplier dispatch claims, and raw LineItemsJson preservation are unchanged. Activity writes are awaited with bounded Graph requests, deduplicated by event key for queued/automation actions, and failures are logged without failing business operations. The timeline shows up to 50 recent events; all stored events remain in SharePoint. Email and push delivery bookkeeping is excluded.

Validation: both type checks/builds, changed-file ESLint, web pricing/reporting/fulfilment tests, web procurement/audit tests, and the server suite. Read-only live Graph checks loaded all nine orders with thumbnails and an order detail with its activity query. No live supplier calls or order edits were used for verification. Browser interaction and 375px layout checks remain manual because no browser was available in the implementation session.

Before release, verify viewer open/close, arrow keys, Previous/Next, broken-image fallback, full-size and Taobao links, and timeline expansion on desktop and at 375px. Use a designated test order for staff edit attribution checks. Payment and supplier actions are covered with mocked tests; do not exercise live purchasing for UI verification.
