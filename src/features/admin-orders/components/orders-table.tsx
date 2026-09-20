"use client";

import Link from "next/link";
import { useState } from "react";
import { OrdersRefresh } from "./orders-refresh";
import { formatUsd, formatOrderDate } from "../format";
import { Badge } from "@/shared/components/ui/badge";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { statusVariant } from "../status";
import type { InternalStatus, OrderListRow } from "../types";
import { PaymentConfirmedCell } from "./payment-confirmed-cell";
import { BulkActionBar } from "./bulk-action-bar";

interface RowState {
  etag: string;
  internalStatus: InternalStatus;
}

export function OrdersTable({ orders }: { orders: OrderListRow[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [rowState, setRowState] = useState<Record<string, RowState>>(() =>
    Object.fromEntries(
      orders.map((o) => [
        o.reference,
        { etag: o.etag, internalStatus: o.internalStatus },
      ]),
    ),
  );

  const [previousOrders, setPreviousOrders] = useState(orders);
  // Reset selections and local row versions when the server supplies a new page.
  if (orders !== previousOrders) {
    setPreviousOrders(orders);
    setSelected(new Set());
    setRowState(
      Object.fromEntries(
        orders.map((o) => [
          o.reference,
          { etag: o.etag, internalStatus: o.internalStatus },
        ]),
      ),
    );
  }

  if (orders.length === 0) {
    return (
      <div>
        <OrdersRefresh />
        <div className="flex flex-col items-center justify-center rounded-(--radius) border border-[rgb(var(--border))] bg-[rgb(var(--background))] py-16 text-center">
          <p className="font-display text-xl">No orders found</p>
          <p className="mt-2 max-w-sm px-4 text-sm text-[rgb(var(--muted-foreground))]">
            Try a different reference or customer name, or clear your filters to
            see all orders.
          </p>
          <Link
            href="/admin/orders"
            className="mt-4 inline-flex min-h-11 items-center rounded-full bg-[rgb(var(--accent))] px-5 text-sm text-white"
          >
            View all orders
          </Link>
        </div>
      </div>
    );
  }

  const allSelected =
    orders.length > 0 && orders.every((o) => selected.has(o.reference));

  function toggleAll() {
    setSelected(
      allSelected ? new Set() : new Set(orders.map((o) => o.reference)),
    );
  }

  function toggleOne(reference: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(reference)) {
        next.delete(reference);
      } else {
        next.add(reference);
      }
      return next;
    });
  }

  function updateRow(
    reference: string,
    etag: string,
    internalStatus: InternalStatus,
  ) {
    setRowState((prev) => ({ ...prev, [reference]: { etag, internalStatus } }));
  }

  return (
    <div className="space-y-3">
      <OrdersRefresh paused={selected.size > 0} />
      <BulkActionBar
        selectedReferences={Array.from(selected)}
        onClear={() => setSelected(new Set())}
      />

      <div className="space-y-3 p-3 lg:hidden">
        <label className="flex min-h-11 items-center gap-3 px-2 text-sm">
          <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
          Select all on this page
        </label>
        {orders.map((order) => {
          const state = rowState[order.reference] ?? {
            etag: order.etag,
            internalStatus: order.internalStatus,
          };
          return (
            <article
              key={order.id}
              className="rounded-2xl border border-[rgb(var(--border))] bg-white p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <Link
                  href={`/admin/orders/${encodeURIComponent(order.reference)}`}
                  className="flex min-h-11 items-center font-display text-lg font-semibold text-[rgb(var(--accent))]"
                >
                  {order.reference} &rarr;
                </Link>
                <label className="flex h-11 w-11 items-center justify-center">
                  <Checkbox
                    checked={selected.has(order.reference)}
                    onCheckedChange={() => toggleOne(order.reference)}
                    aria-label={`Select order ${order.reference}`}
                  />
                </label>
              </div>
              <p className="mt-1 font-medium">{order.customerFullName}</p>
              <p className="mt-1 break-all text-xs text-[rgb(var(--muted-foreground))]">
                {order.customerEmail}
              </p>
              <div className="my-4 flex flex-wrap gap-2">
                <Badge variant={statusVariant(order.customerStatus)}>
                  {order.customerStatus}
                </Badge>
                {state.internalStatus !== order.customerStatus && (
                  <Badge variant={statusVariant(state.internalStatus)}>
                    {state.internalStatus}
                  </Badge>
                )}
              </div>
              <dl className="grid grid-cols-2 gap-3 border-t border-[rgb(var(--border))] pt-3 text-xs">
                <div>
                  <dt className="text-[rgb(var(--muted-foreground))]">
                    Order total
                  </dt>
                  <dd className="mt-1 text-base font-semibold tabular-nums">
                    {formatUsd(order.totalUsd)}
                  </dd>
                  {order.deliveryGroupId && (
                    <Link
                      href={`/admin/deliveries/${order.deliveryGroupId}`}
                      className="block text-xs text-[rgb(var(--accent))]"
                    >
                      Shared delivery
                    </Link>
                  )}
                  {order.deliveryPending && (
                    <dd className="mt-1 text-xs text-[rgb(var(--muted-foreground))]">
                      Delivery pending
                    </dd>
                  )}
                </div>
                <div>
                  <dt className="text-[rgb(var(--muted-foreground))]">
                    Created
                  </dt>
                  <dd className="mt-1">{formatOrderDate(order.createdAt)}</dd>
                </div>
              </dl>
              <div className="mt-4 flex min-h-11 items-center justify-between gap-3 rounded-xl bg-[rgb(var(--muted))] px-3 py-2">
                <span className="text-xs">
                  {order.paymentMethod} / Payment confirmed
                </span>
                <PaymentConfirmedCell
                  order={order}
                  etag={state.etag}
                  internalStatus={state.internalStatus}
                  onUpdated={(etag, status) =>
                    updateRow(order.reference, etag, status)
                  }
                />
              </div>
            </article>
          );
        })}
      </div>
      <div className="hidden lg:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleAll}
                  aria-label="Select all orders"
                />
              </TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Payment confirmed</TableHead>
              <TableHead className="text-right">Order total</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
              const state = rowState[order.reference] ?? {
                etag: order.etag,
                internalStatus: order.internalStatus,
              };
              return (
                <TableRow key={order.id}>
                  <TableCell>
                    <Checkbox
                      checked={selected.has(order.reference)}
                      onCheckedChange={() => toggleOne(order.reference)}
                      aria-label={`Select order ${order.reference}`}
                    />
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/admin/orders/${encodeURIComponent(order.reference)}`}
                      className="font-medium text-[rgb(var(--foreground))] hover:text-[rgb(var(--accent))]"
                    >
                      {order.reference}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{order.customerFullName}</span>
                      <span className="text-xs text-[rgb(var(--muted-foreground))]">
                        {order.customerEmail}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{order.paymentMethod}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant={statusVariant(order.customerStatus)}>
                        {order.customerStatus}
                      </Badge>
                      {state.internalStatus !== order.customerStatus && (
                        <Badge variant={statusVariant(state.internalStatus)}>
                          {state.internalStatus}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <PaymentConfirmedCell
                        order={order}
                        etag={state.etag}
                        internalStatus={state.internalStatus}
                        onUpdated={(etag, status) =>
                          updateRow(order.reference, etag, status)
                        }
                      />
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-right tabular-nums">
                    <span className="font-medium">
                      {formatUsd(order.totalUsd)}
                    </span>
                    {order.deliveryGroupId && (
                      <Link
                        href={`/admin/deliveries/${order.deliveryGroupId}`}
                        className="block text-xs text-[rgb(var(--accent))]"
                      >
                        Shared delivery
                      </Link>
                    )}
                    {order.deliveryPending && (
                      <span className="mt-1 block text-xs font-normal text-[rgb(var(--muted-foreground))]">
                        Delivery pending
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-[rgb(var(--muted-foreground))]">
                    {formatOrderDate(order.createdAt)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
