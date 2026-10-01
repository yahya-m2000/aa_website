import { socialLinks } from '@/shared/data/social-links';

export const SHOP_HOST = 'shop.aatradesolutions.com';
export const SHOP_URL = `https://${SHOP_HOST}`;
export const ANDROID_PACKAGE = 'com.aatradesolutions.aacatalog';

export function productShareUrl(id: string): string {
  return `${SHOP_URL}/p/${id}`;
}

export function previewImageUrl(id: string): string {
  return `${SHOP_URL}/p/${id}/preview.jpg`;
}

// Play Console reads the utm_* values for acquisition reports; `product` is there so a future
// app build can read the install referrer and open the shared product on first launch.
export function playStoreUrl(id?: string): string {
  const referrer = new URLSearchParams({
    utm_source: 'shop_share',
    utm_medium: 'web',
    ...(id ? { product: id } : {}),
  }).toString();
  return `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}&referrer=${encodeURIComponent(referrer)}`;
}

// Targets the app's package explicitly, so no other app that registered the generic "app"
// scheme can claim it, and it works on app versions released before https share links existed.
// Chrome follows browser_fallback_url when the app isn't installed.
export function openInAppUrl(id: string): string {
  const path = `product/${id}?sourceProductId=${id}`;
  return `intent://${path}#Intent;scheme=app;package=${ANDROID_PACKAGE};S.browser_fallback_url=${encodeURIComponent(playStoreUrl(id))};end`;
}

export function whatsAppUrl(message: string): string {
  return `${socialLinks.whatsapp}&text=${encodeURIComponent(message)}`;
}

export function formatUsd(amount: number): string {
  return `$${amount.toFixed(2)}`;
}
