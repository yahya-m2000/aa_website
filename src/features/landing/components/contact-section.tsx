"use client";
import { memo } from "react";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  FadeIn,
  Button,
  Input,
  Label,
  Textarea,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/shared/components/ui";
import { Mail, Phone, MapPin } from "lucide-react";

export function ContactSection() {
  const t = useTranslations("contact");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate submission
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    alert("Message sent! (This is a demo)");
  };

  return (
    <section id="contact" className="py-20 md:py-32 bg-white">
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <FadeIn direction="up">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              {t("title")}
            </h2>
            <p className="text-lg text-[rgb(var(--muted-foreground))]">
              {t("subtitle")}
            </p>
          </FadeIn>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Form */}
          <FadeIn direction="left" delay={0.2}>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{t("form.submit")}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t("form.name")}</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder={t("form.name")}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">{t("form.email")}</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t("form.email")}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">{t("form.phone")}</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder={t("form.phone")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">{t("form.company")}</Label>
                    <Input
                      id="company"
                      type="text"
                      placeholder={t("form.company")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">{t("form.message")}</Label>
                    <Textarea
                      id="message"
                      placeholder={t("form.message")}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="default"
                    size="lg"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? t("form.sending") : t("form.submit")}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </FadeIn>

          {/* Contact Information */}
          <FadeIn direction="right" delay={0.4}>
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold mb-6">{t("info.title")}</h3>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-lg bg-[rgb(var(--primary))]/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-[rgb(var(--primary))]" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Email</h4>
                      <a
                        href={`mailto:${t("info.email")}`}
                        className="text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--primary))] transition-colors"
                      >
                        {t("info.email")}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-lg bg-[rgb(var(--primary))]/10 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-[rgb(var(--primary))]" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Phone</h4>
                      <a
                        href={`tel:${t("info.phone")}`}
                        className="text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--primary))] transition-colors"
                      >
                        {t("info.phone")}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-lg bg-[rgb(var(--primary))]/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-[rgb(var(--primary))]" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Address</h4>
                      <p className="text-[rgb(var(--muted-foreground))]">
                        {t("info.address")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Card */}
              <Card className="bg-[rgb(var(--primary))] text-white border-0">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-2">
                    Ready to streamline your supply chain?
                  </h3>
                  <p className="text-white/90 mb-6">
                    Let's discuss how we can help your business grow with our
                    procurement and logistics solutions.
                  </p>
                  <Button
                    variant="outline"
                    size="lg"
                    className="bg-white text-[rgb(var(--primary))] hover:bg-white/90 border-white"
                  >
                    Schedule a Consultation
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
