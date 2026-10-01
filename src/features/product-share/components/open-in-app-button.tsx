'use client';

import { ArrowUpRight } from 'lucide-react';
import { useSyncExternalStore } from 'react';

import { openInAppUrl } from '../lib/links';

const noSubscription = () => () => {};

// The intent:// link only works in Android browsers. The server render assumes Android (most
// visitors are, so they never see it pop in); other browsers hide it once hydrated.
export function OpenInAppButton({ productId }: { productId: string }) {
  const isAndroid = useSyncExternalStore(
    noSubscription,
    () => /android/i.test(navigator.userAgent),
    () => true,
  );

  return (
    <a className="share-button" href={openInAppUrl(productId)} hidden={!isAndroid}>
      Open in A&amp;A Shop
      <ArrowUpRight size={18} />
    </a>
  );
}
