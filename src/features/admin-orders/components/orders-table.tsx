'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Badge } from '@/shared/components/ui/badge';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { statusVariant } from '../status';
import type { InternalStatus, OrderListRow } from '../types';
import { PaymentConfirmedCell } from './payment-confirmed-cell';
import { BulkActionBar } from './bulk-action-bar';

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

// See order-detail-view.tsx's formatUsd — SharePoint pricing fields aren't guaranteed
// non-null at runtime (a manually-edited or malformed list item can leave TotalUsd
// undefined despite the type claiming `number`), so this must not assume a valid number.
function formatUsd(amount: number): string {
  if (typeof amount !== 'number' || Number.isNaN(amount)) return '—';
  return `$${amount.toFixed(2)}`;
}

interface RowState {
  etag: string;
  internalStatus: InternalStatus;
}

export function OrdersTable({ orders }: { orders: OrderListRow[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [rowState, setRowState] = useState<Record<string, RowState>>(() =>
    Object.fromEntries(orders.map((o) => [o.reference, { etag: o.etag, internalStatus: o.internalStatus }])),
  );

  // Same stale-state issue as order-status-panel.tsx: router.refresh() (from a bulk action or
  // a payment-confirmed cell write) passes a fresh `orders` prop, but useState's initializer
  // only runs on mount — without this, the table would keep showing pre-refresh statuses.
  useEffect(() => {
    setRowState(Object.fromEntries(orders.map((o) => [o.reference, { etag: o.etag, internalStatus: o.internalStatus }])));
  }, [orders]);

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-(--radius) border border-[rgb(var(--border))] bg-[rgb(var(--background))] py-16 text-center">
        <p className="text-sm text-[rgb(var(--muted-foreground))]">No orders match these filters.</p>
      </div>
    );
  }

  const allSelected = orders.length > 0 && orders.every((o) => selected.has(o.reference));

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(orders.map((o) => o.reference)));
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

  function updateRow(reference: string, etag: string, internalStatus: InternalStatus) {
    setRowState((prev) => ({ ...prev, [reference]: { etag, internalStatus } }));
  }

  return (
    <div className="space-y-3">
      <BulkActionBar selectedReferences={Array.from(selected)} onClear={() => setSelected(new Set())} />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox checked={allSelected} onCheckedChange={toggleAll} aria-label="Select all orders" />
            </TableHead>
            <TableHead>Reference</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-center">Payment confirmed</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => {
            const state = rowState[order.reference] ?? { etag: order.etag, internalStatus: order.internalStatus };
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
                    <span className="text-xs text-[rgb(var(--muted-foreground))]">{order.customerEmail}</span>
                  </div>
                </TableCell>
                <TableCell>{order.paymentMethod}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant={statusVariant(order.customerStatus)}>{order.customerStatus}</Badge>
                    {state.internalStatus !== order.customerStatus && (
                      <Badge variant={statusVariant(state.internalStatus)}>{state.internalStatus}</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    <PaymentConfirmedCell
                      order={order}
                      etag={state.etag}
                      internalStatus={state.internalStatus}
                      onUpdated={(etag, status) => updateRow(order.reference, etag, status)}
                    />
                  </div>
                </TableCell>
                <TableCell className="tabular-nums">{formatUsd(order.totalUsd)}</TableCell>
                <TableCell className="text-[rgb(var(--muted-foreground))]">{formatDate(order.createdAt)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
