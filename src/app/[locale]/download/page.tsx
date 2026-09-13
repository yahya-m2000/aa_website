"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import {
  ArrowLeft,
  ArrowUpRight,
  Search,
  ShoppingBag,
  PackageCheck,
  Sparkles,
  Heart,
  Check,
  MessageCircle,
  Download,
  ChevronDown,
} from "lucide-react";
import { AppPhone } from "@/features/landing/components/app-phone";
import { GooglePlayBadge } from "@/features/landing/components/google-play-badge";
import { TradeMotion } from "@/features/landing/components/trade-motion";
import { QrCode } from "@/shared/components/ui/qr-code";
import { socialLinks } from "@/shared/data/social-links";
import { appRelease } from "@/shared/data/app-release";

export default function DownloadPage() {
  const t = useTranslations("launch");
  const d = useTranslations("download");
  const shop = useTranslations("shop");
  return (
    <TradeMotion>
      <section className="launch-download-page">
        <div className="trade-container">
          <Link href="/" className="launch-back">
            <ArrowLeft size={14} />
            {d("backHome")}
          </Link>
          <div className="launch-download-grid">
            <div className="launch-download-copy" data-hero-reveal>
              <p className="launch-pill">
                <span />
                {t("downloadLabel")}
              </p>
              <h1>
                {t("download1")}
                <br />
                <span>{t("download2")}</span>
              </h1>
              <p className="launch-description">{t("downloadBody")}</p>
              <GooglePlayBadge />
              <p className="launch-platform">
                <Check size={14} />
                {shop("available")}
              </p>
              <div className="launch-download-scan">
                <QrCode value={appRelease.googlePlayUrl} size={76} />
                <div>
                  <strong>{t("downloadScan")}</strong>
                  <p>{t("downloadScanBody")}</p>
                </div>
              </div>
            </div>
            <div className="launch-download-stage" data-hero-reveal>
              <div className="launch-hero-blob" aria-hidden="true" />
              <span
                className="launch-spark launch-spark-one"
                aria-hidden="true"
              >
                ✳
              </span>
              <span
                className="launch-spark launch-spark-two"
                aria-hidden="true"
              >
                ✦
              </span>
              <div className="launch-download-phone">
                <div data-trade-parallax>
                  <AppPhone priority />
                </div>
              </div>
              <div className="launch-discovery-sticker">
                <span>
                  <Sparkles size={19} />
                </span>
                <div>
                  <strong>{t("goodFind")}</strong>
                  <small>{t("goodFindNote")}</small>
                </div>
                <Heart size={15} />
              </div>
              <div className="launch-android-tag">
                <span />
                {t("downloadFoot")}
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="launch-section">
        <div className="trade-container">
          <div className="launch-section-heading" data-trade-reveal>
            <p className="launch-eyebrow">{t("downloadHowLabel")}</p>
            <h2>{t("downloadHowTitle")}</h2>
            <p>{t("downloadHowBody")}</p>
          </div>
          <div className="launch-download-benefits">
            {[
              { key: "one", Icon: Search },
              { key: "two", Icon: ShoppingBag },
              { key: "three", Icon: PackageCheck },
            ].map(({ key, Icon }) => (
              <article key={key} data-trade-reveal>
                <Icon size={28} strokeWidth={1.4} />
                <h3>{t(`steps.${key}.title`)}</h3>
                <p>{t(`steps.${key}.body`)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section
        className="trade-container launch-download-help"
        data-trade-reveal
      >
        <span>
          <MessageCircle size={25} />
        </span>
        <div>
          <h2>{t("supportDownload")}</h2>
          <p>{t("supportDownloadBody")}</p>
        </div>
        <a
          href={socialLinks.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="launch-button"
        >
          {t("talkTeam")}
          <ArrowUpRight size={18} />
        </a>
      </section>
      <section className="launch-alternative">
        <div className="trade-container">
          <details>
            <summary>
              <span>
                <Download size={16} />
                {shop("alternative")}
              </span>
              <ChevronDown size={18} />
            </summary>
            <div>
              <p>{d("fileNote")}</p>
              <a href={appRelease.apkUrl} download>
                {shop("downloadApk")}
                <ArrowUpRight size={16} />
              </a>
              <ol>
                {["one", "two", "three", "four"].map((key) => (
                  <li key={key}>{d(`steps.${key}`)}</li>
                ))}
              </ol>
            </div>
          </details>
          <p className="launch-trademark">
            Google Play and the Google Play logo are trademarks of Google LLC.
          </p>
        </div>
      </section>
    </TradeMotion>
  );
}
