'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { useToast } from '@/shared/components/ui/toast';
import type { OrderDetail } from '../types';

// Mirrors aa_catalog/server/src/config/pricing.config.ts's STORAGE_FREE_DAYS/
// STORAGE_RATE_USD_PER_DAY defaults (owner-supplied rule, 2026-07-28). If the backend's
// values change, update these to match — same duplication rationale as weight/route.ts's
// DELIVERY_RATE_USD_PER_KG mirror (no shared package between the two repos).
const STORAGE_FREE_DAYS = 7;
const STORAGE_RATE_USD_PER_DAY = 0.5;

function calculateStorageFeeUsd(arrivedAtWarehouseAt: string | undefined, asOf: Date = new Date()): number {
  if (!arrivedAtWarehouseAt) return 0;
  const arrivedAt = new Date(arrivedAtWarehouseAt);
  if (Number.isNaN(arrivedAt.getTime())) return 0;
  const daysSinceArrival = Math.floor((asOf.getTime() - arrivedAt.getTime()) / (24 * 60 * 60 * 1000));
  const billableDays = Math.max(0, daysSinceArrival - STORAGE_FREE_DAYS);
  return billableDays * STORAGE_RATE_USD_PER_DAY;
}

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

// Staff-entered warehouse-arrival marker (owner-supplied storage-fee rule, 2026-07-28) — no
// automated warehouse-scanning integration exists, so this is a one-way "mark as arrived"
// action (no undo — mirrors WeightEntryCard's staff-entered pattern, but arrival is a single
// event rather than a value staff might revise). The storage total shown here is live-computed
// display only, same as the app/order-lookup screen's copy — the server is the actual source
// of truth (calculateStorageFeeUsd in pricing.service.ts), this never writes a fee, only the
// arrival timestamp.
export function ArrivedAtWarehouseCard({ order }: { order: OrderDetail }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [etag, setEtag] = useState(order.etag);
  const [arrivedAt, setArrivedAt] = useState(order.fields.ArrivedAtWarehouseAt);
  const [isSaving, setIsSaving] = useState(false);

  const storageFeeUsd = calculateStorageFeeUsd(arrivedAt);

  async function handleMarkArrived() {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${encodeURIComponent(order.fields.OrderReference)}/arrived-at-warehouse`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ etag }),
      });
      const json = await res.json();
      if (!res.ok) {
        showToast(json?.error?.message ?? 'Failed to mark as arrived', 'error');
        return;
      }
      setEtag(json.data.etag);
      setArrivedAt(json.data.arrivedAtWarehouseAt);
      showToast('Order marked as arrived at warehouse');
      router.refresh();
    } catch {
      showToast('Failed to mark as arrived — check your connection', 'error');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card className={arrivedAt ? undefined : 'border-[rgb(var(--warning))]/30'}>
      <CardHeader>
        <CardTitle className="text-lg">Warehouse storage</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {arrivedAt ? (
          <>
            <p className="text-sm text-[rgb(var(--muted-foreground))]">
              Arrived {formatDateTime(arrivedAt)} — first {STORAGE_FREE_DAYS} days free.
            </p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[rgb(var(--muted-foreground))]">Storage fee so far</span>
              <span className="font-medium tabular-nums text-[rgb(var(--foreground))]">
                ${storageFeeUsd.toFixed(2)}
              </span>
            </div>
          </>
        ) : (
          <p className="text-sm text-[rgb(var(--muted-foreground))]">
            Not yet arrived at the warehouse. Mark it once the order physically arrives to start the storage-fee
            clock ({STORAGE_FREE_DAYS} days free, then ${STORAGE_RATE_USD_PER_DAY.toFixed(2)}/day).
          </p>
        )}
        <Button onClick={handleMarkArrived} disabled={isSaving || Boolean(arrivedAt)} className="w-full">
          {isSaving ? 'Saving…' : arrivedAt ? 'Arrived' : 'Mark as arrived'}
        </Button>
      </CardContent>
    </Card>
  );
}
