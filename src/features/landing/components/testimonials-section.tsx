"use client";
import { memo } from "react";

import { useTranslations } from "next-intl";
import { Quote } from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem, MediaPlaceholder, SplitHeading, Parallax } from "@/shared/components/ui";
import { testimonials } from "@/shared/data";

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
                <Parallax
                  speed={40}
                  className="absolute inset-0"
                  innerClassName="absolute inset-x-0 -top-14 -bottom-14"
                >
                  <MediaPlaceholder
                    type="video"
                    label={t("videoLabel")}
                    variant="fill"
                    className="rounded-none border-0"
                  />
                </Parallax>
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
                  <MediaPlaceholder
                    type="image"
                    label=""
                    size="compact"
                    aspectRatio="aspect-square"
                    className="w-10 h-10 rounded-full shrink-0"
                  />
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

        <p className="text-xs text-[rgb(var(--muted-foreground))] mt-10 uppercase tracking-widest">
          {t("placeholderNotice")}
        </p>
      </div>
    </section>
  );
}
export default memo(TestimonialsSection);
