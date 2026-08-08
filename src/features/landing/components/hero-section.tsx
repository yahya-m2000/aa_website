"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { ShieldCheck } from "lucide-react";
import { SplitHeading } from "@/shared/components/ui";
import { stats } from "@/shared/data";

function HeroSection() {
  const t = useTranslations("hero");
  const tStats = useTranslations("stats");
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 100);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const years = stats.find((s) => s.key === "years");
  const satisfaction = stats.find((s) => s.key === "satisfaction");

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center overflow-hidden pt-16 md:pt-20"
    >
      <div className="container-custom w-full relative z-10 py-16 md:py-24">
        <div className="max-w-4xl">
          <SplitHeading
            as="h1"
            variant="immediate"
            className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.95] tracking-tight [&_.text-stone]:text-[rgb(var(--stone))]"
          >
            {t.rich("title", {
              stone: (chunks) => (
                <span className="text-stone text-[rgb(var(--stone))]">
                  {chunks}
                </span>
              ),
            })}
          </SplitHeading>

          {/* Social-proof strip */}
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4 mt-10">
            <div className="flex items-center gap-2 text-[rgb(var(--muted-foreground))]">
              <ShieldCheck className="w-5 h-5 text-[rgb(var(--foreground))]" />
              <span className="text-xs uppercase tracking-widest font-medium">
                {t("trustLabel")}
              </span>
            </div>
            {years && (
              <div className="flex items-baseline gap-1.5">
                <span className="font-display text-2xl font-bold">
                  {years.value}
                  {years.suffix}
                </span>
                <span className="text-xs uppercase tracking-widest text-[rgb(var(--muted-foreground))]">
                  {tStats("years.label")}
                </span>
              </div>
            )}
            {satisfaction && (
              <div className="flex items-baseline gap-1.5">
                <span className="font-display text-2xl font-bold">
                  {satisfaction.value}
                  {satisfaction.suffix}
                </span>
                <span className="text-xs uppercase tracking-widest text-[rgb(var(--muted-foreground))]">
                  {tStats("satisfaction.label")}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-opacity duration-300 ${
          isScrolled ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className="w-6 h-10 rounded-full border-2 border-[rgb(var(--foreground))]/20 flex items-start justify-center p-1.5">
          <div className="w-1 h-2 rounded-full bg-[rgb(var(--foreground))]/40 animate-scroll-bounce" />
        </div>
      </div>
    </section>
  );
}

export { HeroSection };
export default HeroSection;
