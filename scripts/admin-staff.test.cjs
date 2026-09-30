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
const src = (file) => path.join(__dirname, "../src", file);

// Chainable stand-in for the Microsoft Graph client over one in-memory SharePoint list.
function fakeGraph(rows) {
  let etag = 0;
  const request = (url) => {
    const state = { url, filter: undefined, ifMatch: undefined };
    const chain = {
      expand: () => chain,
      top: () => chain,
      header: (name, value) => { if (name === "If-Match") state.ifMatch = value; return chain; },
      filter: (value) => { state.filter = value; return chain; },
      async get() {
        const match = /Username eq '([^']*)'/.exec(state.filter ?? "");
        const value = [...rows.values()].filter((row) => !match || row.fields.Username === match[1]);
        return { value: value.map((row) => structuredClone(row)) };
      },
      async patch(fields) {
        const id = state.url.split("/").at(-2);
        const row = rows.get(id);
        if (state.ifMatch && state.ifMatch !== row["@odata.etag"]) throw Object.assign(new Error("412"), { statusCode: 412 });
        Object.assign(row.fields, fields);
        row["@odata.etag"] = `v${++etag}`;
      },
      async post({ fields }) {
        const id = String(rows.size + 1);
        rows.set(id, { id, "@odata.etag": `v${++etag}`, fields: { ...fields } });
      },
    };
    return chain;
  };
  class GraphRequestError extends Error {}
  class GraphConflictError extends GraphRequestError {}
  return { getGraphClient: () => ({ api: request }), GraphRequestError, GraphConflictError };
}

test("passwords hash with a salt and verify only the right password", async () => {
  const { hashPassword, verifyPassword, passwordProblem } = loader()(src("core/admin-auth/passwords.ts"));
  const first = await hashPassword("correct horse battery");
  const second = await hashPassword("correct horse battery");
  assert.notEqual(first, second);
  assert.match(first, /^scrypt\$/);
  assert.equal(await verifyPassword("correct horse battery", first), true);
  assert.equal(await verifyPassword("wrong horse battery", first), false);
  assert.equal(await verifyPassword("anything", undefined), false);
  assert.equal(await verifyPassword("anything", "not-a-hash"), false);
  assert.ok(passwordProblem("short"));
  assert.ok(passwordProblem("guangzhou1-secret", "guangzhou1"));
  assert.equal(passwordProblem("a-long-enough-pass", "guangzhou1"), null);
});

test("warehouse staff can only open the warehouse section", () => {
  const { resolveAdminPath } = loader()(src("core/admin-auth/access.ts"));
  const worker = { role: "warehouse", mustChangePassword: false };
  for (const blocked of ["/admin", "/admin/orders", "/admin/orders/ORD-1", "/admin/deliveries/DLV-1", "/admin/staff", "/admin/help", "/admin/warehousex"])
    assert.deepEqual(resolveAdminPath(worker, blocked), { redirect: "/admin/warehouse" }, blocked);
  for (const allowed of ["/admin/warehouse", "/admin/warehouse/orders/ORD-1", "/admin/warehouse/deliveries/DLV-1", "/admin/warehouse/change-password", "/admin/login"])
    assert.deepEqual(resolveAdminPath(worker, allowed), {}, allowed);
});

test("a temporary password must be replaced before anything else opens", () => {
  const { resolveAdminPath } = loader()(src("core/admin-auth/access.ts"));
  const worker = { role: "warehouse", mustChangePassword: true };
  assert.deepEqual(resolveAdminPath(worker, "/admin/warehouse"), { redirect: "/admin/warehouse/change-password" });
  assert.deepEqual(resolveAdminPath(worker, "/admin/orders"), { redirect: "/admin/warehouse/change-password" });
  assert.deepEqual(resolveAdminPath(worker, "/admin/warehouse/change-password"), {});
});

test("admins keep full access and signed-out visitors go to login", () => {
  const { resolveAdminPath, homeFor } = loader()(src("core/admin-auth/access.ts"));
  for (const route of ["/admin", "/admin/orders", "/admin/staff", "/admin/warehouse"])
    assert.deepEqual(resolveAdminPath({ role: "admin" }, route), {}, route);
  assert.deepEqual(resolveAdminPath(null, "/admin/orders"), { redirect: "/admin/login" });
  assert.deepEqual(resolveAdminPath(null, "/admin/login"), {});
  assert.equal(homeFor("warehouse"), "/admin/warehouse");
  assert.equal(homeFor("admin"), "/admin");
});

