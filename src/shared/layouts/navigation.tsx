"use client";

import { useState, useCallback, useEffect, useRef, memo } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { Menu, X, Globe, Smartphone } from "lucide-react";
import { cn } from "@/core/utils";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const navItems = [
  { key: "home", href: "#home" },
  { key: "services", href: "#services" },
  { key: "logistics", href: "#logistics" },
  { key: "about", href: "#about" },
  { key: "stats", href: "#stats" },
  { key: "contact", href: "#contact" },
] as const;

// Memoized desktop navigation item. On the homepage, hash links scroll
// directly. On any other route, they route to "/" + hash so section
// anchors still resolve instead of silently doing nothing.
const DesktopNavItem = memo(
  ({
    href,
    label,
    isHome,
  }: {
    href: string;
    label: string;
    isHome: boolean;
  }) => (
    <Link
      href={isHome ? href : `/${href}`}
      className="px-4 py-2 text-sm font-medium text-[rgb(var(--foreground))]/70 hover:text-[rgb(var(--primary))] hover:bg-[rgb(var(--muted))] transition-all duration-200"
    >
      {label}
    </Link>
  ),
);
DesktopNavItem.displayName = "DesktopNavItem";

// Memoized mobile navigation item with full-screen design
const MobileNavItem = memo(
  ({
    href,
    label,
    isHome,
    onClick,
  }: {
    href: string;
    label: string;
    isHome: boolean;
    onClick: () => void;
  }) => (
    <Link
      href={isHome ? href : `/${href}`}
      onClick={onClick}
      className="block text-2xl font-semibold text-[rgb(var(--foreground))] hover:text-[rgb(var(--primary))] transition-colors duration-300"
    >
      {label}
    </Link>
  ),
);
MobileNavItem.displayName = "MobileNavItem";

// Memoized language menu
const LanguageMenu = memo(
  ({
    locale,
    pathname,
    isOpen,
    onClose,
  }: {
    locale: string;
    pathname: string;
    isOpen: boolean;
    onClose: () => void;
  }) => (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute right-0 mt-2 w-32 rounded-(--radius) bg-white shadow-lg border border-[rgb(var(--border))] overflow-hidden"
        >
          <Link
            href={pathname}
            locale="en"
            className={cn(
              "block px-4 py-2 text-sm hover:bg-[rgb(var(--muted))] transition-colors",
              locale === "en" && "bg-[rgb(var(--muted))] font-semibold",
            )}
            onClick={onClose}
          >
            English
          </Link>
          <Link
            href={pathname}
            locale="so"
            className={cn(
              "block px-4 py-2 text-sm hover:bg-[rgb(var(--muted))] transition-colors",
              locale === "so" && "bg-[rgb(var(--muted))] font-semibold",
            )}
            onClick={onClose}
          >
            Somali
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  ),
);
LanguageMenu.displayName = "LanguageMenu";

