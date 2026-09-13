"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { ArrowUpRight, Globe2, Menu, X } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { TradeBrand } from "./trade-brand";

const items = ["discover", "app", "about", "contact"] as const;

export function Navigation({ locale }: { locale: string }) {
  const t = useTranslations("navigation");
  const ui = useTranslations("experience");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");
  const href = (section: string) =>
    pathname === "/" ? `#${section}` : `/#${section}`;

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 30);
    update();
    window.addEventListener("scroll", update, { passive: true });
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: "-15% 0px -60% 0px" },
    );
    document
      .querySelectorAll("main section[id]")
      .forEach((section) => observer.observe(section));
    return () => {
      window.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, [pathname]);

  return (
    <header className={`trade-header${scrolled ? " is-scrolled" : ""}`}>
      <div className="trade-container trade-nav-wrap">
        <Link href="/" className="trade-logo-link" aria-label={t("home")}>
          <TradeBrand />
        </Link>
        <nav className="trade-desktop-nav" aria-label={ui("mainNavigation")}>
          {items.map((item) => (
            <Link
              key={item}
              href={href(item)}
              className={active === item && pathname === "/" ? "is-active" : ""}
              aria-current={
                active === item && pathname === "/" ? "location" : undefined
              }
            >
              {t(item)}
            </Link>
          ))}
        </nav>
        <div className="trade-nav-actions">
          <Link href="/download" className="trade-nav-download">
            {t("downloadApp")}
            <ArrowUpRight size={16} />
          </Link>
          <Link
            href={pathname}
            locale={locale === "en" ? "so" : "en"}
            className="trade-language"
            aria-label={
              locale === "en" ? "Ku beddel Soomaali" : "Switch to English"
            }
          >
            <Globe2 size={15} />
            <span>{locale.toUpperCase()}</span>
          </Link>
          <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger
              className="trade-menu-button"
              aria-label={ui("openMenu")}
            >
              <Menu size={23} />
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="trade-menu-overlay" />
              <Dialog.Content
                className="trade-mobile-menu"
                aria-describedby={undefined}
              >
                <div className="trade-mobile-top">
                  <Dialog.Title className="sr-only">
                    {ui("mainNavigation")}
                  </Dialog.Title>
                  <TradeBrand />
                  <Dialog.Close
                    className="trade-menu-close"
                    aria-label={ui("close")}
                  >
                    <X />
                  </Dialog.Close>
                </div>
                <nav aria-label={ui("mainNavigation")}>
                  {(["home", ...items] as const).map((item, i) => (
                    <Link
                      key={item}
                      href={href(item)}
                      onClick={() => setOpen(false)}
                    >
                      <span>0{i + 1}</span>
                      {t(item)}
                      <ArrowUpRight />
                    </Link>
                  ))}
                </nav>
                <div className="trade-mobile-bottom">
                  <Link
                    href="/download"
                    className="trade-button trade-button-light"
                    onClick={() => setOpen(false)}
                  >
                    {t("downloadApp")}
                    <ArrowUpRight size={18} />
                  </Link>
                  <div>
                    <Link
                      href={pathname}
                      locale="en"
                      onClick={() => setOpen(false)}
                    >
                      English
                    </Link>
                    <Link
                      href={pathname}
                      locale="so"
                      onClick={() => setOpen(false)}
                    >
                      Soomaali
                    </Link>
                  </div>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>
    </header>
  );
}
export default Navigation;
