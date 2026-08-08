'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { useToast } from '@/shared/components/ui/toast';
import type { OrderDetail } from '../types';

// Staff-entered real order weight (owner-supplied pricing rules, 2026-07-25 — no product/SKU
// weight data exists anywhere upstream, so this is the only way delivery cost is ever
// finalized from an ESTIMATE to a real number). Recalculates DeliveryUsd/TotalUsd server-side
// and clears IsDeliveryEstimated.
export function WeightEntryCard({ order }: { order: OrderDetail }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [etag, setEtag] = useState(order.etag);
  const [weightKg, setWeightKg] = useState(order.fields.WeightKg?.toString() ?? '');
  const [isSaving, setIsSaving] = useState(false);

  const hasRealWeight = order.fields.WeightKg !== undefined && !order.fields.IsDeliveryEstimated;

  async function handleSave() {
    const parsed = Number(weightKg);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      showToast('Enter a valid weight in kg', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${encodeURIComponent(order.fields.OrderReference)}/weight`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ etag, weightKg: parsed }),
      });
      const json = await res.json();
      if (!res.ok) {
        showToast(json?.error?.message ?? 'Failed to save weight', 'error');
        return;
      }
      setEtag(json.data.etag);
      showToast(`Weight saved — delivery updated to $${json.data.deliveryUsd.toFixed(2)}`);
      router.refresh();
    } catch {
      showToast('Failed to save weight — check your connection', 'error');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card className={hasRealWeight ? undefined : 'border-[rgb(var(--warning))]/30'}>
      <CardHeader>
        <CardTitle className="text-lg">Order weight</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-[rgb(var(--muted-foreground))]">
          {hasRealWeight
            ? 'Delivery cost is finalized based on this weight.'
            : 'Delivery cost is currently an estimate. Weigh the order and enter the real weight to finalize it.'}
        </p>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            step="0.01"
            min="0"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            placeholder="Weight in kg"
            className="flex-1"
          />
          <span className="text-sm text-[rgb(var(--muted-foreground))]">kg</span>
        </div>
        <Button onClick={handleSave} disabled={isSaving || !weightKg} className="w-full">
          {isSaving ? 'Saving…' : hasRealWeight ? 'Update weight' : 'Confirm weight'}
        </Button>
      </CardContent>
    </Card>
  );
}
