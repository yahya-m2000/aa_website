"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import {
  ArrowDownRight,
  ArrowUpRight,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Search,
  Heart,
  MessageCircle,
  PackageCheck,
  Globe2,
  Check,
  Play,
  ChevronDown,
  Mail,
  MapPin,
} from "lucide-react";
import { AppPhone } from "./app-phone";
import { AppDownloadArt } from "./app-download-art";
import { GooglePlayBadge } from "./google-play-badge";
import { AppDiscovery } from "./app-discovery";
import { TradeMotion } from "./trade-motion";
import { TradeVideo } from "./trade-video";
import { ContactForm } from "./contact-form";
import { socialLinks } from "@/shared/data/social-links";

export function TradeHome() {
  const t = useTranslations("launch");
  const e = useTranslations("experience");
  const stats = useTranslations("stats");
  const quotes = useTranslations("testimonials");
  return (
    <TradeMotion>
      <section id="home" className="launch-hero">
        <div className="trade-container launch-hero-grid">
          <div className="launch-hero-copy">
            <p className="launch-pill" data-hero-reveal>
              <span />
              {t("hello")}
            </p>
            <h1 data-hero-reveal>
              {t("hero1")}
              <br />
              <span>{t("hero2")}</span>
            </h1>
            <p className="launch-hero-subtitle" data-hero-reveal>
              {t("hero3")}
            </p>
            <p className="launch-description" data-hero-reveal>
              {t("heroBody")}
            </p>
            <div className="launch-hero-actions" data-hero-reveal>
              <GooglePlayBadge />
              <a href="#app">
                {t("meetApp")}
                <ArrowDownRight size={19} />
              </a>
            </div>
            <p className="launch-platform" data-hero-reveal>
              <Check size={14} />
              {t("androidNote")}
            </p>
          </div>
          <div className="launch-hero-art" data-hero-reveal>
            <div className="launch-hero-blob" aria-hidden="true" />
            <div className="launch-hero-ring" aria-hidden="true" />
            <span className="launch-spark launch-spark-one" aria-hidden="true">
              ✳
            </span>
            <span className="launch-spark launch-spark-two" aria-hidden="true">
              ✦
            </span>
            <div className="launch-hero-phone-tilt">
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
            <div className="launch-shopping-bag" aria-hidden="true">
              <i />
              <span>
                A&A<small>SHOP</small>
              </span>
              <Sparkles size={24} />
            </div>
            <div className="launch-android-tag">
              <span />
              {t("appTag")}
            </div>
          </div>
        </div>
        <div className="trade-container launch-hero-foot">
          <span>{t("builtFor")}</span>
          <a href="#discover">
            {t("keepExploring")}
            <ArrowDownRight size={16} />
          </a>
        </div>
      </section>

      <div className="launch-ribbon">
        <div className="trade-container">
          {[
            { text: "ribbon1", Icon: Search },
            { text: "ribbon2", Icon: Heart },
            { text: "ribbon3", Icon: ShoppingBag },
            { text: "ribbon4", Icon: Globe2 },
          ].map(({ text, Icon }) => (
            <span key={text}>
              <Icon size={19} strokeWidth={1.7} />
              {t(text)}
            </span>
          ))}
        </div>
      </div>

      <section id="discover" className="launch-section launch-discover">
        <div className="trade-container">
          <div className="launch-section-heading" data-trade-reveal>
            <p className="launch-eyebrow">{t("discoveryLabel")}</p>
            <h2>
              {t("discovery1")}
              <br />
              <span>{t("discovery2")}</span>
            </h2>
            <p>{t("discoveryBody")}</p>
          </div>
          <AppDiscovery />
        </div>
      </section>

      <section id="app" className="launch-section launch-features">
        <div className="trade-container">
          <div className="launch-section-heading" data-trade-reveal>
            <p className="launch-eyebrow">{t("featuresLabel")}</p>
            <h2>
              {t("features1")}
              <span> {t("features2")}</span>
            </h2>
          </div>
          <div className="launch-bento">
            <article className="launch-feature-search" data-trade-reveal>
              <div className="launch-feature-copy">
                <span className="launch-feature-number">01</span>
                <h3>{t("searchTitle")}</h3>
                <p>{t("searchBody")}</p>
              </div>
              <div className="launch-search-art" aria-hidden="true">
                <div className="launch-search-box">
                  <Search size={21} />
                  <span>{t("searchPlaceholder")}</span>
                  <i>
                    <ArrowRight size={18} />
                  </i>
                </div>
                <div className="launch-search-chips">
                  <span>✦ {t("chip1")}</span>
                  <span>↗ {t("chip2")}</span>
                  <span>♡ {t("chip3")}</span>
                </div>
                <div className="launch-search-decoration">
                  <Search strokeWidth={1} />
                </div>
              </div>
            </article>
            <article className="launch-feature-basket" data-trade-reveal>
              <div className="launch-feature-copy">
                <span className="launch-feature-number">02</span>
                <h3>{t("basketTitle")}</h3>
                <p>{t("basketBody")}</p>
              </div>
              <div className="launch-basket-art" aria-hidden="true">
                <ShoppingBag strokeWidth={1} />
                <span>
                  <Heart size={26} fill="currentColor" />
                </span>
                <i>+1</i>
              </div>
            </article>
            <a
              className="launch-feature-support"
              href={socialLinks.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              data-trade-reveal
            >
              <div>
                <span className="launch-feature-number">03</span>
                <h3>{t("supportTitle")}</h3>
                <p>{t("supportBody")}</p>
              </div>
              <span className="launch-support-orbit">
                <MessageCircle size={32} />
              </span>
              <ArrowUpRight className="launch-support-arrow" size={24} />
            </a>
          </div>
        </div>
      </section>

      <section id="logistics" className="launch-section launch-journey">
        <div className="trade-container launch-journey-grid">
          <div data-trade-reveal>
            <p className="launch-eyebrow">{t("journeyLabel")}</p>
            <h2>
              {t("journey1")}
              <br />
              <span>{t("journey2")}</span>
            </h2>
            <p className="launch-description">{t("journeyBody")}</p>
            <Link href="/download" className="launch-button">
              {t("getApp")}
              <ArrowUpRight size={19} />
            </Link>
          </div>
          <ol className="launch-steps">
            {[
              { key: "one", Icon: Search },
              { key: "two", Icon: ShoppingBag },
              { key: "three", Icon: PackageCheck },
            ].map(({ key, Icon }, index) => (
              <li key={key} data-trade-reveal>
                <span className="launch-step-icon">
                  <Icon size={24} />
                </span>
                <div>
                  <small>0{index + 1}</small>
                  <h3>{t(`steps.${key}.title`)}</h3>
                  <p>{t(`steps.${key}.body`)}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="about" className="launch-section launch-about">
        <div className="trade-container launch-about-grid">
          <div className="launch-about-photo" data-trade-reveal>
            <Image
              src="/aa_promotion_material/1-team-warehouse.jpeg"
              alt={e("teamAlt")}
              fill
              sizes="(min-width:900px) 45vw, 90vw"
            />
            <span>
              <PackageCheck size={17} />
              {t("photoLabel")}
            </span>
          </div>
          <div data-trade-reveal>
            <p className="launch-eyebrow">{t("aboutLabel")}</p>
            <h2>
              {t("about1")}
              <br />
              <span>{t("about2")}</span>
            </h2>
            <p className="launch-description">{t("aboutBody")}</p>
            <TradeVideo className="launch-story-link">
              <span>
                <Play size={13} fill="currentColor" />
              </span>
              {e("watchStory")}
              <ArrowUpRight size={17} />
            </TradeVideo>
            <div className="launch-proof">
              {["shipments", "countries", "satisfaction"].map((key) => (
                <div key={key}>
                  <strong>
                    {stats(`${key}.value`)}
                    <span>{key === "satisfaction" ? "%" : "+"}</span>
                  </strong>
                  <small>{stats(`${key}.label`)}</small>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="launch-business">
        <div className="trade-container">
          <span className="launch-business-icon">
            <Globe2 size={28} />
          </span>
          <div>
            <h2>{t("businessTitle")}</h2>
            <p>{t("businessBody")}</p>
          </div>
          <a href="#contact">
            {t("talkTeam")}
            <ArrowUpRight size={18} />
          </a>
        </div>
      </section>

      <section id="testimonials" className="launch-section launch-quote">
        <div className="trade-container" data-trade-reveal>
          <span className="launch-quote-symbol" aria-hidden="true">
            “
          </span>
          <p className="launch-eyebrow">{t("quoteLabel")}</p>
          <blockquote>{quotes("items.sample1.quote")}</blockquote>
          <div className="launch-quote-author">
            <span>MX</span>
            <div>
              <strong>{quotes("items.sample1.name")}</strong>
              <p>{quotes("items.sample1.role")}</p>
            </div>
          </div>
          <TradeVideo kind="promo" className="launch-story-link">
            {e("watchClient")}
            <Play size={12} fill="currentColor" />
          </TradeVideo>
        </div>
      </section>

      <section id="faq" className="launch-section launch-faq">
        <div className="trade-container launch-faq-grid">
          <div data-trade-reveal>
            <p className="launch-eyebrow">{t("faqLabel")}</p>
            <h2>{t("faqTitle")}</h2>
            <p className="launch-description">{t("faqBody")}</p>
          </div>
          <div data-trade-reveal>
            {["1", "2", "3", "4"].map((key) => (
              <details key={key} name="launch-faq">
                <summary>
                  {t(`faq${key}.question`)}
                  <ChevronDown size={20} />
                </summary>
                <p>{t(`faq${key}.answer`)}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section
        className="launch-download-cta"
        aria-labelledby="download-heading"
      >
        <div className="trade-container">
          <div className="launch-cta-copy" data-trade-reveal>
            <p className="launch-eyebrow">
              <span className="launch-live-dot" />
              {t("ctaLabel")}
            </p>
            <h2 id="download-heading">
              {t("cta1")}
              <br />
              <span>{t("cta2")}</span>
            </h2>
            <p>{t("ctaBody")}</p>
            <div className="launch-cta-actions">
              <GooglePlayBadge />
              <Link href="/download">
                {t("meetApp")}
                <ArrowUpRight size={18} />
              </Link>
            </div>
          </div>
          <div data-trade-reveal>
            <AppDownloadArt />
          </div>
        </div>
      </section>

      <section
        id="contact"
        className="launch-section trade-contact launch-contact"
      >
        <div className="trade-container trade-contact-grid">
          <div data-trade-reveal>
            <p className="launch-eyebrow">{t("contactLabel")}</p>
            <h2>
              {t("contact1")}
              <br />
              <span>{t("contact2")}</span>
            </h2>
            <p className="launch-description">{t("contactBody")}</p>
            <a
              className="launch-story-link"
              href={socialLinks.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle size={20} />
              {e("chatWhatsApp")}
              <ArrowUpRight size={17} />
            </a>
            <div className="trade-contact-details">
              <a href={`mailto:${socialLinks.email}`}>
                <Mail size={16} />
                {socialLinks.email}
              </a>
              <span>
                <MapPin size={16} />
                Shacab Mall, Hargeisa, Somaliland
              </span>
            </div>
          </div>
          <div className="trade-form-wrap" data-trade-reveal>
            <h3>{e("formTitle")}</h3>
            <p>{e("formIntro")}</p>
            <ContactForm />
          </div>
        </div>
      </section>
    </TradeMotion>
  );
}