test("the warehouse order view never carries prices or customer contact details", () => {
  const { toWarehouseOrder } = loader()(src("features/warehouse/warehouse.repository.ts"));
  const view = toWarehouseOrder({
    "@odata.etag": "v1",
    fields: {
      OrderReference: "ORD-TEST", InternalStatus: "Payment Confirmed", CreatedAt: "2026-09-30T00:00:00Z",
      CustomerFullName: "Amina", CustomerEmail: "amina@example.com", CustomerPhone: "+252630000000",
      ShippingAddress: "Street 1", City: "Hargeisa", Country: "Somaliland", HiobuyPurchaseStatus: "Paid",
      HiobuyOrderId: "200138798971", InternalNotes: "secret note",
      SubtotalUsd: 10, ServiceFeeUsd: 1, MarkupUsd: 2, TotalUsd: 13, DeliveryUsd: 5, IsDeliveryEstimated: true,
      LineItemsJson: JSON.stringify([{ productTitle: "Hoodie", quantity: 2, finalAmount: 4.44, usdAmount: 3.7,
        variantOptions: [{ name: "Size", value: "L" }], imageUrl: "//img.alicdn.com/a.jpg", sourceProductId: "1056638781729" }]),
    },
  });
  const text = JSON.stringify(view);
  for (const secret of ["amina@example.com", "+252630000000", "200138798971", "secret note", "4.44", "3.7", "Usd", "1056638781729"])
    assert.equal(text.includes(secret), false, `leaked ${secret}`);
  assert.equal(view.items[0].imageUrl, "https://img.alicdn.com/a.jpg");
  assert.equal(view.items[0].variant, "Size: L");
  assert.equal(view.recipient.name, "Amina");
  assert.equal(view.supplierPaid, true);
});

test("Chinese text comes from new orders directly, or from the translations list for older ones", () => {
  const { toWarehouseOrder } = loader()(src("features/warehouse/warehouse.repository.ts"));
  const order = (line) => ({ "@odata.etag": "v1", fields: { OrderReference: "ORD-ZH", InternalStatus: "Payment Confirmed", LineItemsJson: JSON.stringify([line]) } });

  const fresh = toWarehouseOrder(order({
    productTitle: "Sim Card Ejector", productTitleOriginal: "手机通用取卡针", quantity: 1, sourceProductId: "878761108911", skuId: "5719868301668",
    variantOptions: [{ name: "Color Classification", value: "[1]", originalName: "颜色分类", originalValue: "【1】" }],
  }));
  assert.equal(fresh.items[0].titleZh, "手机通用取卡针");
  assert.equal(fresh.items[0].variantZh, "颜色分类: 【1】");
  assert.equal(fresh.items[0].title, "Sim Card Ejector");

  const olderLine = { productTitle: "Hoodie", quantity: 1, sourceProductId: "1056638781729", skuId: "6262053950412", variantOptions: [{ name: "Size", value: "L" }] };
  const translations = new Map([["1056638781729:6262053950412", { titleZh: "男士防晒衣", variantZh: "尺码: L" }]]);
  const older = toWarehouseOrder(order(olderLine), translations);
  assert.equal(older.items[0].titleZh, "男士防晒衣");
  assert.equal(older.items[0].variantZh, "尺码: L");
  assert.equal(JSON.stringify(older).includes("1056638781729"), false, "lookup key must stay server-side");

  const untranslated = toWarehouseOrder(order(olderLine));
  assert.equal(untranslated.items[0].titleZh, undefined);
  assert.equal(untranslated.items[0].title, "Hoodie");
});

function sessionModule(session, account) {
  const load = loader({
    "./auth": { auth: async () => session },
    "next/navigation": { redirect: (url) => { throw new Error(`REDIRECT:${url}`); } },
    "@/features/admin-staff/staff.repository": { getLiveStaffAccount: async () => account },
  });
  return load(src("core/admin-auth/session.ts"));
}
const workerSession = { user: { name: "Ceng (guangzhou1)" }, role: "warehouse", username: "guangzhou1", sessionVersion: 2 };
const liveAccount = { username: "guangzhou1", displayName: "Ceng", active: true, mustChangePassword: false, sessionVersion: 2 };

test("admin-only routes reject warehouse accounts", async () => {
  const { requireAdminSession, ForbiddenError, UnauthorizedError } = sessionModule(workerSession, liveAccount);
  await assert.rejects(requireAdminSession(), ForbiddenError);
  const signedOut = sessionModule(null, null);
  await assert.rejects(signedOut.requireAdminSession(), signedOut.UnauthorizedError);
  const admin = sessionModule({ user: { name: "Yahya", email: "y@example.com" }, role: "admin" }, null);
  assert.equal((await admin.requireAdminSession()).role, "admin");
  assert.ok(UnauthorizedError);
});

