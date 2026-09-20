import { createHash } from "node:crypto";
import type { OrderListItemFields } from "../admin-orders/types";
import {
  getOrderItemByReference,
  updateOrderItemFields,
} from "../admin-orders/orders.repository";
import {
  createRecord,
  findRecord,
  replaceRecord,
  type DeliveryData,
  type DurableRecord,
} from "./records";

const normalized = (s: string | undefined) =>
  (s ?? "").trim().toLowerCase().replace(/\s+/g, " ");
const identity = (f: OrderListItemFields) =>
  [
    f.CustomerPhone?.replace(/\D/g, ""),
    normalized(f.Country),
    normalized(f.City),
    normalized(f.ShippingAddress),
    normalized(f.Postcode),
  ].join("|");
const eligible = (status: string) =>
  !["Cancelled", "Expired", "Shipped", "Completed", "Needs Review"].includes(
    status,
  );
export async function combineDelivery(references: string[], actor: string) {
  const refs = [...new Set(references)].sort();
  if (refs.length < 2 || refs.length > 25)
    throw new Error("Select between 2 and 25 orders.");
  const baseKey = `DLV-${createHash("sha256").update(JSON.stringify(refs)).digest("hex").slice(0, 16).toUpperCase()}`;
  let key = baseKey;
  let existing = await findRecord<DeliveryData>("deliveries", key);
  let generation = 1;
  while (existing?.state === "Dissolved") {
    key = `${baseKey}-${++generation}`;
    existing = await findRecord<DeliveryData>("deliveries", key);
  }
  if (existing) return existing;
  const items = await Promise.all(refs.map(getOrderItemByReference));
  if (items.some((i) => !i)) throw new Error("An order could not be found.");
  const first = items[0]!.fields;
  if (!first.CustomerPhone || !first.Country || !first.City)
    throw new Error(
      "Customer phone, city and country are required before grouping.",
    );
  for (const item of items) {
    if (identity(item!.fields) !== identity(first))
      throw new Error(
        "The selected orders must have the same customer phone and delivery destination.",
      );
    if (!eligible(item!.fields.InternalStatus) || item!.fields.DeliveryGroupId)
      throw new Error("An order is already grouped, dispatched or closed.");
    if (item!.fields.IsDeliveryEstimated === false)
      throw new Error(
        "An order already has finalized delivery charges. Reconcile those charges before grouping.",
      );
  }
  const now = new Date().toISOString();
  const record = await createRecord<DeliveryData>(
    "deliveries",
    key,
    "Linking",
    refs[0],
    {
      references: refs,
      recipientKey: identity(first),
      actor,
      createdAt: now,
      updatedAt: now,
      customer: first.CustomerFullName,
      phone: first.CustomerPhone,
      destination: [
        first.ShippingAddress,
        first.City,
        first.Postcode,
        first.Country,
      ]
        .filter(Boolean)
        .join(", "),
      history: [{ at: now, actor, action: "Combined delivery requested" }],
    },
  );
  return finishGrouping(record, actor);
}

export async function finishGrouping(
  record: DurableRecord<DeliveryData>,
  actor: string,
) {
  if (record.state !== "Linking") return record;
  // Each order is reserved conditionally. A partial write leaves a visible Linking group;
  // retrying this same group resumes, never silently steals another group's membership.
  for (const ref of record.data.references) {
    const item = await getOrderItemByReference(ref);
    if (!item || !eligible(item.fields.InternalStatus))
      throw new Error(
        "An order is no longer eligible. Dissolve this unfinished group.",
      );
    if (
      record.data.recipientKey &&
      identity(item.fields) !== record.data.recipientKey
    )
      throw new Error(
        "Recipient details changed. Dissolve the group and verify the destination.",
      );
    const current = await findRecord<DeliveryData>("deliveries", record.key);
    if (current?.state !== "Linking")
      throw new Error("Grouping changed. Refresh before continuing.");
    if (item.fields.DeliveryGroupId === record.key) continue;
    if (
      item.fields.DeliveryGroupId ||
      item.fields.IsDeliveryEstimated === false
    )
      throw new Error(
        "An order was assigned or weighed elsewhere. Dissolve this unfinished group.",
      );
    await updateOrderItemFields(item.id, item["@odata.etag"], {
      DeliveryGroupId: record.key,
    });
  }
  const latest = await findRecord<DeliveryData>("deliveries", record.key);
  if (!latest || latest.state !== "Linking")
    throw new Error("Delivery changed. Refresh before continuing.");
  return replaceRecord("deliveries", latest, "Ready", {
    ...latest.data,
    updatedAt: new Date().toISOString(),
    history: [
      ...latest.data.history,
      { at: new Date().toISOString(), actor, action: "Orders linked" },
    ],
  });
}

export async function updateDelivery(
  key: string,
  etag: string,
  action: string,
  actor: string,
  weightKg?: number,
  tracking?: string,
) {
  let record = await findRecord<DeliveryData>("deliveries", key);
  if (!record || record.etag !== etag)
    throw new Error("Delivery changed. Refresh before continuing.");
  if (action === "resume") return finishGrouping(record, actor);
  const data = { ...record.data, updatedAt: new Date().toISOString() };
  let state = record.state;
  if (action === "dissolve") {
    if (
      !["Linking", "Ready", "Dissolving"].includes(state) ||
      data.paidAt ||
      data.weightKg
    )
      throw new Error(
        "A weighed, paid or dispatched delivery cannot be dissolved.",
      );
    record = await replaceRecord("deliveries", record, "Dissolving", data);
    for (const ref of data.references) {
      const item = await getOrderItemByReference(ref);
      if (
        item &&
        (!item.fields.DeliveryGroupId || item.fields.DeliveryGroupId === key)
      )
        await updateOrderItemFields(item.id, item["@odata.etag"], {
          DeliveryGroupId: "",
        });
    }
    state = "Dissolved";
  } else if (action === "weigh") {
    if (
      state !== "Ready" ||
      data.paidAt ||
      !weightKg ||
      !Number.isFinite(weightKg) ||
      weightKg > 10000
    )
      throw new Error("Enter a valid weight for an unpaid, ready delivery.");
    data.weightKg = weightKg;
    data.rateUsdPerKg = 13;
    data.chargeUsd = Math.round(weightKg * 1300) / 100;
  } else if (action === "paid") {
    if (state !== "Ready" || data.paidAt || data.chargeUsd === undefined)
      throw new Error("Weigh the delivery before confirming payment.");
    data.paidAt = new Date().toISOString();
  } else if (action === "ship") {
    if (state !== "Ready" || !data.paidAt || !tracking?.trim())
      throw new Error(
        "Confirm delivery payment and enter tracking before dispatch.",
      );
    for (const ref of data.references) {
      const item = await getOrderItemByReference(ref);
      if (
        !item ||
        item.fields.DeliveryGroupId !== key ||
        !eligible(item.fields.InternalStatus) ||
        item.fields.HiobuyPurchaseStatus !== "Paid"
      )
        throw new Error(
          "Every included order must have confirmed supplier payment before dispatch.",
        );
    }
    state = "Shipped";
    data.tracking = tracking.trim();
  } else if (action === "complete") {
    if (state !== "Shipped")
      throw new Error("Only dispatched deliveries can be completed.");
    state = "Completed";
  } else throw new Error("Unknown delivery action.");
  data.history = [
    ...data.history,
    {
      at: data.updatedAt,
      actor,
      action:
        action === "weigh"
          ? `Weight ${weightKg} kg; delivery $${data.chargeUsd?.toFixed(2)}`
          : action,
    },
  ];
  return replaceRecord("deliveries", record, state, data);
}
