import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Facebook, Mail } from "lucide-react";
import Image from "next/image";
import { FaWhatsapp } from "react-icons/fa";

export function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("navigation");
  const tServices = useTranslations("services");
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[rgb(var(--secondary))] text-white">
      <div className="container-custom py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="A&A Logo"
                width={120}
                height={40}
                className="h-10 w-auto brightness-0 invert"
              />
            </Link>
            <p className="text-sm text-white/70">{t("tagline")}</p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t("quickLinks")}</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#home"
                  className="text-sm text-white/70 hover:text-white transition-colors"
                >
                  {tNav("home")}
                </a>
              </li>
              <li>
                <a
                  href="#services"
                  className="text-sm text-white/70 hover:text-white transition-colors"
                >
                  {tNav("services")}
                </a>
              </li>
              <li>
                <a
                  href="#about"
                  className="text-sm text-white/70 hover:text-white transition-colors"
                >
                  {tNav("about")}
                </a>
              </li>
              <li>
                <a
                  href="#stats"
                  className="text-sm text-white/70 hover:text-white transition-colors"
                >
                  {tNav("stats")}
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className="text-sm text-white/70 hover:text-white transition-colors"
                >
                  {tNav("contact")}
                </a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t("services")}</h3>
            <ul className="space-y-2">
              <li className="text-sm text-white/70">{tServices("sourcing.title")}</li>
              <li className="text-sm text-white/70">{tServices("quality.title")}</li>
              <li className="text-sm text-white/70">{tServices("purchasing.title")}</li>
              <li className="text-sm text-white/70">{tServices("negotiation.title")}</li>
            </ul>
          </div>

          {/* Contact & Social - Emphasized */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t("contact")}</h3>
            <div className="space-y-3">
              <a
                href="mailto:admin@aatradesolutions.com"
                className="flex items-center space-x-2 text-sm text-white/70 hover:text-white transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span>admin@aatradesolutions.com</span>
              </a>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3">{t("followUs")}</h4>
              <div className="space-y-2">
                <a
                  href="https://www.facebook.com/aatradesolutions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-sm text-white/70 hover:text-white transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                  <span>Facebook</span>
                </a>
                <a
                  href="https://api.whatsapp.com/send?phone=%2B252638571847"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-sm text-white/70 hover:text-white transition-colors"
                  aria-label="WhatsApp"
                >
                  <FaWhatsapp className="w-4 h-4" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10 text-center">
          <p className="text-sm text-white/60">
            © {currentYear} A&A. {t("rights")}.
          </p>
        </div>
      </div>
    </footer>
  );
}
