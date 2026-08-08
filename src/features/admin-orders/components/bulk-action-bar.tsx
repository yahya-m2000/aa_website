'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Button } from '@/shared/components/ui/button';
import { useToast } from '@/shared/components/ui/toast';
import { INTERNAL_STATUS_VALUES } from '../status';
import type { InternalStatus } from '../types';

// Payment Confirmed is intentionally excluded from bulk actions — batch-confirming payment
// across many orders at once would fire the live procurement automation once per order with
// no per-order confirmation step, which is a materially different risk profile than the
// single-order confirm dialog. Not built this round (explicit scope decision).
const BULK_STATUSES = INTERNAL_STATUS_VALUES.filter((s) => s !== 'Payment Confirmed');

interface BulkActionBarProps {
  selectedReferences: string[];
  onClear: () => void;
}

export function BulkActionBar({ selectedReferences, onClear }: BulkActionBarProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [status, setStatus] = useState<InternalStatus>(BULK_STATUSES[0]);
  const [isApplying, setIsApplying] = useState(false);

  if (selectedReferences.length === 0) return null;

  async function handleApply() {
    setIsApplying(true);
    try {
      const res = await fetch('/api/admin/orders/bulk-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ references: selectedReferences, internalStatus: status }),
      });
      const json = await res.json();
      if (!res.ok) {
        showToast(json?.error?.message ?? 'Bulk update failed', 'error');
        return;
      }

      const results = json.data.results as Array<{ reference: string; ok: boolean }>;
      const failedCount = results.filter((r) => !r.ok).length;
      if (failedCount === 0) {
        showToast(`Updated ${results.length} order${results.length === 1 ? '' : 's'}`);
      } else {
        showToast(`${results.length - failedCount} updated, ${failedCount} failed`, 'error');
      }
      onClear();
      router.refresh();
    } finally {
      setIsApplying(false);
    }
  }

  return (
    <div className="sticky top-0 z-10 flex items-center justify-between gap-3 rounded-(--radius) border border-[rgb(var(--accent))]/30 bg-[rgb(var(--card))] px-4 py-3">
      <span className="text-sm font-medium text-[rgb(var(--foreground))]">
        {selectedReferences.length} selected
      </span>
      <div className="flex items-center gap-2">
        <Select value={status} onValueChange={(v) => setStatus(v as InternalStatus)}>
          <SelectTrigger className="h-9 w-[180px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {BULK_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" onClick={handleApply} disabled={isApplying}>
          {isApplying ? 'Applying…' : 'Apply to selected'}
        </Button>
        <Button size="sm" variant="ghost" onClick={onClear} disabled={isApplying}>
          Clear
        </Button>
      </div>
    </div>
  );
}
