"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Ship, Facebook } from "lucide-react";
import { FaWhatsapp, FaFacebookF } from "react-icons/fa";
import { Button } from "@/shared/components/ui";
import { FadeIn } from "@/shared/components/ui";
import { FacebookFeedCustom } from "./facebook-feed-custom";

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
      {/* Static background pattern */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(var(--primary)) 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="container-custom relative z-10 py-12 md:py-20">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left Column - Hero Content */}
          <div className="space-y-8">
            <FadeIn direction="up" delay={0.2}>
              <div className="inline-flex items-center space-x-2 bg-[rgb(var(--primary))] text-white px-4 py-2 text-sm font-medium mb-6">
                <Ship className="w-4 h-4" />
                <span>{t("badge")}</span>
              </div>
            </FadeIn>

            <FadeIn direction="up" delay={0.3}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
                <span className="text-gradient">{t("title")}</span>
              </h1>
            </FadeIn>

            <FadeIn direction="up" delay={0.4}>
              <p className="text-lg md:text-xl text-[rgb(var(--muted-foreground))] leading-relaxed max-w-xl">
                {t("subtitle")}
              </p>
            </FadeIn>

            {/* CTA Buttons - 2 Buttons Only */}
            <FadeIn direction="up" delay={0.5}>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  asChild
                  variant="default"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  <a
                    href="https://www.facebook.com/aatradesolutions"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2"
                  >
                    <Facebook className="w-5 h-5" />
                    {t("facebook")}
                  </a>
                </Button>
                <Button
                  asChild
                  variant="default"
                  size="lg"
                  className="bg-[#25D366] hover:bg-[#25D366]/90 w-full sm:w-auto"
                >
                  <a
                    href="https://api.whatsapp.com/send?phone=%2B252638571847"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2"
                  >
                    <FaWhatsapp className="w-5 h-5" />
                    {t("whatsapp")}
                  </a>
                </Button>
              </div>
            </FadeIn>

            {/* Quick Stats */}
            <FadeIn direction="up" delay={0.6}>
              <div className="grid grid-cols-3 gap-6 max-w-xl pt-8 border-t border-[rgb(var(--border))]">
                <div>
                  <p className="text-2xl md:text-3xl font-bold text-[rgb(var(--primary))]">
                    500+
                  </p>
                  <p className="text-sm text-[rgb(var(--muted-foreground))]">
                    {t("shipmentsLabel")}
                  </p>
                </div>
                <div>
                  <p className="text-2xl md:text-3xl font-bold text-[rgb(var(--primary))]">
                    12+
                  </p>
                  <p className="text-sm text-[rgb(var(--muted-foreground))]">
                    {t("countriesLabel")}
                  </p>
                </div>
                <div>
                  <p className="text-2xl md:text-3xl font-bold text-[rgb(var(--primary))]">
                    98%
                  </p>
                  <p className="text-sm text-[rgb(var(--muted-foreground))]">
                    {t("satisfactionLabel")}
                  </p>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Right Column - Custom Facebook Feed */}
          <FadeIn direction="up" delay={0.4}>
            <div className="bg-white overflow-hidden lg:sticky lg:top-24 mt-8 lg:mt-0">
              <div className="pb-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-3xl md:text-4xl font-bold">
                    <span className="text-gradient">{t("latestFromFacebook")}</span>
                  </h3>
                  <FaFacebookF className="w-6 h-6 text-[rgb(var(--primary))]" />
                </div>
                <FacebookFeedCustom />
              </div>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-opacity duration-300"
        style={{ opacity: isScrolled ? 0 : 1 }}
      >
        <div className="w-6 h-10 border-2 border-[rgb(var(--primary))] flex items-start justify-center p-2">
          <div className="w-1.5 h-1.5 bg-[rgb(var(--primary))] animate-scroll-bounce" />
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
export { HeroSection };
