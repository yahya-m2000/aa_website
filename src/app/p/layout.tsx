import type { Metadata, Viewport } from 'next';
import { DM_Sans, Outfit } from 'next/font/google';

import { SHOP_URL } from '@/features/product-share/lib/links';
import './share.css';

// Product share pages (shop.aatradesolutions.com/p/<id>), linked from the A&A Shop app's share
// button. English-only and outside [locale]; middleware.ts lets /p/* skip next-intl routing.
const outfit = Outfit({ subsets: ['latin'], variable: '--font-share-display', display: 'swap' });
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-share-body', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(SHOP_URL),
  title: { default: 'A&A Shop', template: '%s · A&A Shop' },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: '#eee6f8',
};

export default function ShareLayout({ children }: { children: React.ReactNode }) {
  return <div className={`aa-share ${outfit.variable} ${dmSans.variable}`}>{children}</div>;
}
