import Image from 'next/image';

export function ShareTopbar() {
  return (
    <header className="share-topbar">
      <div className="share-shell">
        <a href="https://www.aatradesolutions.com" className="share-brand" aria-label="A&A Trade Solutions">
          <Image src="/images/aa-logo-ink.png" alt="A&A" width={480} height={143} sizes="76px" priority />
        </a>
        <p className="share-pill">
          <span />
          A&amp;A Shop
        </p>
      </div>
    </header>
  );
}

export function ShareFooter() {
  return (
    <footer className="share-shell share-footer">
      <span>
        © {new Date().getFullYear()} <a href="https://www.aatradesolutions.com">A&amp;A Trade Solutions</a>
      </span>
      <span>Google Play and the Google Play logo are trademarks of Google LLC.</span>
    </footer>
  );
}
