'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ImageOff, X } from 'lucide-react';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { productImageUrl, taobaoItemUrl } from '../product-media';
import type { OrderLineItem } from '../types';

function shouldLoadOriginalImage(url: string) {
  const { protocol, hostname } = new URL(url);
  // Known CDN images use Next's thumbnail sizing. Older external URLs still render
  // directly instead of throwing for an unconfigured image-optimizer host.
  return protocol !== 'https:' || !(hostname.endsWith('.alicdn.com') || hostname === 'images.unsplash.com');
}
function Placeholder() {
  return <span className="flex h-full w-full items-center justify-center bg-[rgb(var(--muted))] text-[rgb(var(--muted-foreground))]" role="img" aria-label="Image unavailable"><ImageOff size={24} /></span>;
}
export function ProductThumbnail({ url, title, size = 40 }: { url?: string; title: string; size?: number }) {
  const [failedUrl, setFailedUrl] = useState<string>();
  return <span className="relative block shrink-0 overflow-hidden rounded-lg border border-[rgb(var(--border))]" style={{ width: size, height: size }}>
    {url && failedUrl !== url ? <Image src={url} alt={title} fill sizes={`${size}px`} className="object-cover" unoptimized={shouldLoadOriginalImage(url)} onError={() => setFailedUrl(url)} /> : <Placeholder />}
  </span>;
}
export function ProductImageViewer({ items, index }: { items: OrderLineItem[]; index: number }) {
  const [active, setActive] = useState(index);
  const [failed, setFailed] = useState<Set<string>>(new Set());
  const thumbnail = productImageUrl(items[index]);
  const item = items[active];
  const url = productImageUrl(item);
  const taobao = taobaoItemUrl(item);
  const move = (delta: number) => setActive(current => (current + delta + items.length) % items.length);
  const fail = (src: string) => setFailed(current => new Set(current).add(src));
  if (!thumbnail || failed.has(thumbnail)) return <ProductThumbnail title={items[index].productTitle} size={64} />;
  return <Dialog onOpenChange={open => { if (open) setActive(index); }}>
    <DialogTrigger asChild>
      <button type="button" className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-[rgb(var(--border))] focus-visible:outline-2 focus-visible:outline-offset-2" aria-label={`View larger image of ${items[index].productTitle}`}>
        <Image src={thumbnail} alt="" fill sizes="64px" className="object-cover" unoptimized={shouldLoadOriginalImage(thumbnail)} onError={() => fail(thumbnail)} />
      </button>
    </DialogTrigger>
    <DialogContent className="w-[calc(100%-2rem)] max-w-3xl max-h-[90dvh] overflow-y-auto p-4 sm:p-6" onKeyDown={event => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1); }
    }}>
      <DialogClose asChild><Button variant="ghost" size="icon" className="absolute right-2 top-2 z-10" aria-label="Close image viewer"><X size={20} /></Button></DialogClose>
      <div className="relative mx-auto aspect-square w-full max-w-[55vh] overflow-hidden rounded-lg bg-[rgb(var(--muted))]">
        {url && !failed.has(url) ? <Image key={url} src={url} alt={item.productTitle} fill sizes="(max-width: 640px) 90vw, 55vh" className="object-contain" unoptimized={shouldLoadOriginalImage(url)} onError={() => fail(url)} /> : <Placeholder />}
      </div>
      <DialogTitle className="mt-4 break-words pr-6 text-base">{item.productTitle}</DialogTitle>
      <DialogDescription className="mt-1 break-words">{item.variantOptions?.map(v => `${v.name}: ${v.value}`).join(' · ') || 'Product image'}</DialogDescription>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2"><Button variant="outline" size="sm" onClick={() => move(-1)} disabled={items.length < 2}>Previous</Button><span aria-live="polite">{active + 1} / {items.length}</span><Button variant="outline" size="sm" onClick={() => move(1)} disabled={items.length < 2}>Next</Button></div>
        <div className="flex gap-4 text-[rgb(var(--accent))]">{url && <a href={url} target="_blank" rel="noopener noreferrer">Open full size</a>}{taobao && <a href={taobao} target="_blank" rel="noopener noreferrer">View on Taobao</a>}</div>
      </div>
    </DialogContent>
  </Dialog>;
}
