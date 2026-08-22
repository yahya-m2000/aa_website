'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import { RefreshCw, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/core/utils';

export interface LocalVideoBackgroundProps {
  /** Video URL - a GitHub Release asset URL for the real promo videos (kept
   * out of the repo to avoid bloating clones), or a /public path for
   * anything small enough to commit directly. */
  src: string;
  /** Path to the English WebVTT caption track, e.g. /aa_promotion_material/aa_promo_eng.vtt */
  captionsEn?: string;
  /** Path to the Somali WebVTT caption track, e.g. /aa_promotion_material/aa_promo_som.vtt */
  captionsSo?: string;
  className?: string;
}

type LoadState = 'idle' | 'loading' | 'ready' | 'error';

/**
 * A self-hosted video that fills and crops to its container exactly like a
 * background image — autoplaying muted/looped, no third-party embed and
 * none of the ad-blocker fragility FacebookVideoEmbed had (confirmed live:
 * connect.facebook.net gets ERR_BLOCKED_BY_CLIENT for a meaningful share of
 * visitors).
 *
 * Two reliability measures, since these are hosted as GitHub Release assets
 * (not a purpose-built video CDN — no SLA, an extra redirect hop, and no
 * adaptive bitrate), which is a credible, real source of intermittent load
 * failures:
 *
 * 1. The <video>'s src is only assigned once the component is within
 *    ~600px of the viewport (IntersectionObserver), not on mount. Both
 *    Reel and Testimonials render on initial homepage load via
 *    next/dynamic (no viewport gating of its own), so without this every
 *    visitor's browser fired two ~17-27MB video requests immediately on
 *    page load regardless of whether they ever scrolled that far —
 *    competing for bandwidth with the actually-critical above-the-fold
 *    resources and increasing the odds of hitting a transient host issue
 *    before the section is even in view.
 * 2. onError is handled explicitly: a failed load shows a static poster-
 *    style fallback (matching MediaPlaceholder's visual language) with a
 *    "Tap to retry" control, instead of silently rendering a blank/black
 *    box with no indication anything went wrong.
 *
 * Starts muted (required for autoplay to be allowed by any browser) —
 * clicking toggles sound on/off rather than play/pause, since the video is
 * meant to always be playing as a background element.
 *
 * If captionsEn/captionsSo (WebVTT) are supplied, the matching one for the
 * current next-intl locale is rendered as a default-on <track> - since the
 * video autoplays muted, captions are how the message actually reaches a
 * visitor who hasn't opted into sound yet.
 */
export function LocalVideoBackground({
  src,
  captionsEn,
  captionsSo,
  className,
}: LocalVideoBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [loadState, setLoadState] = useState<LoadState>('idle');
  // Bumped to force React to remount the <video> element on retry - simplest
  // reliable way to restart a failed <video> load (mutating .src and
  // calling .load() works too, but a fresh element sidesteps any stuck
  // internal media-element state from the failed attempt).
  const [attempt, setAttempt] = useState(0);
  const locale = useLocale();

  useEffect(() => {
    const container = containerRef.current;
    if (!container || loadState !== 'idle') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoadState('loading');
          observer.disconnect();
        }
      },
      { rootMargin: '600px 0px' },
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, [loadState]);

  function toggleMuted() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  }

  function retry() {
    setAttempt((a) => a + 1);
    setLoadState('loading');
  }

  const captionsSrc = locale === 'so' ? captionsSo : captionsEn;
  const showVideo = loadState === 'loading' || loadState === 'ready';

  return (
    <div ref={containerRef} className="absolute inset-0 h-full w-full">
      {showVideo && (
        <button
          type="button"
          onClick={toggleMuted}
          aria-label={muted ? 'Unmute video' : 'Mute video'}
          className="group absolute inset-0 h-full w-full cursor-pointer"
        >
          <video
            key={attempt}
            ref={videoRef}
            className={cn('absolute inset-0 h-full w-full object-cover', className)}
            src={src}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            onCanPlay={() => setLoadState('ready')}
            onError={() => setLoadState('error')}
          >
            {captionsSrc && (
              // keyed on locale so switching language swaps the track cleanly
              // instead of the browser keeping the stale-language cue text.
              <track
                key={captionsSrc}
                kind="subtitles"
                src={captionsSrc}
                srcLang={locale}
                label={locale === 'so' ? 'Soomaali' : 'English'}
                default
              />
            )}
          </video>
          {/* Top-right: native caption rendering is always bottom-anchored, so
              a bottom-right button sat on top of the caption text - moved here
              to stay clear of it. Hidden until hover/focus on mice/trackpads
              (pointer: fine), since a persistent control there competes with
              the captions for attention; always shown on touch devices
              (pointer: coarse), since there's no hover state to reveal it and
              it would otherwise be permanently invisible and undiscoverable. */}
          <span className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-opacity duration-200 hover:bg-black/70 pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100 pointer-fine:group-focus-visible:opacity-100">
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </span>
        </button>
      )}

      {loadState === 'error' && (
        <button
          type="button"
          onClick={retry}
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[rgb(var(--muted))] text-center cursor-pointer"
        >
          <div
            className="absolute inset-0 opacity-40 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgb(var(--foreground)) 1px, transparent 0)`,
              backgroundSize: '32px 32px',
            }}
          />
          <RefreshCw className="relative z-10 w-8 h-8 text-[rgb(var(--muted-foreground))]" strokeWidth={1.25} />
          <span className="relative z-10 px-6 text-xs font-medium uppercase tracking-widest text-[rgb(var(--muted-foreground))]">
            Video unavailable — tap to retry
          </span>
        </button>
      )}
    </div>
  );
}
