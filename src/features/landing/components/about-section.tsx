"use client";
import { memo } from "react";

import { useTranslations } from "next-intl";
import { FadeIn, MediaPlaceholder, SplitHeading, Parallax } from "@/shared/components/ui";
import { Target, Eye } from "lucide-react";

export function AboutSection() {
  const t = useTranslations("about");

  return (
    <section id="about" className="py-20 md:py-32">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: copy */}
          <div>
            <SplitHeading
              as="h2"
              className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4"
            >
              {t("title")}
            </SplitHeading>
            <FadeIn direction="up">
              <p className="text-xl text-[rgb(var(--foreground))] font-semibold mb-6">
                {t("subtitle")}
              </p>
            </FadeIn>

            <FadeIn direction="up" delay={0.1}>
              <p className="text-lg text-[rgb(var(--muted-foreground))] leading-relaxed mb-10">
                {t("description")}
              </p>
            </FadeIn>

            <div className="space-y-8">
              <FadeIn direction="up" delay={0.2}>
                <div className="group flex gap-4">
                  <div className="w-12 h-12 rounded-full shrink-0 bg-[rgb(var(--muted))] flex items-center justify-center transition-all duration-300 group-hover:bg-[rgb(var(--primary))] group-hover:scale-110">
                    <Target className="w-6 h-6 text-[rgb(var(--foreground))] transition-colors duration-300 group-hover:text-white" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold mb-1">
                      {t("mission")}
                    </h3>
                    <p className="text-[rgb(var(--muted-foreground))] leading-relaxed">
                      {t("missionText")}
                    </p>
                  </div>
                </div>
              </FadeIn>

              <FadeIn direction="up" delay={0.3}>
                <div className="group flex gap-4">
                  <div className="w-12 h-12 rounded-full shrink-0 bg-[rgb(var(--muted))] flex items-center justify-center transition-all duration-300 group-hover:bg-[rgb(var(--primary))] group-hover:scale-110">
                    <Eye className="w-6 h-6 text-[rgb(var(--foreground))] transition-colors duration-300 group-hover:text-white" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold mb-1">
                      {t("vision")}
                    </h3>
                    <p className="text-[rgb(var(--muted-foreground))] leading-relaxed">
                      {t("visionText")}
                    </p>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>

          {/* Right: photography placeholder, subtle scroll parallax */}
          <div className="relative aspect-4/5 rounded-(--radius) overflow-hidden">
            <Parallax
              speed={50}
              className="absolute inset-0"
              innerClassName="absolute inset-x-0 -top-20 -bottom-20"
            >
              <MediaPlaceholder
                type="image"
                label={t("imagePlaceholderLabel")}
                aspectRatio="aspect-auto"
                className="h-full rounded-none border-0"
              />
            </Parallax>
          </div>
        </div>
      </div>
    </section>
  );
}
export default memo(AboutSection);
