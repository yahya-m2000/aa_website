"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, Ship } from "lucide-react";
import { Button } from "@/shared/components/ui";
import { FadeIn, ScrollReveal } from "@/shared/components/ui";
import { motion } from "framer-motion";
import Image from "next/image";

function HeroSection() {
  const t = useTranslations("hero");
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

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white pt-16 md:pt-20"
    >
      {/* Static background pattern - no animation */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(var(--primary)) 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="container-custom relative z-10 py-20 md:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <FadeIn direction="up" delay={0.2}>
              <div className="inline-flex items-center space-x-2 bg-[rgb(var(--primary))] text-white px-4 py-2 rounded-full text-sm font-medium">
                <Ship className="w-4 h-4" />
                <span>China-Africa Trade Solutions</span>
              </div>
            </FadeIn>

            <FadeIn direction="up" delay={0.4}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="text-gradient">{t("title")}</span>
              </h1>
            </FadeIn>

            <FadeIn direction="up" delay={0.6}>
              <p className="text-lg md:text-xl text-[rgb(var(--muted-foreground))] leading-relaxed max-w-xl">
                {t("subtitle")}
              </p>
            </FadeIn>

            <FadeIn direction="up" delay={0.8}>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild variant="default" size="lg">
                  <a href="#contact" className="group">
                    {t("cta")}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <a href="#services">{t("ctaSecondary")}</a>
                </Button>
              </div>
            </FadeIn>
          </div>

          {/* Right Content - Optimized Card */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-[rgb(var(--border))] transform-gpu hover:scale-[1.02] transition-transform duration-300">
              {/* Image with overlay */}
              <div className="relative h-[400px] md:h-[500px] bg-[rgb(var(--primary))]">
                <Image
                  src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&q=80"
                  alt="Logistics and shipping"
                  fill
                  className="object-cover mix-blend-overlay opacity-60"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                {/* Stats card - removed backdrop-blur for performance */}
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-white/20 rounded-xl p-4 border border-white/30 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/90 text-sm font-medium">
                          Active Shipments
                        </p>
                        <p className="text-white text-2xl font-bold">100+</p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                        <Ship className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative elements - NO BLUR, static gradients */}
            <div className="absolute -z-10 -top-4 -right-4 w-72 h-72 bg-gradient-radial from-[rgb(var(--primary))]/20 to-transparent rounded-full opacity-60 pointer-events-none" />
            <div className="absolute -z-10 -bottom-4 -left-4 w-72 h-72 bg-gradient-radial from-[rgb(var(--primary))]/20 to-transparent rounded-full opacity-60 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Fixed Scroll indicator - Pure CSS animation */}
      <div
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-opacity duration-300"
        style={{ opacity: isScrolled ? 0 : 1 }}
      >
        <div className="w-6 h-10 border-2 border-[rgb(var(--primary))] rounded-full flex items-start justify-center p-2">
          <div className="w-1.5 h-1.5 bg-[rgb(var(--primary))] rounded-full animate-scroll-bounce" />
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
export { HeroSection };
