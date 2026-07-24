"use client";
import { memo } from "react";

import { useTranslations } from "next-intl";
import {
  StaggerContainer,
  StaggerItem,
  AnimatedCounter,
  MediaPlaceholder,
  SplitHeading,
  Parallax,
} from "@/shared/components/ui";
import { stats } from "@/shared/data";

export function StatsSection() {
  const t = useTranslations("stats");

  return (
    <section
      id="stats"
      className="relative py-20 md:py-32 overflow-hidden"
    >
      <div className="container-custom relative">
        <div className="max-w-xl mb-14 md:mb-20">
          <SplitHeading
            as="h2"
            className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4"
          >
            {t("title")}
          </SplitHeading>
          <p className="text-lg text-[rgb(var(--muted-foreground))]">
            {t("subtitle")}
          </p>
        </div>

        <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat) => (
            <StaggerItem key={stat.key}>
              <div className="relative aspect-3/4 rounded-(--radius) overflow-hidden group">
                <Parallax
                  speed={30}
                  className="absolute inset-0"
                  innerClassName="absolute inset-x-0 -top-10 -bottom-10"
                >
                  <MediaPlaceholder
                    type="image"
                    label=""
                    variant="fill"
                    size="compact"
                    className="grayscale group-hover:grayscale-0 transition-[filter] duration-500"
                  />
                </Parallax>
                {/* Dark scrim so white text stays legible over any photo */}
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-black/40" />

                <div className="relative z-10 h-full flex flex-col justify-end p-4 md:p-6">
                  <AnimatedCounter
                    to={stat.value}
                    suffix={stat.suffix}
                    className="font-display text-4xl md:text-5xl font-bold text-white block mb-1"
                  />
                  <p className="text-xs uppercase tracking-widest text-white/80">
                    {t(`${stat.key}.label`)}
                  </p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
export default memo(StatsSection);
