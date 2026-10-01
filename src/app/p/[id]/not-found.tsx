import { ShareFooter, ShareTopbar } from '@/features/product-share/components/share-chrome';
import { ShareHelpBlock, SharePlayBadge } from '@/features/product-share/components/store-actions';

export default function ShareNotFound() {
  return (
    <>
      <ShareTopbar />
      <main>
        <section className="share-state">
          <div className="share-shell">
            <h1>
              This item isn&apos;t <span>available anymore.</span>
            </h1>
            <p>The seller may have removed it. Open the A&amp;A Shop app to find something similar.</p>
            <div className="share-actions">
              <SharePlayBadge />
            </div>
          </div>
        </section>
        <ShareHelpBlock message="Hi A&A, I was sent a link to an item that isn't available anymore." />
      </main>
      <ShareFooter />
    </>
  );
}
