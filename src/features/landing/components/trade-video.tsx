"use client";

import { useState, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import * as Dialog from "@radix-ui/react-dialog";
import { X, ExternalLink, RotateCcw } from "lucide-react";

const videos = {
  story: "/videos/aa-story.mp4",
  promo: "/videos/aa-client-story.mp4",
} as const;

export function TradeVideo({
  children,
  kind = "story",
  className,
}: {
  children: ReactNode;
  kind?: "story" | "promo";
  className?: string;
}) {
  const locale = useLocale();
  const t = useTranslations("experience");
  const [error, setError] = useState(false);
  const source = videos[kind];

  return (
    <Dialog.Root onOpenChange={() => setError(false)}>
      <Dialog.Trigger className={className}>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="trade-video-overlay" />
        <Dialog.Content
          className="trade-video-dialog"
          aria-describedby={undefined}
        >
          <div className="trade-video-top">
            <Dialog.Title>
              {t(kind === "story" ? "watchStory" : "watchClient")}
            </Dialog.Title>
            <Dialog.Close aria-label={t("close")}>
              <X size={22} />
            </Dialog.Close>
          </div>
          {error ? (
            <div className="trade-video-error" role="alert">
              <p>{t("videoError")}</p>
              <div className="trade-video-error-actions">
                <button type="button" onClick={() => setError(false)}>
                  <RotateCcw size={16} />
                  {t("retryVideo")}
                </button>
                <a href={source} target="_blank" rel="noopener noreferrer">
                  {t("openVideo")}
                  <ExternalLink size={16} />
                </a>
              </div>
            </div>
          ) : (
            // H.264/AAC copies and captions share the site's origin. The original
            // GitHub files use HEVC and do not provide CORS response headers.
            <video
              controls
              autoPlay
              playsInline
              preload="metadata"
              onError={(event) => {
                // A failed caption must not replace an otherwise playable video.
                if (event.target === event.currentTarget) setError(true);
              }}
            >
              <source
                src={source}
                type="video/mp4"
                onError={() => setError(true)}
              />
              <track
                kind="captions"
                src={`/aa_promotion_material/aa_${kind}_eng.vtt`}
                srcLang="en"
                label="English"
                default={locale === "en"}
              />
              <track
                kind="captions"
                src={`/aa_promotion_material/aa_${kind}_som.vtt`}
                srcLang="so"
                label="Soomaali"
                default={locale === "so"}
              />
            </video>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
