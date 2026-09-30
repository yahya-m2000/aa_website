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
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
    }).outputText;
    const native = createRequire(file);
    const localRequire = (id) => {
      if (id in overrides) return overrides[id];
      if (id.startsWith(".")) return load(path.resolve(path.dirname(file), id.endsWith(".ts") ? id : `${id}.ts`));
      if (id.startsWith("@/")) return load(path.resolve(__dirname, "../src", `${id.slice(2)}.ts`));
      return native(id);
    };
    new Function("require", "module", "exports", compiled)(localRequire, loadedModule, loadedModule.exports);
    return loadedModule.exports;
  }
  return load;
}

const item = (reference, status, day) => ({
  id: reference,
  "@odata.etag": "v1",
  fields: {
    OrderReference: reference, InternalStatus: status, CustomerStatus: status, CreatedAt: `2026-09-${String(day).padStart(2, "0")}T00:00:00Z`,
    SubtotalUsd: 1, ServiceFeeUsd: 1, MarkupUsd: 1, DeliveryUsd: 0, IsDeliveryEstimated: true, LineItemsJson: "[]",
  },
});
// Newest first, with cancelled/expired orders interleaved by date as they really are.
const orders = [
  item("C1", "Cancelled", 30), item("A1", "Payment Confirmed", 29), item("E1", "Expired", 28),
  item("A2", "Awaiting Payment", 27), item("A3", "Completed", 26), item("C2", "Cancelled", 25), item("A4", "Order Created", 24),
];

function fakeGraph() {
  const calls = [];
  const client = {
    api(url) {
      const state = { url, top: undefined, filter: "" };
      const request = {
        expand: () => request,
        header: () => request,
        orderby: () => request,
        top: (n) => { state.top = n; return request; },
        filter: (f) => { state.filter = f; return request; },
        async get() {
          calls.push(state.url);
          let phase = "all", offset = 0, top = state.top, status;
          if (state.url.startsWith("https://graph.microsoft.com/v1.0/fake")) {
            const q = new URL(state.url).searchParams;
            phase = q.get("phase"); offset = Number(q.get("offset")); top = Number(q.get("top")); status = q.get("status") || undefined;
          } else {
            if (state.filter.includes("ne 'Cancelled'")) phase = "active";
            else if (state.filter.includes("eq 'Cancelled' or")) phase = "closed";
            status = /InternalStatus eq '([^']+)'\)?$/.exec(state.filter.split(" and ")[0])?.[1];
            if (phase !== "all") status = undefined;
          }
          const matches = orders.filter((o) => {
            const s = o.fields.InternalStatus;
            if (phase === "active") return s !== "Cancelled" && s !== "Expired";
            if (phase === "closed") return s === "Cancelled" || s === "Expired";
            return !status || s === status;
          });
          const value = matches.slice(offset, offset + top);
          const next = offset + top < matches.length
            ? `https://graph.microsoft.com/v1.0/fake?phase=${phase}&offset=${offset + top}&top=${top}&status=${status ?? ""}`
            : undefined;
          return { value, ...(next ? { "@odata.nextLink": next } : {}) };
        },
      };
      return request;
    },
  };
  return { client, calls };
}

function repository() {
  const graph = fakeGraph();
  delete process.env.ADMIN_GRAPH_OPERATIONS_LIST_ID;
  const repo = loader({
    "@/core/graph/env": { graphEnv: { siteId: "s", ordersListId: "l" } },
    "@/core/graph/graph.client": { getGraphClient: () => graph.client, GraphRequestError: class extends Error {}, GraphConflictError: class extends Error {} },
  })(path.join(__dirname, "../src/features/admin-orders/orders.repository.ts"));
  return { repo, graph };
}

async function allPages(repo, params) {
  const pages = [];
  let cursor;
  do {
    const result = await repo.listOrders({ pageSize: 2, ...params, cursor });
    pages.push(result.items.map((row) => row.reference));
    cursor = result.nextCursor ?? undefined;
  } while (cursor && pages.length < 10);
  return pages;
}

test("cancelled and expired orders always come after every other order", async () => {
  const { repo } = repository();
  const pages = await allPages(repo, {});
  assert.deepEqual(pages.flat(), ["A1", "A2", "A3", "A4", "C1", "E1", "C2"]);
  // Pages stay full across the boundary between the two passes.
  assert.deepEqual(pages, [["A1", "A2"], ["A3", "A4"], ["C1", "E1"], ["C2"]]);
});

test("a page is filled across the boundary without skipping or repeating orders", async () => {
  const { repo } = repository();
  const pages = [];
  let cursor;
  do {
    const result = await repo.listOrders({ pageSize: 3, cursor });
    pages.push(result.items.map((row) => row.reference));
    cursor = result.nextCursor ?? undefined;
  } while (cursor && pages.length < 10);
  assert.deepEqual(pages, [["A1", "A2", "A3"], ["A4", "C1", "E1"], ["C2"]]);
});

test("filtering by a status keeps a single pass", async () => {
  const { repo } = repository();
  assert.deepEqual((await allPages(repo, { status: "Cancelled" })).flat(), ["C1", "C2"]);
});

test("a crafted cursor pointing outside Microsoft Graph is ignored", async () => {
  const { repo, graph } = repository();
  const evil = repo.encodeListCursor({ phase: "active", link: "https://attacker.example/steal", skip: 0 });
  const result = await repo.listOrders({ pageSize: 2, cursor: evil });
  assert.deepEqual(result.items.map((row) => row.reference), ["A1", "A2"]);
  assert.equal(graph.calls.some((url) => url.includes("attacker")), false);
  assert.equal(repo.decodeListCursor("not-a-cursor"), null);
});
