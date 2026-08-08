"use client";
import { memo } from "react";

import { useTranslations } from "next-intl";
import { FadeIn, SplitHeading } from "@/shared/components/ui";
import { FacebookFeedCustom } from "./facebook-feed-custom";

export function SocialSection() {
  const t = useTranslations("facebookFeed");

  return (
    <section id="social" className="py-20 md:py-32">
      <div className="container-custom">
        <div className="max-w-2xl mb-12 md:mb-16">
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

        <FadeIn direction="up" delay={0.1}>
          <FacebookFeedCustom />
        </FadeIn>
      </div>
    </section>
  );
}
export default memo(SocialSection);
