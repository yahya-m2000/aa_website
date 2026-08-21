"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { gsap } from "gsap";
import { FadeIn, LocalVideoBackground } from "@/shared/components/ui";
import { prefersReducedMotion } from "@/core/providers/smooth-scroll-provider";

// Hosted as a GitHub Release asset, not committed to the repo — at ~27MB,
// tracking this file in git would bloat every clone forever. Captions stay
// local (public/) since they're a couple KB each, no reason to move those.
const STORY_VIDEO_URL =
  "https://github.com/yahya-m2000/aa_website/releases/download/promo-videos-v1.0.0/aa_story.mp4";

function ReelSection() {
  const t = useTranslations("hero");
  const sectionRef = useRef<HTMLElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap
        .timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top center",
            end: "top top",
            scrub: 1,
          },
        })
        .to(wrapRef.current, {
          paddingLeft: "0rem",
          paddingRight: "0rem",
          duration: 1,
          ease: "power2.out",
        })
        .to(
          frameRef.current,
          { borderRadius: 0, duration: 1, ease: "power2.out" },
          "<"
        );
    }, sectionRef);

    // ctx.revert() already tears down every ScrollTrigger/tween created
    // inside this context - do NOT also call ScrollTrigger.getAll().kill()
    // here, since that kills every ScrollTrigger on the page globally,
    // including ones owned by other components (e.g. SplitHeading).
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="reel" className="py-16 md:py-24">
      <FadeIn direction="up">
        <p className="text-center text-xs font-medium uppercase tracking-widest text-[rgb(var(--muted-foreground))] mb-6">
          {t("introVideoLabel")}
        </p>
      </FadeIn>
      <div ref={wrapRef} className="px-[5vw]">
        <div
          ref={frameRef}
          className="relative aspect-video rounded-(--radius) overflow-hidden"
        >
          <LocalVideoBackground
            src={STORY_VIDEO_URL}
            captionsEn="/aa_promotion_material/aa_story_eng.vtt"
            captionsSo="/aa_promotion_material/aa_story_som.vtt"
          />
        </div>
      </div>
    </section>
  );
}

export { ReelSection };
export default ReelSection;
