import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';

import { OpenInAppButton } from '@/features/product-share/components/open-in-app-button';
import { ShareFooter, ShareTopbar } from '@/features/product-share/components/share-chrome';
import { ShareHelpBlock, SharePlayBadge } from '@/features/product-share/components/store-actions';
import { sizedImageUrl } from '@/features/product-share/lib/images';
import { formatUsd, previewImageUrl, productShareUrl } from '@/features/product-share/lib/links';
import { getShareProduct, isValidProductId } from '@/features/product-share/lib/product';

// Kept equal to PRODUCT_REVALIDATE_SECONDS in lib/product.ts (segment config must be a literal).
export const revalidate = 1800;

export function generateStaticParams() {
  return [];
}

type Params = { params: Promise<{ id: string }> };

async function loadProduct(id: string) {
  if (!isValidProductId(id)) notFound();
  const product = await getShareProduct(id);
  if (!product) notFound();
  return product;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const product = await loadProduct(id);
  const description = `${formatUsd(product.priceUsd)} · Price may vary slightly · View it in the A&A Shop app`;

  return {
    title: product.title,
    description,
    alternates: { canonical: productShareUrl(id) },
    openGraph: {
      type: 'website',
      siteName: 'A&A Shop',
      url: productShareUrl(id),
      title: product.title,
      description,
      locale: 'en_US',
      images: [{ url: previewImageUrl(id), width: 1200, height: 630, type: 'image/jpeg', alt: product.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.title,
      description,
      images: [previewImageUrl(id)],
    },
  };
}

export default async function ProductSharePage({ params }: Params) {
  const { id } = await params;
  const product = await loadProduct(id);
  const price = formatUsd(product.priceUsd);

  return (
    <>
      <ShareTopbar />
      <main>
        <section className="share-hero">
          <div className="share-shell share-product-grid">
            <div className="share-stage">
              <div className="share-blob" aria-hidden="true" />
              <div className="share-photo">
                {product.imageUrl ? (
                  // Already resized by Alibaba's CDN; skipping Next's optimizer keeps share traffic
                  // off the Vercel image-optimization quota.
                  <Image
                    src={sizedImageUrl(product.imageUrl, 800)}
                    alt={product.title}
                    width={800}
                    height={800}
                    unoptimized
                    priority
                  />
                ) : (
                  <div className="share-photo-empty">No photo available</div>
                )}
              </div>
              <div className="share-price">
                <strong>{price}</strong>
                <small>Price may vary slightly</small>
              </div>
            </div>

            <div className="share-copy">
              <p className="share-pill">
                <span />
                Shared from A&amp;A Shop
              </p>
              <h1>{product.title}</h1>
              <div className="share-actions">
                <OpenInAppButton productId={id} />
                <SharePlayBadge productId={id} />
              </div>
            </div>
          </div>
        </section>

        <ShareHelpBlock message={`Hi A&A, I have a question about this item:\n${product.title}\n${productShareUrl(id)}`} />

        <p className="share-shell share-notice">
          Prices are shown in US dollars and are converted from the seller&apos;s price in China, so they can
          change slightly before you order. You&apos;ll always see the current price in the app.
        </p>
      </main>
      <ShareFooter />
    </>
  );
}
