import { graphEnv } from "@/core/graph/env";
import { getGraphClient, GraphRequestError } from "@/core/graph/graph.client";
import {
  amount,
  buildReport,
  periodBounds,
  type PeriodSelection,
  type ReportOrder,
} from "./reporting";

const REPORT_FIELDS =
  "OrderReference,CreatedAt,Country,InternalStatus,SubtotalUsd,ServiceFeeUsd,MarkupUsd";

/** Read-only reporting query. Follows every Graph page for complete annual reports. */
export async function getDashboardReport(
  selection: PeriodSelection,
  now = new Date(),
) {
  const period = periodBounds(selection, 0, now);
  const previous = periodBounds(selection, -1, now);
  const to = new Date(
    Math.min(Date.parse(period.to), now.getTime()),
  ).toISOString();
  const orders: ReportOrder[] = [];
  const seenIds = new Set<string>();
  const visited = new Set<string>();
  try {
    const client = getGraphClient();
    let next: string | undefined =
      `/sites/${graphEnv.siteId}/lists/${graphEnv.ordersListId}/items`;
    let first = true;
    while (next) {
      if (visited.has(next)) throw new Error("Repeated reporting page");
      visited.add(next);
      let request = client
        .api(next)
        .header("Prefer", "HonorNonIndexedQueriesWarningMayFailRandomly");
      if (first) {
        request = request
          .expand(`fields($select=${REPORT_FIELDS})`)
          .filter(
            `fields/CreatedAt ge '${previous.from}' and fields/CreatedAt lt '${to}'`,
          )
          .top(999);
        first = false;
      }
      const page = await request.get();
      if (!Array.isArray(page.value)) throw new Error("Invalid reporting page");
      for (const item of page.value) {
        if (seenIds.has(item.id)) continue;
        seenIds.add(item.id);
        const f = item.fields;
        if (!f || !Number.isFinite(Date.parse(f.CreatedAt)))
          throw new Error("Order has an invalid creation date");
        orders.push({
          reference: String(f.OrderReference ?? item.id),
          createdAt: new Date(f.CreatedAt).toISOString(),
          country: String(f.Country || "Unknown"),
          status: String(f.InternalStatus || "Unknown"),
          subtotal: amount(f.SubtotalUsd),
          serviceFee: amount(f.ServiceFeeUsd),
          markup: amount(f.MarkupUsd),
        });
      }
      next = page["@odata.nextLink"];
    }
    return { report: buildReport(orders, selection, now), orders };
  } catch (error) {
    throw new GraphRequestError(
      "Unable to load the complete reporting period. Please retry.",
      undefined,
      error,
    );
  }
}
