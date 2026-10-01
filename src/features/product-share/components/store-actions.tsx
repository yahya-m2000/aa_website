import { Check, MessageCircle } from 'lucide-react';
import Image from 'next/image';

import { playStoreUrl, whatsAppUrl } from '../lib/links';

export function SharePlayBadge({ productId }: { productId?: string }) {
  return (
    <>
      <a href={playStoreUrl(productId)} className="share-play-badge" target="_blank" rel="noopener noreferrer">
        <Image src="/images/google-play-badge.png" width={646} height={250} alt="Get it on Google Play" sizes="190px" />
      </a>
      <p className="share-platform-note">
        <Check size={14} />
        Available on Google Play for Android
      </p>
    </>
  );
}

export function ShareHelpBlock({ message }: { message: string }) {
  return (
    <section className="share-shell share-help">
      <span className="share-help-icon">
        <MessageCircle size={24} />
      </span>
      <div>
        <h2>Questions about this item?</h2>
        <p>Our team is here on WhatsApp if you have a question about this item or the app.</p>
      </div>
      <a href={whatsAppUrl(message)} className="share-button" target="_blank" rel="noopener noreferrer">
        Let&apos;s talk
        <MessageCircle size={18} />
      </a>
    </section>
  );
}
