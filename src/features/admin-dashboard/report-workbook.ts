import ExcelJS from "exceljs";
import { REPORT_TEMPLATE_BASE64 } from "./report-template";
import {
  income,
  incomeCategory,
  type DashboardReport,
  type ReportMetrics,
  type ReportOrder,
} from "./reporting";

const USD = '"$"#,##0.00;("$"#,##0.00);"$"0.00';
const NUMBER = "#,##0;(#,##0);0";
const RATE = "0.0%;(0.0%);0.0%";
const NA = "n.a.";
const val = (value: number | null) => (value === null ? NA : value);
const literal = (value: string) => value; // ExcelJS writes strings as text, never as formulas.

export async function createReportWorkbook(
  report: DashboardReport,
  orders: ReportOrder[],
) {
  const book = new ExcelJS.Workbook();
  await book.xlsx.load(
    Uint8Array.from(Buffer.from(REPORT_TEMPLATE_BASE64, "base64")).buffer,
  );
  book.creator = "A&A Trade Solutions";
  book.created = new Date(report.generatedAt);
  book.modified = new Date(report.generatedAt);
  book.calcProperties.fullCalcOnLoad = true;
  const summary = book.getWorksheet("Summary")!;
  const raw = book.getWorksheet("Orders")!;
  const periods = book.getWorksheet("Periods")!;
  const countries = book.getWorksheet("Countries")!;
  const adjustments = book.getWorksheet("Adjustments")!;
  const definitions = book.getWorksheet("Definitions")!;

  const selected = (order: ReportOrder) =>
    order.createdAt >= report.period.from &&
    order.createdAt < report.period.to &&
    order.createdAt < report.generatedAt;
  const previous = (order: ReportOrder) =>
    order.createdAt >= report.previousPeriod.from &&
    order.createdAt < report.previousPeriod.to;
  const source = orders
    .filter((order) => selected(order) || previous(order))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  raw.getRow(4).values = [
    "Reference",
    "Created UTC",
    "Country",
    "Internal status",
    "Cohort",
    "Product cost USD",
    "Service fee USD",
    "Markup USD",
    "Quoted income USD",
    "Order value excl. delivery USD",
    "Income category",
    "Completed fees USD",
    "Completed markup USD",
    "Completed income USD",
    "Open potential USD",
    "Lost potential USD",
    "Incomplete pricing",
    "Unrecognised status",
    "Open fees USD",
    "Open markup USD",
  ];
  const known = [
    "Awaiting Payment",
    "Payment Confirmed",
    "Order Created",
    "Shipped",
    "Completed",
    "Cancelled",
    "Expired",
    "Needs Review",
  ];
  source.forEach((order, i) => {
    const row = i + 5;
    const category = incomeCategory(order.status);
    const quoted = income(order);
    const total =
      order.subtotal === null || quoted === null
        ? null
        : order.subtotal + quoted;
    raw.getRow(row).values = [
      literal(order.reference),
      new Date(order.createdAt),
      literal(order.country),
      literal(order.status),
      selected(order) ? "Selected" : "Previous",
      val(order.subtotal),
      val(order.serviceFee),
      val(order.markup),
    ];
    raw.getCell(`I${row}`).value = {
      formula: `IF(COUNT(G${row}:H${row})=2,SUM(G${row}:H${row}),"n.a.")`,
      result: val(quoted),
    };
    raw.getCell(`J${row}`).value = {
      formula: `IF(COUNT(F${row},I${row})=2,F${row}+I${row},"n.a.")`,
      result: val(total),
    };
    raw.getCell(`K${row}`).value = {
      formula: `IF(D${row}="Completed","Completed",IF(OR(D${row}="Cancelled",D${row}="Expired"),"Lost","Open"))`,
      result: category,
    };
    for (const [col, from, group, value] of [
      ["L", "G", "Completed", order.serviceFee],
      ["M", "H", "Completed", order.markup],
      ["N", "I", "Completed", quoted],
      ["O", "I", "Open", quoted],
      ["P", "I", "Lost", quoted],
      ["S", "G", "Open", order.serviceFee],
      ["T", "H", "Open", order.markup],
    ] as const) {
      raw.getCell(`${col}${row}`).value = {
        formula: `IF(K${row}="${group}",${from}${row},0)`,
        result: category === group ? val(value) : 0,
      };
    }
    raw.getCell(`Q${row}`).value = {
      formula: `IF(COUNT(F${row}:H${row})=3,0,1)`,
      result: [order.subtotal, order.serviceFee, order.markup].includes(null)
        ? 1
        : 0,
    };
    raw.getCell(`R${row}`).value = known.includes(order.status) ? 0 : 1;
  });
  const last = Math.max(5, source.length + 4);
  const range = (column: string) => `'Orders'!$${column}$5:$${column}$${last}`;
  const cohort = range("E");
  const status = range("D");
  function aggregateFormula(column: string, cohortName: string, extra = "") {
    return `IF(COUNTIFS(${cohort},"${cohortName}",${range(column)},"n.a."${extra})>0,"n.a.",SUMIFS(${range(column)},${cohort},"${cohortName}"${extra}))`;
  }
  const labels: Array<[keyof ReportMetrics, string, string]> = [
    ["orders", "Orders placed", "All orders created in the period."],
    ["completed", "Completed orders", "Current internal status is Completed."],
    ["cancelled", "Cancelled orders", "Current internal status is Cancelled."],
    ["expired", "Expired orders", "Current internal status is Expired."],
    ["open", "Open orders", "All other statuses."],
    ["needsReview", "Needs review", "Included in open orders."],
    [
      "missingPricing",
      "Orders with incomplete pricing",
      "Missing or invalid product cost, fee or markup. Affected totals are unavailable.",
    ],
    [
      "unknownStatus",
      "Orders with unrecognised status",
      "Included in Open; verify the source status.",
    ],
    ["completionRate", "Completion rate", "Completed / placed orders."],
    ["cancellationRate", "Cancellation rate", "Cancelled / placed orders."],
    ["expiryRate", "Expiry rate", "Expired / placed orders."],
    ["goodsValue", "Product cost (USD)", "Product cost across all orders."],
    [
      "orderValue",
      "Order value excluding delivery (USD)",
      "Product cost + service fees + markup across all orders.",
    ],
    [
      "averageOrderValue",
      "Average order value (USD)",
      "Order value excluding delivery / placed orders.",
    ],
    [
      "quotedService",
      "Service fees, completed + open (USD)",
      "Service fees on completed and open orders. Excludes cancelled and expired orders.",
    ],
    [
      "quotedMarkup",
      "Markup, completed + open (USD)",
      "Markup on completed and open orders. Excludes cancelled and expired orders.",
    ],
    [
      "potentialIncome",
      "Total quoted income opportunity (USD)",
      "Fees + markup across all orders, including cancelled/expired. Not a forecast.",
    ],
    [
      "completedService",
      "Completed-order service fees (USD)",
      "Fees on currently completed orders.",
    ],
    [
      "completedMarkup",
      "Completed-order markup (USD)",
      "Markup on currently completed orders.",
    ],
    [
      "completedIncome",
      "Completed-order income (USD)",
      "Completed fees + markup, before refunds and costs. Not verified cash receipts.",
    ],
    [
      "openService",
      "Open-order service fees (USD)",
      "Fees on orders not yet completed, cancelled or expired.",
    ],
    [
      "openMarkup",
      "Open-order markup (USD)",
      "Markup on orders not yet completed, cancelled or expired.",
    ],
    [
      "openIncome",
      "Open-order potential income (USD)",
      "Open fees + markup. Not a forecast.",
    ],
    [
      "lostIncome",
      "Cancelled / expired potential (USD)",
      "Quoted fees + markup on cancelled and expired orders. Not an expense.",
    ],
    [
      "realizationRate",
      "Completed share of quoted income",
      "Completed income / total quoted income opportunity.",
    ],
  ];
  const sumColumns: Partial<Record<keyof ReportMetrics, string>> = {
    goodsValue: "F",
    orderValue: "J",
    potentialIncome: "I",
    completedService: "L",
    completedMarkup: "M",
    completedIncome: "N",
    openService: "S",
    openMarkup: "T",
    openIncome: "O",
    lostIncome: "P",
    missingPricing: "Q",
    unknownStatus: "R",
  };
  const derivedSums: Partial<Record<keyof ReportMetrics, [keyof ReportMetrics, keyof ReportMetrics]>> = {
    quotedService: ["completedService", "openService"],
    quotedMarkup: ["completedMarkup", "openMarkup"],
  };
  const statusNames: Partial<Record<keyof ReportMetrics, string>> = {
    completed: "Completed",
    cancelled: "Cancelled",
    expired: "Expired",
    needsReview: "Needs Review",
  };
  summary.getCell("A2").value =
    `${report.period.label}${report.partial ? " to date" : ""} (USD)`;
  summary.getCell("A3").value = "Service fees and markup (USD)";
  summary.getCell("E2").value = `Snapshot ${report.generatedAt}`;
  summary.getCell("E3").value =
    "Current statuses grouped by order creation date (UTC).";
  summary.getRow(4).values = [
    "Metric",
    report.period.label,
    report.previousPeriod.label,
    "Change",
    "Definition",
  ];
  const metricRows = new Map(labels.map(([key], i) => [key, i + 5]));
  for (const [i, [key, label, definition]] of labels.entries()) {
    const row = i + 5;
    summary.getCell(`A${row}`).value = label;
    summary.getCell(`E${row}`).value = definition;
    for (const [col, name, values] of [
      ["B", "Selected", report.metrics],
      ["C", "Previous", report.previous],
    ] as const) {
      let formula = "";
      if (key === "orders") formula = `COUNTIF(${cohort},"${name}")`;
      else if (statusNames[key])
        formula = `COUNTIFS(${cohort},"${name}",${status},"${statusNames[key]}")`;
      else if (key === "open")
        formula = `COUNTIFS(${cohort},"${name}",${range("K")},"Open")`;
      else if (derivedSums[key]) {
        const [a, b] = derivedSums[key]!.map((part) => `${col}${metricRows.get(part)}`);
        formula = `IF(COUNT(${a},${b})=2,${a}+${b},"n.a.")`;
      } else if (sumColumns[key])
        formula = aggregateFormula(sumColumns[key]!, name);
      else {
        const numerator =
          key === "completionRate"
            ? "completed"
            : key === "cancellationRate"
              ? "cancelled"
              : key === "expiryRate"
                ? "expired"
                : key === "averageOrderValue"
                  ? "orderValue"
                  : "completedIncome";
        const denominator =
          key === "realizationRate" ? "potentialIncome" : "orders";
        const a = `${col}${metricRows.get(numerator)}`,
          b = `${col}${metricRows.get(denominator)}`;
        formula = `IF(COUNT(${a},${b})<>2,"n.a.",IF(${b}=0,"n.a.",${a}/${b}))`;
      }
      summary.getCell(`${col}${row}`).value = {
        formula,
        result: val(values[key]),
      };
    }
    summary.getCell(`D${row}`).value = {
      formula: `IF(COUNT(B${row}:C${row})=2,B${row}-C${row},"n.a.")`,
      result:
        report.metrics[key] === null || report.previous[key] === null
          ? NA
          : report.metrics[key]! - report.previous[key]!,
    };
    const fmt = key.endsWith("Rate") ? RATE : row < 13 ? NUMBER : USD;
    summary.getCell(`B${row}`).numFmt =
      summary.getCell(`C${row}`).numFmt =
      summary.getCell(`D${row}`).numFmt =
        fmt;
  }
  // Rows below the metrics. Every reference is resolved from where rows actually land, so
  // adding or reordering metrics can never point a formula at the wrong row.
  const m = (key: keyof ReportMetrics) => `B${metricRows.get(key)}`;
  const firstExtraRow = labels.length + 5;
  const extraKeys = [
    "unearned",
    "refundedOrders",
    "refundRate",
    "incomeRefunded",
    "operatingCosts",
    "otherAdjustments",
    "adjustedContribution",
    "orderReconciliation",
    "incomeReconciliation",
  ] as const;
  const x = (key: (typeof extraKeys)[number]) => `B${firstExtraRow + extraKeys.indexOf(key)}`;
  const extraRows: Array<[string, string, number | string, string, string]> = [
    [
      "Unearned quoted opportunity (USD)",
      `IF(COUNT(${m("potentialIncome")},${m("completedIncome")})=2,${m("potentialIncome")}-${m("completedIncome")},"n.a.")`,
      report.metrics.potentialIncome === null ||
      report.metrics.completedIncome === null
        ? NA
        : report.metrics.potentialIncome - report.metrics.completedIncome,
      "Open + cancelled/expired potential income.",
      USD,
    ],
    [
      "Refunded orders",
      'IF(ISNUMBER(Adjustments!B5),Adjustments!B5,"n.a.")',
      NA,
      "Manual verified input. Refunds are not recorded in the order system.",
      NUMBER,
    ],
    [
      "Refund rate",
      `IF(COUNT(${x("refundedOrders")},${m("orders")})<>2,"n.a.",IF(${m("orders")}=0,"n.a.",${x("refundedOrders")}/${m("orders")}))`,
      NA,
      "Refunded orders / all placed orders in the selected cohort.",
      RATE,
    ],
    [
      "Income refunded (USD)",
      'IF(ISNUMBER(Adjustments!B6),Adjustments!B6,"n.a.")',
      NA,
      "Refunded fees and markup, not returned product/delivery costs.",
      USD,
    ],
    [
      "Allocated operating costs (USD)",
      'IF(ISNUMBER(Adjustments!B7),Adjustments!B7,"n.a.")',
      NA,
      "Manual input for this cohort.",
      USD,
    ],
    [
      "Other income adjustments (USD)",
      'IF(ISNUMBER(Adjustments!B8),Adjustments!B8,"n.a.")',
      NA,
      "Signed manual adjustment.",
      USD,
    ],
    [
      "Adjusted contribution (USD)",
      `IF(COUNT(${m("completedIncome")},${x("incomeRefunded")},${x("operatingCosts")},${x("otherAdjustments")})=4,${m("completedIncome")}-${x("incomeRefunded")}-${x("operatingCosts")}+${x("otherAdjustments")},"n.a.")`,
      NA,
      "Completed income less refunded income and allocated costs, plus adjustments. Before taxes; not cash profit.",
      USD,
    ],
    [
      "Order count reconciliation",
      `${m("completed")}+${m("cancelled")}+${m("expired")}+${m("open")}-${m("orders")}`,
      0,
      "Completed + cancelled + expired + open less placed. Expected 0.",
      NUMBER,
    ],
    [
      "Income reconciliation (USD)",
      `IF(COUNT(${m("potentialIncome")},${m("completedIncome")},${m("openIncome")},${m("lostIncome")})=4,${m("completedIncome")}+${m("openIncome")}+${m("lostIncome")}-${m("potentialIncome")},"n.a.")`,
      report.metrics.potentialIncome === null ? NA : 0,
      "Completed + open + cancelled/expired potential less total quoted opportunity. Expected 0.",
      USD,
    ],
  ];
  extraRows.forEach(([label, formula, result, definition, numFmt], i) => {
    const row = firstExtraRow + i;
    summary.getCell(`A${row}`).value = label;
    summary.getCell(`B${row}`).value = { formula, result };
    summary.getCell(`E${row}`).value = definition;
    summary.getCell(`B${row}`).numFmt = numFmt;
  });
  summary.getCell("E4").value = report.partial
    ? "Definitions; current period to date vs full previous period"
    : "Definitions; changes in rates are percentage-point differences";

  // Formula-driven monthly/daily and country schedules, all reading the same source rows.
  const scheduleHeaders = [
    "Period / country",
    "Orders",
    "Completed",
    "Cancelled",
    "Expired",
    "Open",
    "Service fees USD",
    "Markup USD",
    "Completed income USD",
    "Potential income USD",
    "Completion rate",
    "Cancellation rate",
  ];
  function schedule(
    sheet: ExcelJS.Worksheet,
    items: Array<{
      label: string;
      metrics: ReportMetrics;
      from?: string;
      to?: string;
      country?: string;
    }>,
  ) {
    sheet.getRow(4).values = scheduleHeaders;
    items.forEach((item, i) => {
      const row = i + 5;
      sheet.getCell(`A${row}`).value = item.label;
      let extra = "";
      if (item.country !== undefined)
        extra = `,${range("C")},"="&SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(A${row},"~","~~"),"*","~*"),"?","~?")`;
      else {
        sheet.getCell(`M${row}`).value = new Date(item.from!);
        sheet.getCell(`N${row}`).value = new Date(item.to!);
        extra = `,${range("B")},">="&M${row},${range("B")},"<"&N${row}`;
      }
      for (const [col, stat, statName] of [
        ["B", "orders", null],
        ["C", "completed", "Completed"],
        ["D", "cancelled", "Cancelled"],
        ["E", "expired", "Expired"],
        ["F", "open", "Open"],
      ] as const) {
        const condition = statName
          ? `,${range(statName === "Open" ? "K" : "D")},"${statName}"`
          : "";
        sheet.getCell(`${col}${row}`).value = {
          formula: `COUNTIFS(${cohort},"Selected"${extra}${condition})`,
          result: item.metrics[stat],
        };
      }
      for (const [col, sourceCol, stat] of [
        ["G", "L", "completedService"],
        ["H", "M", "completedMarkup"],
        ["I", "N", "completedIncome"],
        ["J", "I", "potentialIncome"],
      ] as const)
        sheet.getCell(`${col}${row}`).value = {
          formula: aggregateFormula(sourceCol, "Selected", extra),
          result: val(item.metrics[stat]),
        };
      for (const [col, sourceCol, stat] of [
        ["K", "C", "completionRate"],
        ["L", "D", "cancellationRate"],
      ] as const)
        sheet.getCell(`${col}${row}`).value = {
          formula: `IF(B${row}=0,"n.a.",${sourceCol}${row}/B${row})`,
          result: val(item.metrics[stat]),
        };
    });
    for (const c of ["G", "H", "I", "J"]) sheet.getColumn(c).numFmt = USD;
    for (const c of ["K", "L"]) sheet.getColumn(c).numFmt = RATE;
    if (items.some((item) => item.from)) {
      sheet.getCell("M4").value = "From UTC";
      sheet.getCell("N4").value = "To UTC (exclusive)";
      sheet.getColumn("M").numFmt = sheet.getColumn("N").numFmt = "dd mmm yyyy";
    }
  }
  schedule(
    periods,
    report.series.map((row, i) => ({
      label: row.label,
      metrics: row,
      from: row.date,
      to:
        report.series[i + 1]?.date ??
        new Date(
          Math.min(
            Date.parse(report.period.to),
            Date.parse(report.generatedAt),
          ),
        ).toISOString(),
    })),
  );
  schedule(
    countries,
    report.countries.map((row) => ({
      label: row.country,
      country: row.country,
      metrics: row,
    })),
  );
  periods.getCell("A2").value =
    `${report.period.label}; income columns use completed orders, potential includes all orders.`;
  countries.getCell("A2").value =
    `${report.period.label}; selected cohort only.`;
  raw.getCell("A2").value =
    "Read-only source snapshot. Missing amounts are n.a. Customer contact details are excluded.";
  adjustments.getCell("A3").value =
    `${report.period.label}. Do not enter adjustments from unrelated orders or periods.`;
  adjustments.getCell("B5").dataValidation = {
    type: "whole",
    operator: "between",
    formulae: [0, report.metrics.orders],
    allowBlank: true,
    showErrorMessage: true,
    errorTitle: "Invalid count",
    error: "Enter a count between zero and the selected order count.",
  };
  for (const row of [6, 7])
    adjustments.getCell(`B${row}`).dataValidation = {
      type: "decimal",
      operator: "greaterThanOrEqual",
      formulae: [0],
      allowBlank: true,
      showErrorMessage: true,
      error: "Enter zero or a positive amount.",
    };
  adjustments.getCell("B8").dataValidation = {
    type: "decimal",
    operator: "between",
    formulae: [-1e12, 1e12],
    allowBlank: true,
    showErrorMessage: true,
    error: "Enter a signed number.",
  };
  adjustments.getCell("B5").numFmt = NUMBER;
  for (const row of [6, 7, 8]) adjustments.getCell(`B${row}`).numFmt = USD;

  for (const sheet of book.worksheets) {
    sheet.views = [{ state: "frozen", ySplit: 4, showGridLines: false }];
    sheet.properties.defaultRowHeight = 22;
    sheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.style = structuredClone(cell.style);
        cell.font = { name: "Arial", size: 11, color: { argb: "FF17171D" } };
        cell.alignment = {
          vertical: "middle",
          horizontal:
            cell.type === ExcelJS.ValueType.Number ||
            cell.type === ExcelJS.ValueType.Formula
              ? "right"
              : "left",
        };
      });
      if (rowNumber === 1) {
        row.height = 30;
        row.getCell(1).font = {
          name: "Arial",
          size: 16,
          bold: true,
          color: { argb: "FF49308A" },
        };
      }
      if (rowNumber === 4) {
        row.height = 38;
        row.eachCell((cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF49308A" },
          };
          cell.font = {
            name: "Arial",
            size: 10,
            bold: true,
            color: { argb: "FFFFFFFF" },
          };
          cell.alignment = {
            wrapText: true,
            vertical: "middle",
            horizontal: "center",
          };
        });
      }
      if (rowNumber > 4 && rowNumber % 2 === 0)
        row.eachCell((cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF5F2F8" },
          };
        });
    });
    sheet.pageSetup = {
      orientation: "landscape",
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      paperSize: 9,
    };
    sheet.headerFooter = { oddFooter: "&LA&&A Trade Solutions&RPage &P of &N" };
    sheet.autoFilter = {
      from: { row: 4, column: 1 },
      to: { row: Math.max(4, sheet.rowCount), column: sheet.columnCount },
    };
  }
  for (const sheet of [raw, periods, countries]) {
    sheet.columns.forEach((column) => {
      column.width = 22;
    });
    sheet.getColumn("A").width = 26;
    sheet.getColumn("B").width = sheet === raw ? 24 : 14;
  }
  raw.getColumn("B").numFmt = "dd mmm yyyy hh:mm";
  raw.getColumn("D").width = 24;
  for (const col of ["F", "G", "H", "I", "J", "L", "M", "N", "O", "P"])
    raw.getColumn(col).numFmt = USD;
  summary.getColumn("A").width = 44;
  summary.getColumn("E").width = 76;
  summary.getColumn("E").alignment = {
    wrapText: true,
    vertical: "middle",
    indent: 1,
  };
  for (let r = 5; r < firstExtraRow + extraRows.length; r++) summary.getRow(r).height = 34;
  definitions.getCell("B5").value =
    "Overview covers the last 30 days. Reports use UTC calendar months, quarters or years. Orders are grouped by creation date and current status; previous periods use the same basis.";
  definitions.getColumn("B").alignment = { wrapText: true, vertical: "middle" };
  for (let r = 5; r <= 13; r++) definitions.getRow(r).height = 42;
  for (let r = 5; r <= 8; r++) {
    adjustments.getRow(r).height = 45;
    adjustments.getCell(`C${r}`).alignment = {
      wrapText: true,
      vertical: "middle",
    };
    adjustments.getCell(`B${r}`).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFFF2CC" },
    };
    adjustments.getCell(`B${r}`).font = {
      name: "Arial",
      size: 11,
      color: { argb: "FF0000FF" },
    };
  }
  return book;
}
