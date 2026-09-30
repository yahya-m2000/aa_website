import { findRecord, listRecords, type DeliveryData, type DurableRecord } from '@/features/admin-automation/records';
import { getOrderItemByReference } from '@/features/admin-orders/orders.repository';
import { productImageUrl } from '@/features/admin-orders/product-media';
import { getGraphClient, GraphRequestError } from '@/core/graph/graph.client';
import { graphEnv } from '@/core/graph/env';
import type { GraphListItem, InternalStatus, OrderLineItem, OrderListItemFields } from '@/features/admin-orders/types';
import { loadTranslations, translationKey, type ProductTranslation } from './translations';

// Everything a warehouse worker is allowed to see. Deliberately excludes prices, fees, totals,
// phone numbers, emails, supplier IDs and internal notes: pages must build from these types only.
export interface WarehouseItem {
  title: string;
  variant?: string;
  /** Seller's original Chinese text, matching what's printed on Taobao packaging. */
  titleZh?: string;
  variantZh?: string;
  quantity: number;
  imageUrl?: string;
}
export interface WarehouseRecipient {
  name: string;
  address?: string;
  city?: string;
  postcode?: string;
  country?: string;
}
export interface WarehouseOrder {
  reference: string;
  etag: string;
  status: InternalStatus;
  createdAt: string;
  recipient: WarehouseRecipient;
  items: WarehouseItem[];
  arrivedAt?: string;
  weightKg?: number;
  weighed: boolean;
  deliveryGroupId?: string;
  supplierPaid: boolean;
}
export interface WarehouseDelivery {
  key: string;
  etag: string;
  state: string;
  recipient: { name: string; destination: string };
  orderCount: number;
  orders: WarehouseOrder[];
  weightKg?: number;
  paid: boolean;
  tracking?: string;
}
export interface WarehouseQueue {
  awaitingArrival: WarehouseOrder[];
  needsWeighing: WarehouseOrder[];
  deliveries: WarehouseDelivery[];
}

// Statuses in which physical warehouse work (arrival, weighing) can still happen.
export const WAREHOUSE_ACTIVE_STATUSES: InternalStatus[] = ['Payment Confirmed', 'Order Created', 'Needs Review'];

function parseLines(raw: string | undefined): OrderLineItem[] {
  try {
    const parsed = JSON.parse(raw ?? '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function chineseVariant(line: OrderLineItem): string | undefined {
  const options = Array.isArray(line.variantOptions) ? line.variantOptions : [];
  if (!options.length || !options.every((v) => v.originalName || v.originalValue)) return undefined;
  return options.map((v) => `${v.originalName ?? v.name}: ${v.originalValue ?? v.value}`).join(' · ');
}

function hasChinese(line: OrderLineItem): boolean {
  return Boolean(line.productTitleOriginal);
}

function toItem(line: OrderLineItem, translations: Map<string, ProductTranslation>): WarehouseItem {
  const stored = translations.get(translationKey(line));
  return {
    title: typeof line.productTitle === 'string' ? line.productTitle : '',
    variant: Array.isArray(line.variantOptions) && line.variantOptions.length
      ? line.variantOptions.map((v) => `${v.name}: ${v.value}`).join(' · ')
      : undefined,
    titleZh: line.productTitleOriginal || stored?.titleZh,
    variantZh: chineseVariant(line) ?? stored?.variantZh,
    quantity: Number(line.quantity) || 0,
    imageUrl: productImageUrl(line),
  };
}

// Only lines from older orders lack Chinese text on the order itself.
async function translationsFor(items: Array<Pick<GraphListItem, 'fields'>>): Promise<Map<string, ProductTranslation>> {
  const keys = items.flatMap((item) => parseLines(item.fields.LineItemsJson).filter((line) => !hasChinese(line)).map(translationKey));
  return loadTranslations(keys);
}

export function toWarehouseOrder(
  item: Pick<GraphListItem, 'fields' | '@odata.etag'>,
  translations: Map<string, ProductTranslation> = new Map(),
): WarehouseOrder {
  const f: Partial<OrderListItemFields> = item.fields;
  return {
    reference: f.OrderReference ?? '',
    etag: item['@odata.etag'],
    status: (f.InternalStatus ?? 'Needs Review') as InternalStatus,
    createdAt: f.CreatedAt ?? '',
    recipient: {
      name: f.CustomerFullName ?? '',
      address: f.ShippingAddress || undefined,
      city: f.City || undefined,
      postcode: f.Postcode || undefined,
      country: f.Country || undefined,
    },
    items: parseLines(f.LineItemsJson).map((line) => toItem(line, translations)),
    arrivedAt: f.ArrivedAtWarehouseAt || undefined,
    weightKg: typeof f.WeightKg === 'number' ? f.WeightKg : undefined,
    weighed: f.IsDeliveryEstimated === false,
    deliveryGroupId: f.DeliveryGroupId || undefined,
    supplierPaid: f.HiobuyPurchaseStatus === 'Paid',
  };
}

export async function getWarehouseOrder(reference: string): Promise<WarehouseOrder | null> {
  const item = await getOrderItemByReference(reference.trim());
  return item ? toWarehouseOrder(item, await translationsFor([item])) : null;
}

function toWarehouseDelivery(record: DurableRecord<DeliveryData>, orders: WarehouseOrder[]): WarehouseDelivery {
  return {
    key: record.key,
    etag: record.etag,
    state: record.state,
    recipient: { name: record.data.customer, destination: record.data.destination },
    orderCount: record.data.references.length,
    orders,
    weightKg: record.data.weightKg,
    paid: Boolean(record.data.paidAt),
    tracking: record.data.tracking,
  };
}

export async function getWarehouseDelivery(key: string): Promise<WarehouseDelivery | null> {
  const record = await findRecord<DeliveryData>('deliveries', key);
  if (!record) return null;
  const items = (await Promise.all(record.data.references.map((reference) => getOrderItemByReference(reference))))
    .filter((item): item is GraphListItem => Boolean(item));
  const translations = await translationsFor(items);
  return toWarehouseDelivery(record, items.map((item) => toWarehouseOrder(item, translations)));
}

export async function getWarehouseQueue(): Promise<WarehouseQueue> {
  let items: GraphListItem[] = [];
  try {
    const result = await getGraphClient()
      .api(`/sites/${graphEnv.siteId}/lists/${graphEnv.ordersListId}/items`)
      .expand('fields')
      .filter(WAREHOUSE_ACTIVE_STATUSES.map((status) => `fields/InternalStatus eq '${status}'`).join(' or '))
      .header('Prefer', 'HonorNonIndexedQueriesWarningMayFailRandomly')
      .top(500)
      .get();
    items = result.value ?? [];
  } catch (error) {
    throw new GraphRequestError('Failed to load warehouse orders', undefined, error);
  }
  const orders = items.map((item) => toWarehouseOrder(item)).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const deliveries = process.env.ADMIN_GRAPH_DELIVERIES_LIST_ID
    ? await listRecords<DeliveryData>('deliveries', "fields/RecordState eq 'Ready'")
    : [];
  return {
    awaitingArrival: orders.filter((order) => !order.arrivedAt && order.supplierPaid),
    needsWeighing: orders.filter((order) => order.arrivedAt && !order.weighed && !order.deliveryGroupId),
    deliveries: deliveries
      .filter((delivery) => !delivery.data.tracking)
      .map((delivery) => toWarehouseDelivery(delivery, [])),
  };
}