function Navigation({ locale }: { locale: string }) {
  const t = useTranslations("navigation");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - lastScrollY.current) <= 5) return;
      setHidden(y > lastScrollY.current && y > 80);
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);
  const toggleMobileMenu = useCallback(
    () => setMobileMenuOpen((prev) => !prev),
    [],
  );
  const toggleLangMenu = useCallback(
    () => setLangMenuOpen((prev) => !prev),
    [],
  );
  const closeLangMenu = useCallback(() => setLangMenuOpen(false), []);

  return (
    <>
      {/* Navigation Bar */}
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl transition-transform duration-500 ease-in-out",
          hidden && !mobileMenuOpen && "-translate-y-full",
        )}
      >
        <div className="container-custom">
          {/* Compact layout (mobile + tablet) - hamburger left, logo
              centered, download always visible right. Covers up to `lg`
              (1024px), not just `md` (768px): the full desktop row below
              (6 nav links + logo + download button + language toggle)
              doesn't actually fit without wrapping until ~1024px -
              confirmed via real viewport screenshots, "Our Impact" wraps
              to two lines and collides with the download button anywhere
              from 768px to ~1020px.

              Uses a 3-column grid (not absolute positioning) so the logo
              is centered against the true row width rather than centered
              only relative to itself as the sole flex child - the prior
              flex+absolute version left the logo and download button
              bunched left-of-center with a large dead gap on the right,
              confirmed via real viewport screenshots at 400px/iPad widths. */}
          <div className="grid grid-cols-[auto_1fr_auto] lg:hidden items-center h-16">
            {/* Mobile Menu Button - Left */}
            <button
              onClick={toggleMobileMenu}
              className="justify-self-start p-2.5 text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))] transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>

            {/* Logo - Centered */}
            <Link
              href="/"
              className="justify-self-center flex items-center group transition-all duration-200"
            >
              <Image
                src="/logo.png"
                alt="A&A Logo"
                width={240}
                height={80}
                className="h-12 w-auto transition-all duration-200 brightness-0 group-hover:opacity-70"
                priority
              />
            </Link>

            {/* Download App - always visible, not tucked in the hamburger menu.
                Icon-only below 400px (label would collide with the logo at
                narrow widths, especially in Somali's longer "Soo Deji App-ka" —
                confirmed via real viewport screenshots at 360-375px), full
                label from 400px up where there's room. */}
            <Link
              href="/download"
              aria-label={t("downloadApp")}
              className="btn-sweep justify-self-end flex items-center gap-1.5 rounded-full p-2.5 text-xs font-semibold text-white min-[400px]:px-3 min-[400px]:py-2"
            >
              <Smartphone className="w-4 h-4 min-[400px]:w-3.5 min-[400px]:h-3.5" />
              <span className="hidden min-[400px]:inline">{t("downloadApp")}</span>
            </Link>
          </div>

          {/* Full Desktop Layout - only from `lg` (1024px) up, where the
              full nav-link row actually has room to fit on one line. */}
          <div className="hidden lg:flex items-center justify-between h-20">
            {/* Logo + Navigation, justified left */}
            <div className="flex items-center gap-10">
              <Link
                href="/"
                className="flex items-center group transition-all duration-200"
              >
                <Image
                  src="/logo.png"
                  alt="A&A Logo"
                  width={240}
                  height={80}
                  className="h-10 w-auto transition-all duration-200 brightness-0 group-hover:opacity-70"
                  priority
                />
              </Link>

              <div className="flex items-center space-x-1">
                {navItems.map((item) => (
                  <DesktopNavItem
                    key={item.key}
                    href={item.href}
                    label={t(item.key)}
                    isHome={isHome}
                  />
                ))}
              </div>
            </div>

            {/* Desktop Language Toggle */}
            <div className="flex items-center space-x-3">
              <Link
                href="/download"
                className="btn-sweep flex items-center space-x-2 rounded-full px-4 py-2 text-sm font-medium text-white transition-all duration-200"
              >
                <Smartphone className="w-4 h-4" />
                <span>{t("downloadApp")}</span>
              </Link>
              <div className="relative">
                <button
                  onClick={toggleLangMenu}
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-[rgb(var(--foreground))]/70 hover:text-[rgb(var(--primary))] hover:bg-[rgb(var(--muted))] transition-all duration-200"
                >
                  <Globe className="w-4 h-4" />
                  <span className="uppercase">{locale}</span>
                </button>
                <LanguageMenu
                  locale={locale}
                  pathname={pathname}
                  isOpen={langMenuOpen}
                  onClose={closeLangMenu}
                />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu - Full Screen Overlay (outside nav) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed top-16 left-0 right-0 bottom-0 z-40 lg:hidden bg-white/95 backdrop-blur-xl overflow-y-auto"
          >
            <div className="min-h-full flex flex-col justify-center px-8 py-12">
              {/* Navigation Links */}
              <nav className="space-y-8 mb-12">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                  >
                    <MobileNavItem
                      href={item.href}
                      label={t(item.key)}
                      isHome={isHome}
                      onClick={closeMobileMenu}
                    />
                  </motion.div>
                ))}
              </nav>

              {/* Download App - Mobile */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: navItems.length * 0.05, duration: 0.3 }}
                className="mb-12"
              >
                <Link
                  href="/download"
                  onClick={closeMobileMenu}
                  className="btn-sweep inline-flex items-center gap-2 rounded-full px-5 py-3 text-base font-semibold text-white"
                >
                  <Smartphone className="w-5 h-5" />
                  {t("downloadApp")}
                </Link>
              </motion.div>

              {/* Language Selector - Minimal */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-4 pt-8 border-t border-[rgb(var(--border))]"
              >
                <Link
                  href={pathname}
                  locale="en"
                  className={cn(
                    "text-lg font-medium transition-colors duration-300",
                    locale === "en"
                      ? "text-[rgb(var(--primary))]"
                      : "text-[rgb(var(--foreground))]/50 hover:text-[rgb(var(--foreground))]",
                  )}
                  onClick={closeMobileMenu}
                >
                  EN
                </Link>
                <span className="text-[rgb(var(--foreground))]/30">/</span>
                <Link
                  href={pathname}
                  locale="so"
                  className={cn(
                    "text-lg font-medium transition-colors duration-300",
                    locale === "so"
                      ? "text-[rgb(var(--primary))]"
                      : "text-[rgb(var(--foreground))]/50 hover:text-[rgb(var(--foreground))]",
                  )}
                  onClick={closeMobileMenu}
                >
                  SO
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default memo(Navigation);
export { Navigation };
