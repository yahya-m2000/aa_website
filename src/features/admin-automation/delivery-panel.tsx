"use client";
import Link from "next/link";
import { ArrowUpRight, Package, MapPin } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/components/ui/button";
import { ConfirmDialog } from "@/shared/components/ui/confirm-dialog";
import { useToast } from "@/shared/components/ui/toast";
import { formatUsd } from "../admin-orders/format";
import type { DeliveryData, DurableRecord } from "./records";

export function DeliveryPanel({
  delivery,
}: {
  delivery: DurableRecord<DeliveryData>;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [weight, setWeight] = useState(String(delivery.data.weightKg ?? ""));
  const [tracking, setTracking] = useState(delivery.data.tracking ?? "");
  const [action, setAction] = useState<string | null>(null);
  const data = delivery.data;
  async function update() {
    try {
      const response = await fetch(`/api/admin/deliveries/${delivery.key}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          etag: delivery.etag,
          action,
          confirm: true,
          ...(action === "weigh" ? { weightKg: Number(weight) } : {}),
          tracking,
        }),
      });
      const json = await response.json();
      if (!response.ok) {
        showToast(json.error?.message ?? "Unable to update delivery.", "error");
        return;
      }
      showToast("Delivery updated");
      router.refresh();
    } catch {
      showToast(
        "Connection lost. Refresh to check the saved result before trying again.",
        "error",
      );
    }
  }
  const descriptions: Record<string, string> = {
    weigh: `Set the combined weight to ${weight} kg? This replaces the shared delivery charge at $13/kg.`,
    paid: `Confirm receipt of ${formatUsd(data.chargeUsd ?? null)} for this delivery? This does not pay the supplier.`,
    ship: "Dispatch all included orders with this tracking reference?",
    complete: "Mark this delivery and its included orders as completed?",
    resume: "Finish linking the selected orders to this delivery?",
    dissolve:
      "Remove this uncharged delivery group? The individual orders will remain.",
  };
  return (
    <section className="min-w-0 space-y-6">
      <div className="flex flex-wrap justify-between gap-3">
        <h1 className="min-w-0 break-all font-display text-2xl font-semibold">{delivery.key}</h1>
        <Badge variant="neutral">{delivery.state}</Badge>
      </div>
      <div className="grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="min-w-0 space-y-6">
          <section className="admin-panel space-y-4">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold"><MapPin aria-hidden="true" className="h-4 w-4" />Recipient</h2>
            <p className="break-words font-medium">{data.customer}</p>
            <a href={`tel:${data.phone}`} className="inline-flex min-h-11 items-center break-all text-sm text-[rgb(var(--accent))]">{data.phone}</a>
            <p className="break-words border-t border-[rgb(var(--border))] pt-4 text-sm leading-relaxed text-[rgb(var(--muted-foreground))]">{data.destination}</p>
          </section>
          <section className="admin-panel space-y-4">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold"><Package aria-hidden="true" className="h-4 w-4" />Orders <span className="text-sm font-normal text-[rgb(var(--muted-foreground))]">({data.references.length})</span></h2>
            <div className="divide-y divide-[rgb(var(--border))]">
              {data.references.map(ref => (
                <Link key={ref} href={`/admin/orders/${encodeURIComponent(ref)}`} className="flex min-h-14 items-center justify-between gap-3 rounded-lg px-2 py-3 text-sm font-medium hover:bg-[rgb(var(--muted))]">
                  <span className="min-w-0 break-all">{ref}</span><ArrowUpRight aria-hidden="true" className="h-4 w-4 shrink-0 text-[rgb(var(--muted-foreground))]" />
                </Link>
              ))}
            </div>
          </section>
        </div>
        <aside aria-label="Manage delivery" className="admin-panel min-w-0 space-y-5">
          <h2 className="font-display text-lg font-semibold">Manage delivery</h2>
      <dl className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt>Combined weight</dt>
          <dd className="mt-1 font-semibold">
            {data.weightKg === undefined
              ? "Not weighed"
              : `${data.weightKg} kg`}
          </dd>
        </div>
        <div>
          <dt>Delivery charge</dt>
          <dd className="mt-1 font-semibold tabular-nums">
            {formatUsd(data.chargeUsd ?? null)}
            {data.paidAt ? " · Paid" : ""}
          </dd>
        </div>
      </dl>
      <p className="text-xs text-[rgb(var(--muted-foreground))]">
        One delivery charge for {data.references.length} orders.
      </p>
      {delivery.state === "Linking" && (
        <p role="status" className="text-sm">
          Grouping is incomplete. Resume to finish linking, or dissolve the
          group if an order is no longer eligible.
        </p>
      )}
      {delivery.state === "Ready" && !data.paidAt && (
        <label className="block text-sm">
          Combined weight (kg)
          <input
            type="number"
            min="0.01"
            max="10000"
            step="0.01"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="mt-2 block min-h-11 w-full rounded-lg border px-3"
          />
        </label>
      )}
      {delivery.state === "Ready" && data.paidAt && (
        <label className="block text-sm">
          Tracking reference
          <input
            value={tracking}
            maxLength={250}
            onChange={(e) => setTracking(e.target.value)}
            className="mt-2 block min-h-11 w-full rounded-lg border px-3"
          />
        </label>
      )}
      {data.tracking && (
        <p className="text-sm break-all">Tracking: {data.tracking}</p>
      )}
      <div className="flex flex-col gap-3 [&_button]:h-auto [&_button]:min-h-11 [&_button]:whitespace-normal [&_button]:py-3">
        {delivery.state === "Linking" && (
          <Button onClick={() => setAction("resume")}>Finish grouping</Button>
        )}
        {delivery.state === "Ready" && !data.paidAt && (
          <Button disabled={!Number(weight)} onClick={() => setAction("weigh")}>
            Save weight
          </Button>
        )}
        {delivery.state === "Ready" &&
          !data.paidAt &&
          data.chargeUsd !== undefined && (
            <Button onClick={() => setAction("paid")}>
              Delivery payment received
            </Button>
          )}
        {delivery.state === "Ready" && data.paidAt && (
          <Button disabled={!tracking.trim()} onClick={() => setAction("ship")}>
            Mark shipped
          </Button>
        )}
        {delivery.state === "Shipped" && (
          <Button onClick={() => setAction("complete")}>Mark completed</Button>
        )}
        {["Ready", "Linking", "Dissolving"].includes(delivery.state) &&
          !data.weightKg &&
          !data.paidAt && (
            <Button variant="outline" onClick={() => setAction("dissolve")}>
              Ungroup orders
            </Button>
          )}
      </div>
        </aside>
      </div>
      <details className="admin-panel text-xs">
        <summary className="cursor-pointer py-2">Activity</summary>
        <ol className="space-y-2">
          {data.history.map((entry, index) => (
            <li key={index}>
              {new Date(entry.at).toLocaleString()} · {entry.action} ·{" "}
              {entry.actor}
            </li>
          ))}
        </ol>
      </details>
      <ConfirmDialog
        open={action !== null}
        onOpenChange={(open) => {
          if (!open) setAction(null);
        }}
        title="Update delivery?"
        description={action ? descriptions[action] : ""}
        confirmLabel="Confirm"
        onConfirm={update}
      />
    </section>
  );
}
