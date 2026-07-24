"use client";
import { memo } from "react";
import { useTranslations } from "next-intl";
import { FadeIn, SplitHeading } from "@/shared/components/ui";
import { Mail, Phone, MapPin } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { socialLinks } from "@/shared/data";
import { ContactForm } from "./contact-form";

export function ContactSection() {
  const t = useTranslations("contact");

  return (
    <section id="contact" className="py-20 md:py-32 bg-[rgb(var(--primary))] text-white">
      <div className="container-custom">
        <div className="max-w-3xl mb-16 md:mb-20">
          <SplitHeading
            as="h2"
            className="font-display text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-6 text-white"
          >
            {t("title")}
          </SplitHeading>
          <p className="text-lg text-white/60 max-w-lg">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left: contact info, narrower column */}
          <FadeIn direction="up" delay={0.1} className="lg:col-span-4">
            <div className="space-y-6">
              <div className="group flex items-start gap-4">
                <div className="w-11 h-11 rounded-full shrink-0 bg-white/10 flex items-center justify-center transition-colors duration-300 group-hover:bg-[rgb(var(--accent))]">
                  <Mail className="w-5 h-5 text-white transition-colors duration-300 group-hover:text-[rgb(var(--accent-foreground))]" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">{t("info.email")}</h4>
                  <a
                    href={`mailto:${socialLinks.email}`}
                    className="text-white/60 hover:text-white transition-colors text-sm break-all"
                  >
                    {socialLinks.email}
                  </a>
                </div>
              </div>

              <div className="group flex items-start gap-4">
                <div className="w-11 h-11 rounded-full shrink-0 bg-white/10 flex items-center justify-center transition-colors duration-300 group-hover:bg-[rgb(var(--accent))]">
                  <Phone className="w-5 h-5 text-white transition-colors duration-300 group-hover:text-[rgb(var(--accent-foreground))]" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">{t("info.phone")}</h4>
                  <a
                    href={`tel:${socialLinks.phone}`}
                    className="text-white/60 hover:text-white transition-colors text-sm"
                  >
                    {socialLinks.phone}
                  </a>
                </div>
              </div>

              <div className="group flex items-start gap-4">
                <div className="w-11 h-11 rounded-full shrink-0 bg-white/10 flex items-center justify-center transition-colors duration-300 group-hover:bg-[rgb(var(--accent))]">
                  <MapPin className="w-5 h-5 text-white transition-colors duration-300 group-hover:text-[rgb(var(--accent-foreground))]" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">{t("info.address")}</h4>
                  <p className="text-white/60 text-sm">
                    {t("info.addressValue")}
                  </p>
                </div>
              </div>

              <a
                href={socialLinks.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 pt-4 mt-4 border-t border-white/10 text-white hover:text-white/70 font-medium transition-colors"
              >
                <FaWhatsapp className="w-5 h-5 text-[#25D366]" />
                {t("cta.button")} — {socialLinks.phone}
              </a>
            </div>
          </FadeIn>

          {/* Right: form, wider column */}
          <FadeIn direction="up" delay={0.2} className="lg:col-span-8">
            <ContactForm />
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
export default memo(ContactSection);
