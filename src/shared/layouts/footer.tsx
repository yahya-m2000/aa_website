import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ArrowUpRight, ArrowUp, Facebook, MessageCircle } from "lucide-react";
import { socialLinks } from "@/shared/data/social-links";
import { TradeBrand } from "./trade-brand";

export function Footer() {
  const t = useTranslations("footer");
  const nav = useTranslations("navigation");
  const ui = useTranslations("experience");
  return (
    <footer className="launch-footer">
      <div className="trade-container">
        <div className="launch-footer-top">
          <div className="launch-footer-brand">
            <Link href="/" aria-label={nav("home")}>
              <TradeBrand />
            </Link>
            <p>{t("tagline")}</p>
          </div>
          <nav aria-label={t("quickLinks")}>
            {["discover", "app", "about", "contact"].map((item) => (
              <Link key={item} href={`/#${item}`}>
                {nav(item)}
              </Link>
            ))}
            <Link href="/download">
              {nav("downloadApp")}
              <ArrowUpRight size={14} />
            </Link>
          </nav>
        </div>
        <div className="launch-footer-contact">
          <a href={`mailto:${socialLinks.email}`}>
            {socialLinks.email}
            <ArrowUpRight size={14} />
          </a>
          <span>Shacab Mall, Hargeisa, Somaliland</span>
          <div className="launch-footer-socials">
            <a
              href={socialLinks.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle size={15} />
              WhatsApp
            </a>
            <a
              href={socialLinks.facebook}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Facebook size={15} />
              Facebook
            </a>
          </div>
        </div>
        <div className="launch-footer-bottom">
          <span>
            © {new Date().getFullYear()} A&A Trade Solutions. {t("rights")}.
          </span>
          <a href="#main-content">
            {ui("backTop")}
            <ArrowUp size={15} />
          </a>
        </div>
      </div>
    </footer>
  );
}
