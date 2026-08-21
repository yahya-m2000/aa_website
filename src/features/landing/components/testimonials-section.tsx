"use client";
import { memo } from "react";

import { useTranslations } from "next-intl";
import { Quote, UserRound } from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem, LocalVideoBackground, SplitHeading } from "@/shared/components/ui";
import { testimonials } from "@/shared/data";

// Hosted as a GitHub Release asset, not committed to the repo — see
// reel-section.tsx's STORY_VIDEO_URL comment for why (~17.5MB, would bloat
// every clone). Captions stay local since they're negligible in size.
const PROMO_VIDEO_URL =
  "https://github.com/yahya-m2000/aa_website/releases/download/promo-videos-v1.0.0/aa_promo.mp4";

export function TestimonialsSection() {
  const t = useTranslations("testimonials");
  const [featured, ...rest] = testimonials;

  return (
    <section id="testimonials" className="py-20 md:py-32 overflow-hidden">
      <div className="container-custom">
        <SplitHeading
          as="h2"
          className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 max-w-xl"
        >
          {t("title")}
        </SplitHeading>
        <p className="text-lg text-[rgb(var(--muted-foreground))] mb-16 max-w-md">
          {t("subtitle")}
        </p>

        {/* Featured quote + video, asymmetric split */}
        {featured && (
          <FadeIn direction="up">
            <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-16 md:mb-24">
              <div className="lg:col-span-5 order-2 lg:order-1 relative aspect-4/5 rounded-(--radius) overflow-hidden">
                <LocalVideoBackground
                  src={PROMO_VIDEO_URL}
                  captionsEn="/aa_promotion_material/aa_promo_eng.vtt"
                  captionsSo="/aa_promotion_material/aa_promo_som.vtt"
                />
              </div>
              <div className="lg:col-span-7 order-1 lg:order-2">
                <Quote
                  className="w-14 h-14 text-[rgb(var(--accent))] mb-6"
                  strokeWidth={1.5}
                  fill="rgb(var(--accent))"
                  fillOpacity={0.15}
                />
                <p className="font-display text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.1] tracking-tight mb-8">
                  {t(`items.${featured.id}.quote`)}
                </p>
                <div className="flex items-center gap-3">
                  <span className="w-8 h-px bg-[rgb(var(--accent))]" />
                  <div>
                    <p className="font-display font-bold text-lg">
                      {t(`items.${featured.id}.name`)}
                    </p>
                    <p className="text-sm text-[rgb(var(--muted-foreground))]">
                      {t(`items.${featured.id}.role`)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        )}

        {/* Supporting quotes, horizontal strip */}
        <StaggerContainer className="grid sm:grid-cols-2 gap-6 pt-10 border-t border-[rgb(var(--border))]">
          {rest.map((testimonial) => (
            <StaggerItem key={testimonial.id}>
              <div className="h-full">
                <p className="text-[rgb(var(--foreground))] leading-relaxed mb-4">
                  {t(`items.${testimonial.id}.quote`)}
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full shrink-0 bg-[rgb(var(--muted))] flex items-center justify-center">
                    <UserRound className="w-5 h-5 text-[rgb(var(--muted-foreground))]" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">
                      {t(`items.${testimonial.id}.name`)}
                    </p>
                    <p className="text-xs text-[rgb(var(--muted-foreground))]">
                      {t(`items.${testimonial.id}.role`)}
                    </p>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
export default memo(TestimonialsSection);
