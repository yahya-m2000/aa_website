import { graphEnv } from '@/core/graph/env';
import { GraphConflictError, GraphRequestError, getGraphClient } from '@/core/graph/graph.client';
import { sendOrderStatusWhatsApp } from '@/core/whatsapp/whatsapp.service';
import type { WhatsAppNotifiableStatus } from '@/core/whatsapp/whatsapp.types';
import { mapInternalToCustomerStatus } from './statusMapping';
import type {
  CustomerStatus,
  GraphListItem,
  OrderDetail,
  OrderLineItem,
  OrderListItemFields,
  OrderListRow,
} from './types';

function isWhatsAppNotifiable(status: string): status is WhatsAppNotifiableStatus {
  return status === 'Payment Confirmed' || status === 'Shipped' || status === 'Completed' || status === 'Cancelled';
}

function listBase(): string {
  return `/sites/${graphEnv.siteId}/lists/${graphEnv.ordersListId}`;
}

function toListRow(item: GraphListItem): OrderListRow {
  const f = item.fields;
  return {
    id: item.id,
    etag: item['@odata.etag'],
    reference: f.OrderReference,
    customerFullName: f.CustomerFullName,
    customerEmail: f.CustomerEmail,
    paymentMethod: f.PaymentMethod,
    customerStatus: f.CustomerStatus,
    internalStatus: f.InternalStatus,
    totalUsd: f.TotalUsd,
    createdAt: f.CreatedAt,
  };
}

// LineItemsJson is an unvalidated-by-SharePoint text blob (a manual grid-edit or a stray
// partial PATCH could leave it malformed) — parse defensively so a bad value degrades to an
// empty list instead of crashing the order-detail page. Logging on failure (rather than
// silently swallowing it) is deliberate: a silent empty-array fallback previously made a real
// data-availability bug (the LineItemsJson column had "Append Changes to Existing Text"
// enabled, which Graph can't read/write through the standard /items endpoint at all) look
// identical to "field genuinely empty" for far longer than it should have.
function parseLineItems(raw: string | undefined): OrderLineItem[] {
  if (raw === undefined) {
    console.warn('[admin-orders] LineItemsJson is missing from the Graph response entirely.');
    return [];
  }
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      console.warn('[admin-orders] LineItemsJson parsed but is not an array:', typeof parsed);
      return [];
    }
    return parsed as OrderLineItem[];
  } catch (error) {
    console.warn('[admin-orders] LineItemsJson failed to parse:', (error as Error).message);
    return [];
  }
}

export interface ListOrdersParams {
  pageSize: number;
  cursor?: string;
  status?: string;
  search?: string;
}

export interface ListOrdersResult {
  items: OrderListRow[];
  nextCursor: string | null;
}

/**
 * Paginated order list, newest first. Graph's SharePoint-list endpoint doesn't reliably
 * support $skip, so pagination is skiptoken-based via the @odata.nextLink Graph itself
 * returns — the caller holds a cursor-history stack for "page 1/2/3" UI, not true
 * random-access paging (plan's indexing note).
 *
 * CreatedAt/InternalStatus are not yet indexed SharePoint columns (plan's indexing note —
 * a manual Site owner -> List settings -> Indexed columns action, not doable from code), so
 * filtering/sorting on them requires the Prefer: HonorNonIndexedQueriesWarningMayFailRandomly
 * header or Graph rejects the request outright with 400 invalidRequest. This header is a
 * stopgap for this app's current low volume — once those columns are indexed in SharePoint,
 * this header becomes unnecessary (safe to leave in place either way).
 */
