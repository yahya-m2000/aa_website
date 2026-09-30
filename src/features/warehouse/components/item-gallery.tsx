"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, ImageOff, X } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/shared/components/ui/dialog";
import { warehouseCopy, type WarehouseLang } from "../i18n";
import type { WarehouseItem } from "../warehouse.repository";

// Plain <img> on purpose: Alibaba's image CDN is fast inside mainland China, whereas routing
// photos through the Next image optimizer would send every request via our overseas host.
/* eslint-disable @next/next/no-img-element */

function Photo({ item, className, onError }: { item: WarehouseItem; className: string; onError: () => void }) {
  return <img src={item.imageUrl} alt={item.title} loading="lazy" referrerPolicy="no-referrer" className={className} onError={onError} />;
}

function Missing({ label, large = false }: { label: string; large?: boolean }) {
  return (
    <span role="img" aria-label={label} className="flex h-full w-full items-center justify-center bg-[rgb(var(--muted))] text-[rgb(var(--muted-foreground))]">
      <ImageOff className={large ? "h-8 w-8" : "h-5 w-5"} />
    </span>
  );
}

export function ItemGallery({ items, lang }: { items: WarehouseItem[]; lang: WarehouseLang }) {
  const t = warehouseCopy[lang];
  const [open, setOpen] = useState<number | null>(null);
  const [failed, setFailed] = useState<Set<number>>(new Set());
  const markFailed = (index: number) => setFailed((current) => new Set(current).add(index));
  const move = (delta: number) => setOpen((current) => (current === null ? current : (current + delta + items.length) % items.length));
  const active = open === null ? null : items[open];

  return (
    <>
      <ul className="divide-y divide-[rgb(var(--border))]">
        {items.map((item, index) => {
          const hasImage = Boolean(item.imageUrl) && !failed.has(index);
          return (
            <li key={index} className="flex min-w-0 gap-3 py-3 first:pt-0 last:pb-0">
              {hasImage ? (
                <button
                  type="button"
                  onClick={() => setOpen(index)}
                  aria-label={t.openImage(item.title)}
                  className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-[rgb(var(--border))]"
                >
                  <Photo item={item} className="h-full w-full object-cover" onError={() => markFailed(index)} />
                </button>
              ) : (
                <span className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-[rgb(var(--border))]">
                  <Missing label={t.noImage} />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="break-words text-sm font-medium leading-snug">{item.title}</p>
                {item.variant && <p className="mt-1 break-words text-xs text-[rgb(var(--muted-foreground))]">{item.variant}</p>}
                <p className="mt-1.5 text-sm">
                  {t.quantity}: <span className="font-semibold tabular-nums">{item.quantity}</span>
                </p>
              </div>
            </li>
          );
        })}
      </ul>
      <Dialog open={open !== null} onOpenChange={(value) => !value && setOpen(null)}>
        <DialogContent
          className="w-[calc(100%-1.5rem)] max-w-2xl p-4"
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
              event.preventDefault();
              move(event.key === "ArrowLeft" ? -1 : 1);
            }
          }}
        >
          <DialogClose
            className="absolute right-2 top-2 z-10 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/90"
            aria-label={t.close}
          >
            <X className="h-5 w-5" />
          </DialogClose>
          {active && open !== null && (
            <>
              <div className="mx-auto aspect-square w-full max-w-[60dvh] overflow-hidden rounded-xl bg-[rgb(var(--muted))]">
                {active.imageUrl && !failed.has(open) ? (
                  <Photo key={open} item={active} className="h-full w-full object-contain" onError={() => markFailed(open)} />
                ) : (
                  <Missing label={t.noImage} large />
                )}
              </div>
              <DialogTitle className="mt-3 break-words pr-8 text-base">{active.title}</DialogTitle>
              <DialogDescription className="mt-1 break-words">
                {[active.variant, `${t.quantity}: ${active.quantity}`].filter(Boolean).join(" · ")}
              </DialogDescription>
              {items.length > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <button type="button" onClick={() => move(-1)} className="inline-flex h-11 items-center gap-1 rounded-xl border border-[rgb(var(--border))] px-4 text-sm">
                    <ChevronLeft className="h-4 w-4" /> {t.previous}
                  </button>
                  <span aria-live="polite" className="text-sm tabular-nums">{open + 1} / {items.length}</span>
                  <button type="button" onClick={() => move(1)} className="inline-flex h-11 items-center gap-1 rounded-xl border border-[rgb(var(--border))] px-4 text-sm">
                    {t.next} <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
