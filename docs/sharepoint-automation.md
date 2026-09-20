# SharePoint automation and combined deliveries

The purchase worker runs in `aa_catalog/server`. The CMS submits a durable SharePoint operation; it does not call HIOBuy. No PostgreSQL or Redis is required. The worker polls indexed pending records every five seconds. Only the production server should enable the worker.

## Lists and configuration

Provisioned on the existing Orders site:

- Automation Operations: `fc5b800b-a518-4a23-b3df-f864a1e9bb24`
- Deliveries: `fa7749ff-4e4a-4b77-8355-ed92245bea40`
- Orders has an additional indexed `DeliveryGroupId` text field.

Both lists use unique, indexed `RecordKey`, indexed `RecordState` and `RecordPending`, indexed `OrderReference`, and non-appending multiline `RecordData`. The tested SharePoint Boolean filter uses `RecordPending eq 1`; `eq true` returned incorrect results on this tenant. Every update includes the complete JSON field and an ETag. Keys must never be deleted/reused to retry purchases. Restrict direct list editing to maintainers; the CMS is the staff interface.

Website environment: `ADMIN_GRAPH_OPERATIONS_LIST_ID` and `ADMIN_GRAPH_DELIVERIES_LIST_ID`.

Server environment: `GRAPH_OPERATIONS_LIST_ID` and `GRAPH_DELIVERIES_LIST_ID`, plus `AUTOMATION_WORKER_ENABLED=true` **only on the production server**. The worker also requires production mode and live HIOBuy configuration. Existing Graph credentials, receiver configuration and Graph mail configuration continue to apply. Local development must leave the worker flag false.

## Purchase safety

Customer payment confirmation creates `create:<reference>`; supplier payment creates `pay:<supplier-id>`. Unique keys make accepted commands permanent and replay-safe. Approved order contents are fingerprinted; changed contents require review. Mutable order statuses never authorize another purchase.

Queued operations validate the order and persist consent before an ETag-protected transition to Dispatching. Only the winner can contact HIOBuy. Supplier create/pay HTTP and network failures are never automatically retried. A restart or lost response after dispatch is treated as an unknown outcome, not an available job. A successful supplier result is saved in the ledger before order synchronization. Failed synchronization retries the SharePoint projection only.

Creation also refreshes each product's raw opaque HioBuy ID, verifies the exact SKU and source product, and requires a successful read-only order preview. The dispatch claim records purchase lines, preview request ID and supplier total in CNY minor units. These diagnostics do not alter customer charges. See [the September investigation](procurement-investigation-2026-09-20.md) for the unresolved historical pricing failure and current activation state.

Known supplier payments requiring review are checked read-only at most once an hour. A matching supplier ID, paid timestamp and paid-stage supplier status are required to repair the payment record. Unknown creation results and partial creation stay under review. Staff can record a verified existing supplier result, with an evidence note; that action never purchases or pays anything. There is deliberately no generic Retry Payment or Reset button.

Notifications have separate claimed/sent/skipped/unknown states. An ambiguous notification send never repeats a supplier action. Graph mail acceptance is not proof of inbox delivery; unknown notification outcomes remain visible in the list.

The old `/api/internal/orders/:reference/procure` and `/pay` routes return 410. Their service functions also refuse execution, so legacy code cannot bypass the ledger. Leave both old Power Automate flows disabled. Normal order expiry now excludes confirmed, procured and queued orders.

## Staff workflow

1. Confirm customer payment once. Supplier progress shows Queued, Processing or Complete.
2. When creation completes, press Pay now once. Refreshing or changing status never unlocks the accepted action.
3. If Needs review appears, check the supplier records and receipts. Do not create a substitute order or pay again to repair a missing CMS result.
4. Select eligible orders on Orders and choose Combine delivery. Phone and destination must match. Existing finalized delivery charges must be reconciled before combining.
5. Enter one combined weight, confirm delivery money received once, then add tracking and dispatch. Every included order must have recorded supplier payment.

Goods/service/storage stay per order. Shared delivery charges are excluded from individual order totals and shown separately with the group link. The customer app/API receives the same distinction. Dashboard income reporting already excludes freight and therefore does not double-count it.

Linking is resumable if a SharePoint write is interrupted. Unweighed, unpaid groups can be dissolved. Once weighed/paid/dispatched, membership is fixed. A dissolved group can be recreated as a new generation. Group shipment/completion is projected to its orders by the server worker; ETags prevent overwriting concurrent edits.

## Migration and activation

The lists were provisioned and their uniqueness/ETag behavior tested on a disposable record. Historical orders were imported as locked operations, never queued for new purchases. Mustafe's three recorded supplier orders were checked read-only with HIOBuy. All three had paid timestamps and `wait_shipment`; the two missing SharePoint payment outcomes were repaired without supplier mutations. His three orders are linked to `DLV-23A2C81A6CD288A9`, ready for weighing. No weight, delivery payment or dispatch was invented.

The user confirmed both old procurement/payment flows are off. Worker control remains disabled until deployment is complete.

Deployment sequence:

1. Deploy the updated `aa_catalog/server` and configure its two list IDs, production/live mode and worker flag. Rotate the exposed internal task credential in the server and any remaining legitimate callers. The archived JSON exports have been redacted.
2. Deploy the website with its two list IDs. Release the customer app update to show combined delivery explicitly. Older clients cannot display the new group details.
3. Run `node scripts/fulfilment-control.mjs inspect` from the website repository and verify historical records. `seed` is repeatable and never queues purchases.
4. Check authenticated `GET /api/internal/automation/status` on the deployed server. It must return version `sharepoint-v1` and a fresh heartbeat. Confirm only the intended production worker is enabled.
5. From the website repository, run `node scripts/fulfilment-control.mjs enable --flows-disabled --migration-reviewed`. This refuses activation without a fresh heartbeat. It does not create any orders.
6. Check a deliberately authorized new order through the normal staff controls, verifying its supplier result. Do not use an existing order as a live purchase test.

Emergency pause: `node scripts/fulfilment-control.mjs disable`. Already dispatched supplier requests may complete; pausing is not cancellation. Never roll back to the old unguarded supplier endpoints or re-enable old flows.

`server/scripts/reconcile-recorded-payments.cjs` is a narrowly scoped maintenance command: it checks only Review/payment operations with known supplier IDs, uses read-only supplier detail calls, and repairs verified SharePoint outcomes. It never starts the purchase worker.

## Verification commands

- Website: `npm run build`; targeted ESLint; `node --test scripts/admin-pricing.test.mjs scripts/admin-reporting.test.cjs scripts/admin-fulfilment.test.cjs`.
- Server: `npm run typecheck`, `npm run build`, `npm test`.
- Customer app: `npx tsc --noEmit`.
- SharePoint atomicity: `node scripts/fulfilment-control.mjs verify` creates and deletes only its own disposable test record.

No live supplier create/pay calls are used by these checks. Browser/mobile visual inspection and production activation require an available browser/deployment connection.
