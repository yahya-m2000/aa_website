"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import {
  Smartphone,
  Download,
  ArrowLeft,
  FileArchive,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/shared/components/ui";
import { FadeIn } from "@/shared/components/ui";
import Image from "next/image";

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
    <section className="relative min-h-screen flex items-center overflow-hidden bg-white pt-32 pb-20 md:pt-40 md:pb-28">
      {/* Background dot pattern - consistent with hero */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(var(--primary)) 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="container-custom relative z-10">
        <div className="max-w-2xl mx-auto">
          {/* Back link */}
          <FadeIn direction="up">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-[rgb(var(--foreground))]/60 hover:text-[rgb(var(--primary))] transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              {t("backHome")}
            </Link>
          </FadeIn>

          {/* Header */}
          <FadeIn direction="up" delay={0.1}>
            <div className="inline-flex items-center space-x-2 bg-[rgb(var(--primary))] text-white px-4 py-2 text-sm font-medium mb-6">
              <Smartphone className="w-4 h-4" />
              <span>{t("badge")}</span>
            </div>
          </FadeIn>

          <FadeIn direction="up" delay={0.2}>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
              <span className="text-gradient">{t("title")}</span>
            </h1>
          </FadeIn>

          <FadeIn direction="up" delay={0.3}>
            <p className="text-lg text-[rgb(var(--muted-foreground))] leading-relaxed max-w-xl mb-12">
              {t("subtitle")}
            </p>
          </FadeIn>

          {/* Download Card */}
          <FadeIn direction="up" delay={0.4}>
            <div className="bg-white shadow-xl border border-[rgb(var(--border))]">
              <div className="p-8 flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="w-16 h-16 shrink-0 bg-[rgb(var(--primary))] flex items-center justify-center">
                  <Image
                    src="/logo.png"
                    alt="A&A Logo"
                    width={40}
                    height={40}
                    className="h-8 w-auto brightness-0 invert"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-sm font-medium text-[rgb(var(--foreground))]/60 mb-1">
                    <FileArchive className="w-4 h-4" />
                    <span>{t("fileLabel")}</span>
                  </div>
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

                <Button
                  asChild
                  variant="default"
                  size="lg"
                  className="w-full sm:w-auto shrink-0"
                >
                  <a href={APK_PATH} download>
                    <Download className="w-5 h-5" />
                    {t("button")}
                  </a>
                </Button>
              </div>

              {/* APK notice */}
              <div className="flex items-start gap-3 px-8 py-5 border-t border-[rgb(var(--border))] bg-[rgb(var(--muted))]">
                <AlertTriangle className="w-5 h-5 text-[rgb(var(--primary))] shrink-0 mt-0.5" />
                <p className="text-sm text-[rgb(var(--muted-foreground))] leading-relaxed">
                  {t("fileNote")}
                </p>
              </div>
            </div>
          </FadeIn>

          {/* Install Instructions */}
          <FadeIn direction="up" delay={0.5}>
            <div className="mt-12">
              <h2 className="text-xl font-bold mb-6">
                {t("instructionsTitle")}
              </h2>
              <ol className="space-y-4">
                {steps.map((step, index) => (
                  <li key={index} className="flex items-start gap-4">
                    <span className="shrink-0 w-8 h-8 flex items-center justify-center bg-[rgb(var(--primary))] text-white text-sm font-semibold">
                      {index + 1}
                    </span>
                    <p className="text-[rgb(var(--muted-foreground))] leading-relaxed pt-1">
                      {step}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
