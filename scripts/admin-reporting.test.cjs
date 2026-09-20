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
const load = loader();
const reporting = load(
  path.join(__dirname, "../src/features/admin-dashboard/reporting.ts"),
);
const { createReportWorkbook } = load(
  path.join(__dirname, "../src/features/admin-dashboard/report-workbook.ts"),
);
const now = new Date("2026-09-19T12:00:00.000Z");
const selection = { period: "quarter", year: 2026, month: 9, quarter: 3 };
const order = (
  reference,
  status,
  createdAt = "2026-07-05T10:00:00.000Z",
  values = {},
) => ({
  reference,
  status,
  createdAt,
  country: "Somaliland",
  subtotal: 100,
  serviceFee: 10,
  markup: 5,
  ...values,
});
const fixtures = [
  order("C", "Completed"),
  order("X", "Cancelled"),
  order("E", "Expired"),
  order("O", "Payment Confirmed"),
  order("R", "Needs Review"),
  order("P", "Completed", "2026-05-01T10:00:00.000Z"),
  order("F", "Completed", "2026-10-01T00:00:00.000Z"),
];

test("Overview uses exactly 30 days with a separate preceding period", () => {
  const selected = reporting.defaultSelection(now);
  assert.equal(selected.period, "rolling");
  const current = reporting.periodBounds(selected, 0, now);
  const previous = reporting.periodBounds(selected, -1, now);
  assert.equal(current.from, "2026-08-20T12:00:00.000Z");
  assert.equal(current.to, now.toISOString());
  assert.equal(previous.to, current.from);
  const report = reporting.buildReport(
    [
      order("boundary", "Completed", current.from),
      order("previous", "Cancelled", previous.from),
      order("future", "Completed", current.to),
    ],
    selected,
    now,
  );
  assert.equal(report.metrics.orders, 1);
  assert.equal(report.previous.orders, 1);
  assert.equal(report.series.length, 30);
  assert.equal(
    report.series.reduce((sum, bin) => sum + bin.orders, 0),
    1,
  );
});

test("order list recomputes known charges instead of using stored estimated totals", async () => {
  const fields = {
    OrderReference: "AA-test",
    SubtotalUsd: 100,
    ServiceFeeUsd: 10,
    MarkupUsd: 5,
    DeliveryUsd: 45,
    TotalUsd: 160,
    IsDeliveryEstimated: true,
  };
  const request = {
    expand() {
      return this;
    },
    header() {
      return this;
    },
    top() {
      return this;
    },
    orderby() {
      return this;
    },
    async get() {
      return {
        value: [
          { id: "1", fields },
          { id: "2", fields: { ...fields, IsDeliveryEstimated: false } },
          { id: "3", fields: { ...fields, MarkupUsd: undefined } },
        ],
      };
    },
  };
  const scoped = loader({
    "@/core/graph/env": {
      graphEnv: { siteId: "site", ordersListId: "orders" },
    },
    "@/core/graph/graph.client": {
      getGraphClient: () => ({ api: () => request }),
      GraphRequestError: Error,
    },
    "@/core/whatsapp/whatsapp.service": {
      sendOrderStatusWhatsApp: () => {
        throw new Error("Unexpected write");
      },
    },
  });
  const repository = scoped(
    path.join(__dirname, "../src/features/admin-orders/orders.repository.ts"),
  );
  const result = await repository.listOrders({ pageSize: 25 });
  assert.deepEqual(
    result.items.map((item) => [item.totalUsd, item.deliveryPending]),
    [
      [115, true],
      [160, false],
      [null, true],
    ],
  );
  assert.equal(fields.TotalUsd, 160);
});

