'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Input } from '@/shared/components/ui/input';
import { INTERNAL_STATUS_VALUES } from '../status';

export function OrdersFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [, startTransition] = useTransition();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('cursor');
    startTransition(() => {
      router.push(`/admin/orders?${params.toString()}`);
    });
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <form
        className="flex-1"
        onSubmit={(e) => {
          e.preventDefault();
          updateParam('search', search.trim());
        }}
      >
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by reference, name, or email…"
          className="max-w-sm"
        />
      </form>
      <select
        defaultValue={searchParams.get('status') ?? ''}
        onChange={(e) => updateParam('status', e.target.value)}
        className="h-11 rounded-(--radius) border border-[rgb(var(--input))] bg-transparent px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--ring))]"
      >
        <option value="">All statuses</option>
        {INTERNAL_STATUS_VALUES.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
    </div>
  );
}