test("warehouse actions require a live, current account", async () => {
  const ok = await sessionModule(workerSession, liveAccount).requireStaffSession();
  assert.deepEqual(ok.actor, { name: "Ceng (guangzhou1)", source: "Warehouse" });

  const reset = sessionModule(workerSession, { ...liveAccount, sessionVersion: 3 });
  await assert.rejects(reset.requireStaffSession(), reset.UnauthorizedError);
  const disabled = sessionModule(workerSession, { ...liveAccount, active: false });
  await assert.rejects(disabled.requireStaffSession(), disabled.UnauthorizedError);
  const deleted = sessionModule(workerSession, null);
  await assert.rejects(deleted.requireStaffSession(), deleted.UnauthorizedError);
  const temporary = sessionModule(workerSession, { ...liveAccount, mustChangePassword: true });
  await assert.rejects(temporary.requireStaffSession(), temporary.ForbiddenError);
  await assert.rejects(temporary.requireWarehousePage(), /REDIRECT:\/admin\/warehouse\/change-password/);
  assert.equal((await temporary.requireWarehousePage({ allowPasswordChange: true })).role, "warehouse");
  await assert.rejects(reset.requireWarehousePage(), /REDIRECT:\/api\/admin\/auth\/signed-out/);
});

async function staffRepository() {
  process.env.ADMIN_GRAPH_STAFF_LIST_ID = "staff-list";
  const rows = new Map();
  const load = loader({ "@/core/graph/graph.client": fakeGraph(rows) });
  const repo = load(src("features/admin-staff/staff.repository.ts"));
  await repo.createStaffAccount({ username: "Guangzhou1", displayName: "Ceng", password: "temporary-pass-1" });
  return { repo, row: () => rows.get("1").fields };
}

test("new accounts are lowercase, active, and must set their own password", async () => {
  const { repo, row } = await staffRepository();
  assert.equal(row().Username, "guangzhou1");
  assert.equal(row().MustChangePassword, true);
  assert.equal(row().Active, true);
  assert.notEqual(row().PasswordHash, "temporary-pass-1");
  await assert.rejects(repo.createStaffAccount({ username: "guangzhou1", displayName: "Other", password: "another-pass-1" }), /taken/);
  const result = await repo.authenticateStaff("GUANGZHOU1", "temporary-pass-1");
  assert.equal(result.ok, true);
  assert.equal(result.account.mustChangePassword, true);
});

test("five wrong passwords lock the account, even against the right password", async () => {
  const { repo, row } = await staffRepository();
  for (let attempt = 1; attempt <= 4; attempt++)
    assert.deepEqual(await repo.authenticateStaff("guangzhou1", "wrong-password"), { ok: false, reason: "invalid" });
  assert.deepEqual(await repo.authenticateStaff("guangzhou1", "wrong-password"), { ok: false, reason: "locked" });
  assert.ok(Date.parse(row().LockedUntil) > Date.now());
  assert.deepEqual(await repo.authenticateStaff("guangzhou1", "temporary-pass-1"), { ok: false, reason: "locked" });
  await repo.unlockStaffAccount("guangzhou1");
  assert.equal((await repo.authenticateStaff("guangzhou1", "temporary-pass-1")).ok, true);
});

test("changing or resetting a password ends existing sessions", async () => {
  const { repo, row } = await staffRepository();
  await assert.rejects(repo.changeOwnPassword("guangzhou1", "not-it", "brand-new-pass-1"), /incorrect/);
  await repo.changeOwnPassword("guangzhou1", "temporary-pass-1", "brand-new-pass-1");
  assert.equal(row().MustChangePassword, false);
  assert.equal(row().SessionVersion, 2);
  assert.equal((await repo.authenticateStaff("guangzhou1", "temporary-pass-1")).ok, false);
  assert.equal((await repo.authenticateStaff("guangzhou1", "brand-new-pass-1")).ok, true);

  await repo.resetStaffPassword("guangzhou1", "admin-set-pass-1");
  assert.equal(row().MustChangePassword, true);
  assert.equal(row().SessionVersion, 3);
  await repo.setStaffActive("guangzhou1", false);
  assert.equal(row().SessionVersion, 4);
  assert.deepEqual(await repo.authenticateStaff("guangzhou1", "admin-set-pass-1"), { ok: false, reason: "invalid" });
});
