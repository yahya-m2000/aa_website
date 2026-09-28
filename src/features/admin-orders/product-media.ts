import type { OrderLineItem } from './types';

export function productImageUrl(item: Pick<OrderLineItem, 'imageUrl'>): string | undefined {
  if (typeof item?.imageUrl !== 'string' || !item.imageUrl.trim()) return undefined;
  const raw = item.imageUrl.trim();
  try {
    const url = new URL(raw.startsWith('//') ? `https:${raw}` : raw);
    return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password ? url.href : undefined;
  } catch { return undefined; }
}
export function taobaoItemUrl(item: Pick<OrderLineItem, 'sourceProductId'>): string | undefined {
  return typeof item.sourceProductId === 'string' && /^\d+$/.test(item.sourceProductId)
    ? `https://item.taobao.com/item.htm?id=${item.sourceProductId}` : undefined;
}
