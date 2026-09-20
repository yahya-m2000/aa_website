"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { INTERNAL_STATUS_VALUES } from "../status";

export function OrdersFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [isPending, startTransition] = useTransition();
  const status = searchParams.get("status") ?? "";
  const appliedSearch = searchParams.get("search") ?? "";

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("cursor");
    startTransition(() => {
      router.push(`/admin/orders?${params.toString()}`);
    });
  }

  return (
    <div className="admin-panel space-y-4" aria-busy={isPending}>
      <div className="flex flex-col gap-3 lg:flex-row">
        <form
          className="flex flex-1 gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            updateParam("search", search.trim());
          }}
        >
          <div className="relative min-w-0 flex-1">
            <Search
              aria-hidden="true"
              className="absolute left-3.5 top-3.5 h-4 w-4 text-[rgb(var(--muted-foreground))]"
            />
            <Input
              aria-label="Search orders by reference, customer name, or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Reference, name, or email..."
              className="pl-10"
            />
          </div>
          <Button type="submit" disabled={isPending} className="px-4">
            Search
          </Button>
        </form>
        <select
          aria-label="Filter orders by internal status"
          value={status}
          disabled={isPending}
          onChange={(e) => updateParam("status", e.target.value)}
          className="h-11 rounded-xl border border-[rgb(var(--input))] px-4 text-sm"
        >
          <option value="">All statuses</option>
          {INTERNAL_STATUS_VALUES.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-wrap gap-2" aria-label="Quick status filters">
        {[
          "",
          "Needs Review",
          "Awaiting Payment",
          "Order Created",
          "Shipped",
        ].map((value) => (
          <button
            key={value}
            type="button"
            disabled={isPending}
            aria-pressed={status === value}
            onClick={() => updateParam("status", value)}
            className={`min-h-10 rounded-full border px-3.5 text-xs font-medium transition-colors ${status === value ? "border-transparent bg-[rgb(var(--accent))] text-white" : "border-[rgb(var(--border))] hover:bg-[rgb(var(--muted))]"}`}
          >
            {value || "All orders"}
          </button>
        ))}
      </div>
      {(status || appliedSearch) && (
        <div className="flex flex-wrap items-center gap-3 border-t border-[rgb(var(--border))] pt-3 text-xs text-[rgb(var(--muted-foreground))]">
          <span>
            {status || "All statuses"}
            {appliedSearch ? ` / Search starts with "${appliedSearch}"` : ""}
          </span>
          <Link
            href="/admin/orders"
            className="inline-flex min-h-10 items-center gap-1 font-medium text-[rgb(var(--accent))]"
          >
            <X className="h-3 w-3" /> Clear filters
          </Link>
        </div>
      )}
      <p role="status" className="text-xs text-[rgb(var(--muted-foreground))]">
        {isPending
          ? "Updating orders..."
          : "Search matches the beginning of a reference, name, or email."}
      </p>
    </div>
  );
}
