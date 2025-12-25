"use client";
import { memo } from "react";
import { useTranslations } from "next-intl";
import {
  FadeIn,
  Button,
  Card,
  CardContent,
} from "@/shared/components/ui";
import { Mail, Phone, MapPin } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

export function ContactSection() {
  const t = useTranslations("contact");

  return (
    <section id="contact" className="py-20 md:py-32 bg-[rgb(var(--muted))]">
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <FadeIn direction="up">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span className="text-gradient">{t("title")}</span>
            </h2>
            <p className="text-xl text-[rgb(var(--muted-foreground))]">
              {t("subtitle")}
            </p>
          </FadeIn>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Contact Information */}
          <FadeIn direction="up" delay={0.2}>
            <div className="space-y-12">
              {/* Contact Cards Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-[rgb(var(--primary))]/10 flex items-center justify-center mx-auto mb-4">
                      <Mail className="w-8 h-8 text-[rgb(var(--primary))]" />
                    </div>
                    <h4 className="font-bold text-lg mb-2">{t("info.email")}</h4>
                    <a
                      href={`mailto:${t("info.emailValue")}`}
                      className="text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--primary))] transition-colors text-sm break-all"
                    >
                      {t("info.emailValue")}
                    </a>
                  </CardContent>
                </Card>

                <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-[rgb(var(--primary))]/10 flex items-center justify-center mx-auto mb-4">
                      <Phone className="w-8 h-8 text-[rgb(var(--primary))]" />
                    </div>
                    <h4 className="font-bold text-lg mb-2">{t("info.phone")}</h4>
                    <a
                      href={`tel:${t("info.phoneValue")}`}
                      className="text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--primary))] transition-colors text-sm"
                    >
                      {t("info.phoneValue")}
                    </a>
                  </CardContent>
                </Card>

                <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-[#25D366]/10 flex items-center justify-center mx-auto mb-4">
                      <FaWhatsapp className="w-8 h-8 text-[#25D366]" />
                    </div>
                    <h4 className="font-bold text-lg mb-2">{t("info.whatsapp")}</h4>
                    <a
                      href="https://api.whatsapp.com/send?phone=%2B252638571847"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[rgb(var(--muted-foreground))] hover:text-[#25D366] transition-colors text-sm"
                    >
                      {t("info.phoneValue")}
                    </a>
                  </CardContent>
                </Card>

                <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-[rgb(var(--primary))]/10 flex items-center justify-center mx-auto mb-4">
                      <MapPin className="w-8 h-8 text-[rgb(var(--primary))]" />
                    </div>
                    <h4 className="font-bold text-lg mb-2">{t("info.address")}</h4>
                    <p className="text-[rgb(var(--muted-foreground))] text-sm">
                      {t("info.addressValue")}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* CTA Card */}
              <Card className="relative overflow-hidden text-white border-0 shadow-2xl">
                {/* Gradient Background */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(135deg, rgb(88, 36, 220) 0%, rgb(59, 24, 147) 50%, rgb(47, 19, 118) 100%)",
                  }}
                />

                {/* Dot Pattern Overlay */}
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                    backgroundSize: "32px 32px",
                  }}
                />

                {/* Decorative Circles */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />

                <CardContent className="relative p-12 text-center">
                  <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                    <span className="text-white">{t("cta.title")}</span>
                  </h3>
                  <p className="text-white/90 mb-10 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
                    {t("cta.description")}
                  </p>
                  <Button
                    asChild
                    variant="default"
                    size="lg"
                    className="bg-[#25D366] hover:bg-[#25D366]/90"
                  >
                    <a
                      href="https://api.whatsapp.com/send?phone=%2B252638571847"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2"
                    >
                      <FaWhatsapp className="w-5 h-5" />
                      {t("cta.button")}
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
export default memo(ContactSection);
