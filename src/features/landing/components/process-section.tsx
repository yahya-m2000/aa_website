"use client";
import { memo, useEffect, useRef } from "react";

import { useTranslations } from "next-intl";
import { gsap } from "gsap";
import {
  StaggerContainer,
  StaggerItem,
  SplitHeading,
} from "@/shared/components/ui";
import { processSteps } from "@/shared/data";
import { prefersReducedMotion } from "@/core/providers/smooth-scroll-provider";

/** Giant step numeral that scrubs from a hollow outline to a solid fill as it scrolls through view. */
function ScrubNumeral({ index }: { index: number }) {
  const wrapRef = useRef<HTMLSpanElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const fill = fillRef.current;
    if (!wrap || !fill || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        fill,
        { opacity: 0 },
        {
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: wrap,
            start: "top 90%",
            end: "top 40%",
            scrub: true,
          },
        },
      );
    }, wrapRef);

    return () => ctx.revert();
  }, []);

  const label = String(index + 1).padStart(2, "0");

  return (
    <span
      ref={wrapRef}
      className="relative block font-display text-7xl md:text-8xl font-bold leading-none select-none [-webkit-text-stroke:1px_rgba(0,0,0,0.15)]"
    >
      <span className="text-transparent">{label}</span>
      <span
        ref={fillRef}
        className="absolute inset-0 text-[rgb(var(--foreground))] opacity-0"
      >
        {label}
      </span>
    </span>
  );
}

export function ProcessSection() {
  const t = useTranslations("logistics");

  return (
    <section id="logistics" className="py-20 md:py-32 overflow-hidden">
      <div className="container-custom">
        <div className="max-w-xl mb-16 md:mb-24">
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

        <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-14">
          {processSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <StaggerItem key={step.key}>
                <div className="relative">
                  <ScrubNumeral index={index} />
                  <Icon className="w-7 h-7 text-[rgb(var(--accent))] -mt-8 mb-4" />
                  <h3 className="font-display text-xl font-bold mb-2">
                    {t(`steps.${step.key}.title`)}
                  </h3>
                  <p className="text-[rgb(var(--muted-foreground))] leading-relaxed">
                    {t(`steps.${step.key}.description`)}
                  </p>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
export default memo(ProcessSection);
