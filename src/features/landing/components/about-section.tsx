"use client";
import { memo } from "react";

import { useTranslations } from "next-intl";
import { FadeIn, ScrollReveal } from "@/shared/components/ui";
import { Target, Eye } from "lucide-react";
import Image from "next/image";

export function AboutSection() {
  const t = useTranslations("about");

  return (
    <section id="about" className="relative py-20 md:py-32 overflow-hidden">
      {/* Background */}
      <ScrollReveal className="absolute inset-0 -z-10">
        <div className="relative w-full h-full">
          <Image
            src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1920&q=80"
            alt="Business background"
            fill
            className="object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white" />
        </div>
      </ScrollReveal>

      <div className="container-custom relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <FadeIn direction="up">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                {t("title")}
              </h2>
              <p className="text-xl md:text-2xl text-[rgb(var(--primary))] font-semibold">
                {t("subtitle")}
              </p>
            </FadeIn>
          </div>

          {/* Description */}
          <FadeIn direction="up" delay={0.2}>
            <p className="text-lg text-[rgb(var(--muted-foreground))] leading-relaxed mb-16 text-center">
              {t("description")}
            </p>
          </FadeIn>

          {/* Mission & Vision Grid */}
          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            {/* Mission */}
            <ScrollReveal>
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-[rgb(var(--border))] hover:shadow-2xl transition-shadow duration-300">
                <div className="w-12 h-12 rounded-lg bg-[rgb(var(--primary))] flex items-center justify-center mb-6">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{t("mission")}</h3>
                <p className="text-[rgb(var(--muted-foreground))] leading-relaxed">
                  {t("missionText")}
                </p>
              </div>
            </ScrollReveal>

            {/* Vision */}
            <ScrollReveal>
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-[rgb(var(--border))] hover:shadow-2xl transition-shadow duration-300">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[rgb(var(--primary))] to-[rgb(var(--primary-hover))] flex items-center justify-center mb-6">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{t("vision")}</h3>
                <p className="text-[rgb(var(--muted-foreground))] leading-relaxed">
                  {t("visionText")}
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
export default memo(AboutSection);
