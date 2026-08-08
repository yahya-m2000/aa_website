'use client';

import { useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import { Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/core/utils';

export interface LocalVideoBackgroundProps {
  /** Path under /public, e.g. /aa_promotion_material/aa_promo.mp4 */
  src: string;
  /** Path to the English WebVTT caption track, e.g. /aa_promotion_material/aa_promo_eng.vtt */
  captionsEn?: string;
  /** Path to the Somali WebVTT caption track, e.g. /aa_promotion_material/aa_promo_som.vtt */
  captionsSo?: string;
  className?: string;
}

/**
 * A self-hosted video that fills and crops to its container exactly like a
 * background image — autoplaying muted/looped, no third-party embed and
 * none of the ad-blocker fragility FacebookVideoEmbed had (confirmed live:
 * connect.facebook.net gets ERR_BLOCKED_BY_CLIENT for a meaningful share of
 * visitors). preload="metadata" avoids eagerly downloading the full file
 * (these run ~15-18MB) before the section is actually in view.
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const locale = useLocale();

  const toggleMuted = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  const captionsSrc = locale === 'so' ? captionsSo : captionsEn;

  return (
    <button
      type="button"
      onClick={toggleMuted}
      aria-label={muted ? 'Unmute video' : 'Mute video'}
      className="group absolute inset-0 h-full w-full cursor-pointer"
    >
      <video
        ref={videoRef}
        className={cn('absolute inset-0 h-full w-full object-cover', className)}
        src={src}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
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
  );
}