export async function listOrders(params: ListOrdersParams): Promise<ListOrdersResult> {
  try {
    const client = getGraphClient();
    const filters: string[] = [];
    if (params.status) {
      filters.push(`fields/InternalStatus eq '${params.status.replace(/'/g, "''")}'`);
    }
    if (params.search) {
      const escaped = params.search.replace(/'/g, "''");
      filters.push(
        `(startswith(fields/OrderReference,'${escaped}') or startswith(fields/CustomerEmail,'${escaped}') or startswith(fields/CustomerFullName,'${escaped}'))`,
      );
    }

    // A cursor is itself a full pre-built Graph @odata.nextLink URL (already encodes filter/
    // orderby/top from the first page), so filters/sort are only applied on the first page.
    let request = client
      .api(params.cursor ?? `${listBase()}/items`)
      .expand('fields')
      .header('Prefer', 'HonorNonIndexedQueriesWarningMayFailRandomly');
    if (!params.cursor) {
      request = request.top(params.pageSize).orderby('fields/CreatedAt desc');
      if (filters.length > 0) {
        request = request.filter(filters.join(' and '));
      }
    }

    const result = await request.get();

    const items = ((result.value ?? []) as GraphListItem[]).map(toListRow);
    const nextCursor = (result['@odata.nextLink'] as string | undefined) ?? null;
    return { items, nextCursor };
  } catch (error) {
    throw new GraphRequestError('Failed to list orders from SharePoint', undefined, error);
  }
}

export async function getOrderItemByReference(reference: string): Promise<GraphListItem | null> {
  try {
    const client = getGraphClient();
    const escaped = reference.replace(/'/g, "''");
    const result = await client
      .api(`${listBase()}/items`)
      .filter(`fields/OrderReference eq '${escaped}'`)
      .expand('fields')
      .get();

    const items = (result.value ?? []) as GraphListItem[];
    return items[0] ?? null;
  } catch (error) {
    throw new GraphRequestError('Failed to look up order in SharePoint', undefined, error);
  }
}

export async function getOrderDetailByReference(reference: string): Promise<OrderDetail | null> {
  const item = await getOrderItemByReference(reference);
  if (!item) return null;
  return {
    id: item.id,
    etag: item['@odata.etag'],
    fields: item.fields,
    lineItems: parseLineItems(item.fields.LineItemsJson),
  };
}

/**
 * SharePoint silently drops "multiple lines of text" columns (LineItemsJson,
 * InternalNotes) from an item on ANY partial /fields PATCH that doesn't explicitly
 * re-include them — this is the exact production data-loss bug this admin CMS exists to
 * prevent (2026-07-25 incident). Every PATCH must re-send their current values alongside
 * whatever's actually changing.
 */
const MULTILINE_TEXT_FIELDS = ['LineItemsJson', 'InternalNotes'] as const;

export async function updateOrderItemFields(
  itemId: string,
  etag: string,
  fields: Partial<OrderListItemFields>,
): Promise<string> {
  try {
    const client = getGraphClient();

    const needsMultilinePreservation = MULTILINE_TEXT_FIELDS.some((key) => !(key in fields));
    let patchFields = fields;

    if (needsMultilinePreservation) {
      const current = await client.api(`${listBase()}/items/${itemId}`).expand('fields').get();
      const preserved: Partial<OrderListItemFields> = {};
      for (const key of MULTILINE_TEXT_FIELDS) {
        if (!(key in fields) && current.fields[key] !== undefined) {
          preserved[key] = current.fields[key];
        }
      }
      patchFields = { ...preserved, ...fields };
    }

    const updated = await client
      .api(`${listBase()}/items/${itemId}/fields`)
      .header('If-Match', etag)
      .patch(patchFields);
    return (updated?.['@odata.etag'] as string | undefined) ?? etag;
  } catch (error) {
    const statusCode = (error as { statusCode?: number })?.statusCode;
    if (statusCode === 412) {
      throw new GraphConflictError(
        `Order item ${itemId} was modified concurrently (ETag mismatch) — refusing to overwrite`,
        error,
      );
    }
    throw new GraphRequestError(`Failed to update order item ${itemId}`, statusCode, error);
  }
}

export interface BulkUpdateResult {
  reference: string;
  ok: boolean;
  errorMessage?: string;
}

/**
 * Bulk non-critical status change across multiple orders. Deliberately separate from the
 * single-order write path used for Payment Confirmed (plan's write-path safety section) —
 * this function refuses that value outright, since a batch confirm across many orders would
 * fire the live procurement automation once per order with no per-order confirmation step,
 * which is out of scope for now (owner decision: bulk payment-confirm not built this round).
 *
 * Each order is looked up fresh (its own current etag, never a stale one from a list view)
 * and updated independently — one order's 409/412 doesn't abort the rest of the batch, since
 * staff processing many orders shouldn't have one conflict silently discard all their other
 * changes.
 */
export async function bulkUpdateInternalStatus(
  references: string[],
  internalStatus: Exclude<OrderListItemFields['InternalStatus'], 'Payment Confirmed'>,
): Promise<BulkUpdateResult[]> {
  if ((internalStatus as string) === 'Payment Confirmed') {
    throw new Error('bulkUpdateInternalStatus does not support Payment Confirmed — use the single-order write path.');
  }

  const results: BulkUpdateResult[] = [];
  for (const reference of references) {
    try {
      const item = await getOrderItemByReference(reference);
      if (!item) {
        results.push({ reference, ok: false, errorMessage: 'Order not found' });
        continue;
      }
      // Same derive-then-write behavior as the single-order status route (2026-07-26,
      // WhatsApp-notification project) — a bulk action changes InternalStatus just as much as
      // a single click does, so CustomerStatus must stay in sync here too, not just on the
      // single-order path. null (Order Created/Needs Review) correctly means "don't touch it."
      const derivedCustomerStatus = mapInternalToCustomerStatus(internalStatus);
      await updateOrderItemFields(item.id, item['@odata.etag'], {
        InternalStatus: internalStatus,
        ...(derivedCustomerStatus ? { CustomerStatus: derivedCustomerStatus } : {}),
      });
      // Fire-and-forget, per order — matches the single-order route's identical pattern. A
      // WhatsApp failure for one order in the batch never affects the others' results.
      if (derivedCustomerStatus && isWhatsAppNotifiable(derivedCustomerStatus)) {
        void sendOrderStatusWhatsApp(derivedCustomerStatus, {
          customerName: item.fields.CustomerFullName,
          customerPhone: item.fields.CustomerPhone,
          orderReference: item.fields.OrderReference,
        });
      }
      results.push({ reference, ok: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update order';
      results.push({ reference, ok: false, errorMessage: message });
    }
  }
  return results;
}

export interface OrderStats {
  statusBreakdown: Array<{ status: CustomerStatus; count: number }>;
  countryBreakdown: Array<{ country: string; count: number; totalUsd: number }>;
  revenueSeries: Array<{ date: string; orders: number; revenueUsd: number }>;
}

/**
 * Aggregates over a bounded date-range fetch — Graph has no $apply-style aggregation for
 * SharePoint list items, so this pulls raw items and reduces in Node. Trivial at this app's
 * volume (tens of orders/day, worst case ~1-3k items over 90 days).
 */
export async function getOrderStats(fromIso: string, toIso: string): Promise<OrderStats> {
  try {
    const client = getGraphClient();
    const result = await client
      .api(`${listBase()}/items`)
      .filter(`fields/CreatedAt ge '${fromIso}' and fields/CreatedAt le '${toIso}'`)
      .expand('fields')
      .top(999)
      .header('Prefer', 'HonorNonIndexedQueriesWarningMayFailRandomly')
      .get();

    const items = ((result.value ?? []) as GraphListItem[]).map((i) => i.fields);

    const statusMap = new Map<CustomerStatus, number>();
    const countryMap = new Map<string, { count: number; totalUsd: number }>();
    const dateMap = new Map<string, { orders: number; revenueUsd: number }>();

    for (const f of items) {
      statusMap.set(f.CustomerStatus, (statusMap.get(f.CustomerStatus) ?? 0) + 1);

      const country = f.Country || 'Unknown';
      const countryEntry = countryMap.get(country) ?? { count: 0, totalUsd: 0 };
      countryEntry.count += 1;
      // TotalUsd/ServiceFeeUsd aren't guaranteed numeric at runtime (a manually-edited or
      // malformed SharePoint item can leave a pricing field undefined despite the type
      // claiming `number` — same class of issue as LineItemsJson). Treating a bad value as 0
      // instead of letting it in keeps one broken order from NaN-poisoning its entire
      // country/date bucket's running total for every other order in that bucket.
      if (typeof f.TotalUsd === 'number' && !Number.isNaN(f.TotalUsd)) {
        countryEntry.totalUsd += f.TotalUsd;
      }
      countryMap.set(country, countryEntry);

      const date = f.CreatedAt.slice(0, 10);
      const dateEntry = dateMap.get(date) ?? { orders: 0, revenueUsd: 0 };
      dateEntry.orders += 1;
      // Revenue is the service fee only — the business's actual earnings per order.
      // SubtotalUsd/DeliveryUsd are cost passthrough, and markup is excluded here too
      // per an explicit owner decision (not counted as "revenue" on this chart).
      if (typeof f.ServiceFeeUsd === 'number' && !Number.isNaN(f.ServiceFeeUsd)) {
        dateEntry.revenueUsd += f.ServiceFeeUsd;
      }
      dateMap.set(date, dateEntry);
    }

    return {
      statusBreakdown: Array.from(statusMap.entries()).map(([status, count]) => ({ status, count })),
      countryBreakdown: Array.from(countryMap.entries()).map(([country, v]) => ({ country, ...v })),
      revenueSeries: Array.from(dateMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, v]) => ({ date, ...v })),
    };
  } catch (error) {
    throw new GraphRequestError('Failed to aggregate order stats from SharePoint', undefined, error);
  }
}
