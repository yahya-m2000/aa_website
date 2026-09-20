# Procurement investigation — 20 September 2026

Affected order: `ORD-8HRQLDNCQJ7A`. Source item: `878761108911`.
Selected SKU: `5719868301668`.

## Established facts

- HioBuy support's email confirms procurement requires the raw opaque search/detail `id` and corresponding `variants[].sku_id`. Numeric source IDs and application-prefixed IDs must not be sent as purchase IDs.
- The affected order already stores `0000zt3hBZtkTjdnhIBIe91DRyNYCzkAR8XUtQLSWho29s4`. Fresh detail returned the same ID and selected SKU on 20 September. Detail request: `req_6aeb3a0945037db9c536fbf4`.
- A read-only standard preview with that exact stored ID/SKU and quantity 1 succeeded: merchandise 2, shipping 599, payment 601, all CNY minor units. Preview request: `req_c749523689c525dc9923ee19`.
- This does not establish why yesterday's creation failed. It also does not prove that a subsequent creation would succeed. No minimum-price restriction was established.
- The old failure record has neither a supplier ID nor a request ID. It remains in Review. No create/pay request was repeated, and no failure record was reset.
- Two leftover `local-worker-poll-LIVE.mjs` processes were running. Shared dispatch was disabled, then both processes stopped. Their presence does not itself prove duplicate supplier requests: the ETag dispatch claim still protects concurrent workers.
- Final read-back: control disabled, no pending operation records.

## Changes

The integrated `aa_catalog/server` worker now fetches fresh product details, checks source identity and the exact SKU, then requires a successful standard pricing/availability preview before claiming creation. It uses fresh raw detail IDs for creation; preview's internal offer/SKU IDs are never substituted. It stores the preview request ID, total in CNY minor units and exact purchase lines with the dispatch claim. These are supplier diagnostics, not customer delivery estimates or changes to customer charges.

HTTP errors retain HioBuy request IDs, including the response-header fallback. Order details and review emails display the available reference. Creation/payment still have no automatic mutation retries. Existing Review operations remain locked.

The ad hoc local live and sandbox polling harnesses now refuse to start: both enabled and consumed the same shared production queue. Use the integrated server for deployment and isolated mocked tests for development.

## Validation and remaining work

314 backend tests and 21 CMS tests passed. Backend, website and customer app type checks passed; backend and website production builds passed. Tests made no supplier mutations.

The website build initially failed because Tailwind scanned non-application text and encountered an invalid CSS escape. Its source scan is now explicitly scoped to `src`; the subsequent production build passed.

Production deployment and activation remain outstanding. The deployment connection is not established in this workspace. Keep the two former Power Automate flows off. Do not enable the queue until the intended updated server is deployed. The affected order requires supplier-side reconciliation before any further purchase action; successful preview alone is insufficient evidence to retry.
