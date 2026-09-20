# Admin workspace refresh

The admin workspace shares the public site's cream, ink, violet and lilac palette, with Outfit headings and DM Sans body text. Styles are scoped to admin pages and their portaled controls. Decorative subtitles and the redundant Operations navigation item have been removed; old Operations bookmarks redirect to Orders.

## Dashboard and reporting

Overview is the default dashboard and covers the last 30 days, with key figures, service-fee/markup charts, order statuses and country summaries. Reports offers UTC calendar months, quarters and years, comparison tables, income and order-outcome charts. Both views refresh every minute while visible and provide manual refresh and Excel export.

Reporting queries are read-only, follow every Graph page and fail rather than show a partial dataset. Orders are grouped by creation date and their current status. Completed-order service fees and markup are an income proxy before refunds and costs, not verified cash receipts or net profit. Potential income includes quoted fees and markup; cancelled/expired opportunity is identified separately. Historical reports can change when order statuses change. In-progress calendar periods are explicitly compared with the full preceding period.

The Excel export contains Summary, Periods, Countries, Orders, Adjustments and Definitions sheets. Typed source data and formulas support counts, ratios, income, opportunity and reconciliations. Refund records, refund amounts and operating costs are absent from the current order schema: yellow input cells accept manual adjustments, and dependent figures remain unavailable until supplied. No customer contact information is exported. Workbook edits do not write to the portal or SharePoint.

## Orders and mobile layouts

Orders supports existing status/search filters, mobile cards, selection and payment controls. It refreshes every minute while visible and online, pausing during selection, focused editing and open confirmation dialogs. Manual refresh is also available.

Detail pages provide section shortcuts, wrapping customer and item information, aligned currency amounts, copy controls and a clearer pricing breakdown. Management retains unsaved-change and discard controls. A browser unload prompt protects unsaved notes/status; staff should save before ordinary in-app navigation. Help Centre provides searchable articles and a mobile topic selector.

## Delivery display policy and integration boundary

Both list and detail totals are calculated from product cost, service fee, markup, actual delivery when finalized, and applicable storage. Delivery is excluded while IsDeliveryEstimated is true or absent, or the delivery amount is invalid. Missing goods/service amounts produce an unavailable total rather than zero. The existing seven-day storage grace period and daily rate are preserved.

This is a display policy, not a data migration: stored checkout estimates and totals remain unchanged in SharePoint. Reporting income excludes delivery and storage. No SharePoint schema, authentication, status mapping, API write contract, supplier/payment trigger or aa_catalog code was changed. The existing order repository's list projection now calculates display totals; the new reporting repository only reads orders.

## Verification

- 15 pricing/reporting tests cover estimates, storage, rolling/calendar boundaries, missing values, pagination, workbook formulas and safe text export: `node --test scripts/admin-pricing.test.mjs scripts/admin-reporting.test.cjs`.
- Exported sample workbook independently recalculated, manual adjustment formulas checked and summary rendered for inspection.
- Production build including TypeScript passed. Public English/Somali pages and admin login returned 200; protected admin pages redirected to sign-in and reporting APIs returned 401 for signed-out requests.
- Targeted ESLint across admin routes, features, layouts and test scripts passed.
- No live order mutations or supplier/payment actions exercised.
- No connected browser is available in this environment. Responsive layouts were implemented, but authenticated desktop/phone visual and touch checks remain outstanding.
