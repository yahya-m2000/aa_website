import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Facebook, Twitter, Linkedin, Mail } from "lucide-react";
import Image from "next/image";

export function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("navigation");
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
              <li className="text-sm text-white/70">Procurement</li>
              <li className="text-sm text-white/70">Logistics</li>
              <li className="text-sm text-white/70">Warehousing</li>
              <li className="text-sm text-white/70">Customs Clearance</li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t("contact")}</h3>
            <div className="space-y-2">
              <a
                href="mailto:info@aagroup.com"
                className="flex items-center space-x-2 text-sm text-white/70 hover:text-white transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span>info@aagroup.com</span>
              </a>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3">{t("followUs")}</h4>
              <div className="flex space-x-3">
                <a
                  href="#"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href="#"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <a
                  href="#"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
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
