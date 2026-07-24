"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import {
  Download,
  ArrowLeft,
  FileArchive,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";
import { Button, SplitHeading, MediaPlaceholder } from "@/shared/components/ui";
import { FadeIn } from "@/shared/components/ui";

const APK_PATH =
  "https://github.com/yahya-m2000/aa_website/releases/download/app-v1.0.0/aagroup.apk";
const APK_SIZE = "98 MB";
const APK_VERSION = "1.0.0";
const APK_UPDATED = "July 2, 2026";

export default function DownloadPage() {
  const t = useTranslations("download");

  const steps = [
    t("steps.one"),
    t("steps.two"),
    t("steps.three"),
    t("steps.four"),
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[rgb(var(--primary))] text-white pt-32 pb-20 md:pt-44 md:pb-28">
        <div className="absolute inset-0 opacity-[0.08] pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgb(255 255 255) 1px, transparent 0)`,
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="container-custom relative z-10">
          <FadeIn direction="up">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-white/60 hover:text-white transition-colors mb-10"
            >
              <ArrowLeft className="w-4 h-4" />
              {t("backHome")}
            </Link>
          </FadeIn>

          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            <div className="lg:col-span-7">
              <FadeIn direction="up" delay={0.1}>
                <div className="inline-flex items-center gap-2 rounded-full bg-[rgb(var(--accent))] text-[rgb(var(--accent-foreground))] px-4 py-1.5 text-xs font-semibold uppercase tracking-widest mb-6">
                  {t("badge")}
                </div>
              </FadeIn>

              <SplitHeading
                as="h1"
                variant="immediate"
                className="font-display text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.02] mb-6 text-white"
              >
                {t("title")}
              </SplitHeading>

              <FadeIn direction="up" delay={0.3}>
                <p className="text-lg text-white/70 leading-relaxed max-w-lg mb-10">
                  {t("subtitle")}
                </p>
              </FadeIn>

              <FadeIn direction="up" delay={0.4}>
                <Button asChild variant="accent" size="xl">
                  <a href={APK_PATH} download>
                    <Download className="w-5 h-5" />
                    {t("button")}
                  </a>
                </Button>
              </FadeIn>
            </div>

            {/* Placeholder for app screenshot / device mockup */}
            <div className="lg:col-span-5">
              <FadeIn direction="up" delay={0.2}>
                <MediaPlaceholder
                  type="image"
                  label="App Screenshot Placeholder"
                  aspectRatio="aspect-3/4"
                  className="bg-white/5 border-white/10"
                />
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* Details + Instructions */}
      <section className="bg-white py-20 md:py-28">
        <div className="container-custom">
          <div className="max-w-3xl">
            {/* Download details card */}
            <FadeIn direction="up">
              <div className="rounded-(--radius) bg-[rgb(var(--card))] border border-[rgb(var(--border))] overflow-hidden">
                <div className="p-6 md:p-8 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="w-12 h-12 rounded-full shrink-0 bg-[rgb(var(--primary))] flex items-center justify-center">
                    <FileArchive className="w-5 h-5 text-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold mb-1">{t("fileLabel")}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-[rgb(var(--muted-foreground))]">
                      <span>
                        {t("size")}: {APK_SIZE}
                      </span>
                      <span>
                        {t("version")}: {APK_VERSION}
                      </span>
                      <span>
                        {t("updated")}: {APK_UPDATED}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 px-6 md:px-8 py-5 border-t border-[rgb(var(--border))] bg-[rgb(var(--muted))]">
                  <AlertTriangle className="w-5 h-5 text-[rgb(var(--accent))] shrink-0 mt-0.5" />
                  <p className="text-sm text-[rgb(var(--muted-foreground))] leading-relaxed">
                    {t("fileNote")}
                  </p>
                </div>
              </div>
            </FadeIn>

            {/* Trust line */}
            <FadeIn direction="up" delay={0.1}>
              <div className="flex items-center gap-2 mt-6 text-sm text-[rgb(var(--muted-foreground))]">
                <ShieldCheck className="w-4 h-4 text-[rgb(var(--foreground))]" />
                <span>{t("fileLabel")} · A&A Trade Solutions</span>
              </div>
            </FadeIn>

            {/* Install Instructions */}
            <div className="mt-16">
              <FadeIn direction="up">
                <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight mb-8">
                  {t("instructionsTitle")}
                </h2>
              </FadeIn>
              <ol className="grid sm:grid-cols-2 gap-6">
                {steps.map((step, index) => (
                  <FadeIn direction="up" delay={0.05 * index} key={index}>
                    <li className="flex items-start gap-4">
                      <span className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-[rgb(var(--primary))] text-white text-sm font-semibold">
                        {index + 1}
                      </span>
                      <p className="text-[rgb(var(--muted-foreground))] leading-relaxed pt-1.5">
                        {step}
                      </p>
                    </li>
                  </FadeIn>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
