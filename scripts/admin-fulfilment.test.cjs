/* eslint-disable @typescript-eslint/no-require-imports -- Node CommonJS test harness with a scoped TypeScript loader. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { createRequire } = require("node:module");
const ts = require("typescript");
const test = require("node:test");

function loader(overrides = {}) {
  const cache = new Map();
  function load(file) {
    file = path.resolve(file);
    if (cache.has(file)) return cache.get(file).exports;
    const loadedModule = { exports: {} };
    cache.set(file, loadedModule);
    const compiled = ts.transpileModule(fs.readFileSync(file, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        esModuleInterop: true,
      },
    }).outputText;
    const native = createRequire(file);
    const localRequire = (id) => {
      if (id in overrides) return overrides[id];
      if (id.startsWith("."))
        return load(
          path.resolve(
            path.dirname(file),
            id.endsWith(".ts") ? id : `${id}.ts`,
          ),
        );
      if (id.startsWith("@/"))
        return load(path.resolve(__dirname, "../src", `${id.slice(2)}.ts`));
      return native(id);
    };
    new Function("require", "module", "exports", compiled)(
      localRequire,
      loadedModule,
      loadedModule.exports,
    );
    return loadedModule.exports;
  }
  return load;
}

function fixture() {
  const records = new Map();
  const orders = new Map();
  let failOn;
  for (const reference of ["A", "B", "C"])
    orders.set(reference, {
      id: reference,
      "@odata.etag": "0",
      fields: {
        OrderReference: reference,
        CustomerFullName: "Customer",
        CustomerPhone: "+252630000000",
        Country: "Somaliland",
        City: "Hargeisa",
        InternalStatus: "Payment Confirmed",
        IsDeliveryEstimated: true,
        HiobuyPurchaseStatus: "Paid",
        HiobuyOrderId: `supplier-${reference}`,
        LineItemsJson: "[]",
      },
    });
  const { orderContentsIdentity } = loader()(path.join(__dirname, '../src/features/admin-automation/procurement-contract.ts'));
  for (const [reference, order] of orders) {
    const line = { productId: 'item', skuId: 'sku', quantity: 1 };
    const supplierId = order.fields.HiobuyOrderId;
    records.set(`pay:${supplierId}`, { key: `pay:${supplierId}`, reference, state: 'Succeeded', data: {
      kind: 'pay', supplierId, orderContentsIdentity: orderContentsIdentity(order.fields),
      manifest: { version: 1, expectedTotalCnyMinor: 100, sellers: [{ sellerId: 'seller', lines: [line] }],
        orders: [{ orderId: supplierId, purchaseCnyMinor: 100, lines: [line], payment: { state: 'Paid', paidAt: '2026-09-28T12:00:00Z', settledCurrency: 'USD', settledAmountMinor: 15 } }] },
    } });
  }
  const store = {
    async findRecord(_list, key) {
      return records.has(key) ? structuredClone(records.get(key)) : null;
    },
    async createRecord(_list, key, state, reference, data) {
      if (!records.has(key))
        records.set(key, { id: key, key, state, reference, data, etag: "0" });
      return structuredClone(records.get(key));
    },
    async replaceRecord(_list, record, state, data) {
      if (records.get(record.key).etag !== record.etag) throw new Error("412");
      const next = {
        ...record,
        state,
        data,
        etag: String(Number(record.etag) + 1),
      };
      records.set(record.key, structuredClone(next));
      return next;
    },
  };
  const repository = {
    async getOrderItemByReference(ref) {
      return orders.has(ref) ? structuredClone(orders.get(ref)) : null;
    },
    async updateOrderItemFields(id, etag, fields) {
      if (id === failOn) throw new Error("Network interrupted");
      const item = orders.get(id);
      if (item["@odata.etag"] !== etag) throw new Error("412");
      Object.assign(item.fields, fields);
      item["@odata.etag"] = String(Number(etag) + 1);
      return item["@odata.etag"];
    },
  };
  const api = loader({
    "../admin-orders/orders.repository": repository,
    "./records": store,
  })(path.join(__dirname, "../src/features/admin-automation/deliveries.ts"));
  return {
    api,
    records,
    orders,
    failAt(id) {
      failOn = id;
    },
  };
}

test("accepted payment commands are permanent across refreshes and status changes", async () => {
  const records = new Map();
  let heartbeat = new Date().toISOString();
  const store = {
    operationKey: (kind, ref, id) => `${kind}:${kind === "pay" ? id : ref}`,
    findRecord: async (_list, key) => records.get(key) ?? null,
    workerControl: async () => ({ data: { enabled: true, heartbeat } }),
    createRecord: async (_list, key, state, reference, data) => {
      if (!records.has(key)) records.set(key, { key, state, reference, data });
      return records.get(key);
    },
  };
  const api = loader({ "./records": store })(
    path.join(__dirname, "../src/features/admin-automation/commands.ts"),
  );
  const item = {
    "@odata.etag": "v1",
    fields: {
      OrderReference: "A",
      InternalStatus: "Awaiting Payment",
      LineItemsJson: "[]",
    },
  };
  await assert.rejects(
    api.requestOperation("create", item, { name: "staff", email: "staff", source: "Admin portal" }, "old"),
    /changed/,
  );
  heartbeat = "invalid";
  await assert.rejects(
    api.requestOperation("create", item, { name: "staff", email: "staff", source: "Admin portal" }, "v1"),
    /unavailable/,
  );
  heartbeat = new Date().toISOString();
  await Promise.all([
    api.requestOperation("create", item, { name: "staff1", email: "staff1", source: "Admin portal" }, "v1"),
    api.requestOperation("create", item, { name: "staff2", email: "staff2", source: "Admin portal" }, "v1"),
  ]);
  assert.equal(records.size, 1);
  item.fields.InternalStatus = "Completed";
  const replay = await api.requestOperation("create", item, { name: "staff", email: "staff", source: "Admin portal" }, "old");
  assert.equal(replay.key, "create:A");
  assert.equal(records.size, 1);
});
test("combining preserves purchases and one shared charge covers every member", async () => {
  const f = fixture();
  const d = await f.api.combineDelivery(["A", "B"], { name: "staff", email: "staff", source: "Admin portal" });
  assert.equal(d.state, "Ready");
  assert.equal(f.orders.get("A").fields.DeliveryGroupId, d.key);
  assert.equal(f.orders.get("B").fields.DeliveryGroupId, d.key);
  const weighed = await f.api.updateDelivery(
    d.key,
    d.etag,
    "weigh",
    { name: "staff", email: "staff", source: "Admin portal" },
    2.5,
  );
  assert.equal(weighed.data.chargeUsd, 32.5);
  assert.equal(f.orders.get("A").fields.DeliveryUsd, undefined);
  const paid = await f.api.updateDelivery(d.key, weighed.etag, "paid", { name: "staff", email: "staff", source: "Admin portal" });
  await assert.rejects(
    f.api.updateDelivery(d.key, paid.etag, "weigh", { name: "staff", email: "staff", source: "Admin portal" }, 3),
    /unpaid/,
  );
  await assert.rejects(
    f.api.updateDelivery(d.key, paid.etag, "dissolve", { name: "staff", email: "staff", source: "Admin portal" }),
    /cannot/,
  );
  const shipped = await f.api.updateDelivery(
    d.key,
    paid.etag,
    "ship",
    { name: "staff", email: "staff", source: "Admin portal" },
    undefined,
    "TRACK-1",
  );
  assert.equal(shipped.state, "Shipped");
});
test("different recipients and overlapping groups are rejected", async () => {
  const f = fixture();
  f.orders.get("B").fields.CustomerPhone = "999";
  await assert.rejects(
    f.api.combineDelivery(["A", "B"], { name: "staff", email: "staff", source: "Admin portal" }),
    /same customer/,
  );
  f.orders.get("B").fields.CustomerPhone = "+252630000000";
  await f.api.combineDelivery(["A", "B"], { name: "staff", email: "staff", source: "Admin portal" });
  await assert.rejects(
    f.api.combineDelivery(["A", "C"], { name: "staff", email: "staff", source: "Admin portal" }),
    /already grouped/,
  );
});
test("interrupted linking resumes without duplicate groups or losing reservations", async () => {
  const f = fixture();
  f.failAt("B");
  await assert.rejects(
    f.api.combineDelivery(["A", "B"], { name: "staff", email: "staff", source: "Admin portal" }),
    /interrupted/,
  );
  const d = [...f.records.values()].find(record => record.state === "Linking");
  assert.equal(d.state, "Linking");
  assert.equal(f.orders.get("A").fields.DeliveryGroupId, d.key);
  f.failAt(null);
  const resumed = await f.api.finishGrouping(d, { name: "staff", email: "staff", source: "Admin portal" });
  assert.equal(resumed.state, "Ready");
  assert.equal([...f.records.values()].filter(record => record.key.startsWith("DLV-")).length, 1);
});
test("stale edits cannot change a shared fee and unpaid supplier orders cannot dispatch", async () => {
  const f = fixture();
  const d = await f.api.combineDelivery(["A", "B"], { name: "staff", email: "staff", source: "Admin portal" });
  const weighed = await f.api.updateDelivery(
    d.key,
    d.etag,
    "weigh",
    { name: "staff", email: "staff", source: "Admin portal" },
    1,
  );
  await assert.rejects(
    f.api.updateDelivery(d.key, d.etag, "weigh", { name: "staff", email: "staff", source: "Admin portal" }, 9),
    /changed/,
  );
  const paid = await f.api.updateDelivery(d.key, weighed.etag, "paid", { name: "staff", email: "staff", source: "Admin portal" });
  f.records.get("pay:supplier-B").data.manifest.orders[0].payment.state = "Unpaid";
  await assert.rejects(
    f.api.updateDelivery(d.key, paid.etag, "ship", { name: "staff", email: "staff", source: "Admin portal" }, undefined, "TRACK"),
    /supplier purchases/,
  );
});
test("dissolving an uncharged group releases only its own orders", async () => {
  const f = fixture();
  const d = await f.api.combineDelivery(["A", "B"], { name: "staff", email: "staff", source: "Admin portal" });
  f.orders.get("B").fields.DeliveryGroupId = "another";
  const dissolved = await f.api.updateDelivery(
    d.key,
    d.etag,
    "dissolve",
    { name: "staff", email: "staff", source: "Admin portal" },
  );
  assert.equal(dissolved.state, "Dissolved");
  assert.equal(f.orders.get("A").fields.DeliveryGroupId, "");
  assert.equal(f.orders.get("B").fields.DeliveryGroupId, "another");
});
