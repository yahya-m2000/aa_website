import { getGraphClient } from "@/core/graph/graph.client";
import { graphEnv } from "@/core/graph/env";

export interface DurableRecord<T = Record<string, unknown>> {
  id: string;
  etag: string;
  key: string;
  state: string;
  reference: string;
  data: T;
}
export interface OperationData {
  approvedFingerprint?: string;
  dispatchToken?: string;
  kind: "create" | "pay";
  actor: string;
  requestedAt: string;
  updatedAt: string;
  supplierId?: string;
  requestId?: string;
  previewRequestId?: string;
  previewTotalCnyMinor?: number;
  purchaseLines?: Array<{ id: string; spec_id?: string; quantity: number }>;
  paidAt?: string;
  nextCheckAt?: string;
  message?: string;
  synced?: boolean;
  notification?: "Pending" | "Sending" | "Sent" | "Unknown" | "Skipped";
  legacy?: boolean;
}
export interface DeliveryData {
  references: string[];
  recipientKey?: string;
  customer: string;
  phone: string;
  destination: string;
  actor: string;
  createdAt: string;
  updatedAt: string;
  weightKg?: number;
  chargeUsd?: number;
  rateUsdPerKg?: number;
  paidAt?: string;
  tracking?: string;
  history: Array<{ at: string; actor: string; action: string }>;
  message?: string;
  syncedState?: string;
}
function pending(state: string, value: unknown): boolean {
  const data = value as OperationData & DeliveryData;
  if (data.references)
    return (
      ["Shipped", "Completed", "Dissolved"].includes(state) &&
      data.syncedState !== state
    );
  return (
    ["Queued", "Dispatching"].includes(state) ||
    (state === "Review" && data.kind === "pay" && !!data.supplierId) ||
    (["Succeeded", "Review"].includes(state) &&
      !data.legacy &&
      (!data.synced ||
        ["Pending", "Sending"].includes(data.notification ?? "")))
  );
}
export type StoreName = "operations" | "deliveries";
function base(store: StoreName) {
  const id =
    store === "operations"
      ? process.env.ADMIN_GRAPH_OPERATIONS_LIST_ID
      : process.env.ADMIN_GRAPH_DELIVERIES_LIST_ID;
  if (!id) throw new Error("Fulfilment lists are not configured.");
  return `/sites/${graphEnv.siteId}/lists/${id}/items`;
}
function decode<T>(item: {
  id: string;
  "@odata.etag": string;
  fields: Record<string, string>;
}): DurableRecord<T> {
  if (!item.fields.RecordData)
    throw new Error("Missing fulfilment record data.");
  return {
    id: item.id,
    etag: item["@odata.etag"],
    key: item.fields.RecordKey,
    state: item.fields.RecordState,
    reference: item.fields.OrderReference ?? "",
    data: JSON.parse(item.fields.RecordData) as T,
  };
}
export async function findRecord<T>(
  store: StoreName,
  key: string,
): Promise<DurableRecord<T> | null> {
  const page = await getGraphClient()
    .api(base(store))
    .expand("fields")
    .filter(`fields/RecordKey eq '${key.replace(/'/g, "''")}'`)
    .get();
  if (page.value.length > 1) throw new Error("Record uniqueness violation.");
  return page.value[0] ? decode<T>(page.value[0]) : null;
}
export async function listRecords<T>(
  store: StoreName,
  filter?: string,
): Promise<DurableRecord<T>[]> {
  let next: string | undefined = base(store);
  const records: DurableRecord<T>[] = [];
  const seen = new Set<string>();
  while (next) {
    if (seen.has(next)) throw new Error("Repeated fulfilment page");
    seen.add(next);
    let req = getGraphClient().api(next).expand("fields").top(200);
    if (seen.size === 1 && filter) req = req.filter(filter);
    const page = await req.get();
    records.push(...page.value.map(decode<T>));
    next = page["@odata.nextLink"];
  }
  return records;
}
export async function createRecord<T>(
  store: StoreName,
  key: string,
  state: string,
  reference: string,
  data: T,
): Promise<DurableRecord<T>> {
  try {
    return decode<T>(
      await getGraphClient()
        .api(base(store))
        .post({
          fields: {
            Title: key,
            RecordKey: key,
            RecordState: state,
            RecordPending: pending(state, data),
            OrderReference: reference,
            RecordData: JSON.stringify(data),
          },
        }),
    );
  } catch (error) {
    // Includes a lost create response: never invent another key or assume failure.
    const existing = await findRecord<T>(store, key);
    if (existing) return existing;
    throw error;
  }
}
export async function replaceRecord<T>(
  store: StoreName,
  record: DurableRecord<T>,
  state: string,
  data: T,
): Promise<DurableRecord<T>> {
  // The entire JSON field is included on EVERY patch; no append-text SharePoint semantics.
  await getGraphClient()
    .api(`${base(store)}/${record.id}/fields`)
    .header("If-Match", record.etag)
    .patch({
      RecordState: state,
      RecordPending: pending(state, data),
      RecordData: JSON.stringify(data),
    });
  const latest = await findRecord<T>(store, record.key);
  if (!latest) throw new Error("Saved fulfilment record is unavailable.");
  return latest;
}
export const operationKey = (
  kind: "create" | "pay",
  reference: string,
  supplierId?: string,
) => `${kind}:${kind === "pay" ? supplierId : reference}`;
export async function workerControl() {
  return findRecord<{ enabled: boolean; heartbeat?: string }>(
    "operations",
    "control",
  );
}
