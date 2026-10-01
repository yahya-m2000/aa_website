'use client';

import { ShareFooter, ShareTopbar } from '@/features/product-share/components/share-chrome';
import { ShareHelpBlock, SharePlayBadge } from '@/features/product-share/components/store-actions';

export default function ShareError({ reset }: { error: Error; reset: () => void }) {
  return (
    <>
      <ShareTopbar />
      <main>
        <section className="share-state">
          <div className="share-shell">
            <h1>
              We couldn&apos;t load <span>this item right now.</span>
            </h1>
            <p>Please try again in a moment, or open it in the A&amp;A Shop app.</p>
            <div className="share-actions">
              <button type="button" className="share-button" onClick={reset}>
                Try again
              </button>
              <SharePlayBadge />
            </div>
          </div>
        </section>
        <ShareHelpBlock message="Hi A&A, I was sent a link to an item but the page wouldn't load." />
      </main>
      <ShareFooter />
    </>
  );
}