test("calendar bounds handle year rollover and leap months with exclusive ends", () => {
  assert.equal(
    reporting.periodBounds({
      ...selection,
      period: "month",
      year: 2024,
      month: 2,
    }).to,
    "2024-03-01T00:00:00.000Z",
  );
  assert.equal(
    reporting.periodBounds({ ...selection, quarter: 1 }, -1).label,
    "Q4 2025",
  );
  assert.equal(
    reporting.periodBounds({ ...selection, period: "year" }, -1).from,
    "2025-01-01T00:00:00.000Z",
  );
  for (const params of [
    "period=bad",
    "year=2026%27",
    "year=3000",
    "month=13",
    "quarter=0",
    "period=quarter&year=2026&quarter=4",
  ])
    assert.throws(() =>
      reporting.parseSelection(new URLSearchParams(params), now),
    );
});
test("cohorts reconcile counts and quoted income without counting cancelled income as completed", () => {
  const report = reporting.buildReport(fixtures, selection, now);
  assert.equal(report.metrics.orders, 5);
  assert.equal(report.previous.orders, 1);
  assert.equal(report.metrics.completedIncome, 15);
  assert.equal(report.metrics.openIncome, 30);
  assert.equal(report.metrics.lostIncome, 30);
  assert.equal(report.metrics.potentialIncome, 75);
  assert.equal(report.metrics.completionRate, 0.2);
  assert.equal(
    report.metrics.completed +
      report.metrics.open +
      report.metrics.cancelled +
      report.metrics.expired,
    report.metrics.orders,
  );
  assert.equal(
    report.metrics.completedIncome +
      report.metrics.openIncome +
      report.metrics.lostIncome,
    report.metrics.potentialIncome,
  );
  assert.equal(report.series.length, 3);
  assert.equal(report.series[1].orders, 0);
  assert.equal(report.partial, true);
});
test("missing fees invalidate only affected amounts; zero denominators are unavailable", () => {
  const m = reporting.aggregateOrders([
    order("M", "Awaiting Payment", undefined, { serviceFee: null }),
    order("C", "Completed"),
  ]);
  assert.equal(m.completedIncome, 15);
  assert.equal(m.openIncome, null);
  assert.equal(m.potentialIncome, null);
  assert.equal(m.missingPricing, 1);
  assert.equal(reporting.aggregateOrders([]).completionRate, null);
  assert.equal(reporting.aggregateOrders([]).potentialIncome, 0);
  assert.equal(
    reporting.aggregateOrders([
      order("Z", "Completed", undefined, { serviceFee: 0, markup: 0 }),
    ]).realizationRate,
    null,
  );
});
test("month reports include zero-order days and exclude exact period boundary", () => {
  const s = { ...selection, period: "month", month: 8 };
  const report = reporting.buildReport(
    [
      order("A", "Completed", "2026-08-01T00:00:00.000Z"),
      order("B", "Completed", "2026-09-01T00:00:00.000Z"),
    ],
    s,
    now,
  );
  assert.equal(report.metrics.orders, 1);
  assert.equal(report.series.length, 31);
  assert.equal(report.partial, false);
});
test("reporting repository follows every page and fails rather than returning partial data", async () => {
  const calls = [];
  const page1 = Array.from({ length: 999 }, (_, i) => ({
    id: String(i),
    fields: {
      OrderReference: String(i),
      CreatedAt: "2026-07-05T10:00:00Z",
      Country: "Somaliland",
      InternalStatus: "Completed",
      SubtotalUsd: 100,
      ServiceFeeUsd: 10,
      MarkupUsd: 5,
    },
  }));
  let fail = false;
  const graph = {
    api(url) {
      calls.push(url);
      const request = {
        header() {
          return request;
        },
        expand() {
          return request;
        },
        filter() {
          return request;
        },
        top() {
          return request;
        },
        async get() {
          if (url === "next") {
            if (fail) throw new Error("unavailable");
            return {
              value: [...page1.slice(0, 1), { ...page1[0], id: "999" }],
            };
          }
          return { value: page1, "@odata.nextLink": "next" };
        },
      };
      return request;
    },
  };
  const repo = loader({
    "@/core/graph/env": { graphEnv: { siteId: "s", ordersListId: "l" } },
    "@/core/graph/graph.client": {
      getGraphClient: () => graph,
      GraphRequestError: class extends Error {},
    },
  })(
    path.join(
      __dirname,
      "../src/features/admin-dashboard/reporting.repository.ts",
    ),
  );
  const result = await repo.getDashboardReport(selection, now);
  assert.equal(result.report.metrics.orders, 1000);
  assert.equal(calls.length, 2);
  fail = true;
  await assert.rejects(repo.getDashboardReport(selection, now));
});
test("Excel export preserves typed data, formulas, cached results, and unavailable refunds", async () => {
  const report = reporting.buildReport(fixtures, selection, now);
  const book = await createReportWorkbook(report, fixtures);
  assert.deepEqual(
    book.worksheets.map((s) => s.name),
    ["Summary", "Periods", "Countries", "Orders", "Adjustments", "Definitions"],
  );
  const s = book.getWorksheet("Summary");
  assert.equal(s.getCell("B5").result, 5);
  assert.equal(s.getCell("C5").result, 1);
  assert.equal(s.getCell("B24").result, 15);
  assert.equal(s.getCell("B21").result, 75);
  assert.equal(s.getCell("B30").result, "n.a.");
  assert.equal(s.getCell("B34").result, "n.a.");
  assert.equal(s.getCell("B35").result, 0);
  assert.equal(s.getCell("B36").result, 0);
  assert.match(s.getCell("B34").formula, /B24-B31-B32\+B33/);
  assert.equal(book.getWorksheet("Orders").rowCount, 10); // six source orders, excluding future order
  assert.ok(book.getWorksheet("Orders").getCell("B5").value instanceof Date);
  assert.equal(book.getWorksheet("Adjustments").getCell("B5").value, null);
  const bytes = await book.xlsx.writeBuffer();
  const ExcelJS = require("exceljs");
  const reopened = new ExcelJS.Workbook();
  await reopened.xlsx.load(bytes);
  assert.equal(reopened.getWorksheet("Summary").getCell("B24").result, 15);
  const dir = path.join(__dirname, "../.next/cache/report-authoring");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "sample-report.xlsx"), Buffer.from(bytes));
});
test("empty and incomplete reports preserve unavailable results, text is never executable", async () => {
  const records = [
    order('=HYPERLINK("https://invalid")', "Completed", undefined, {
      serviceFee: null,
      country: "*Test?",
    }),
  ];
  const book = await createReportWorkbook(
    reporting.buildReport(records, selection, now),
    records,
  );
  assert.equal(book.getWorksheet("Summary").getCell("B24").result, "n.a.");
  assert.equal(book.getWorksheet("Orders").getCell("A5").type, 3);
  assert.match(
    book.getWorksheet("Countries").getCell("B5").formula,
    /SUBSTITUTE/,
  );
  const empty = await createReportWorkbook(
    reporting.buildReport([], selection, now),
    [],
  );
  assert.equal(empty.getWorksheet("Summary").getCell("B5").result, 0);
  assert.equal(empty.getWorksheet("Summary").getCell("B13").result, "n.a.");
});
