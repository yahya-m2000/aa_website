"use client";

import { useState, useCallback, memo } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { Menu, X, Globe, Facebook } from "lucide-react";
import { Button } from "@/shared/components/ui";
import { cn } from "@/core/utils";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const navItems = [
  { key: "home", href: "#home" },
  { key: "services", href: "#services" },
  { key: "about", href: "#about" },
  { key: "contact", href: "#contact" },
] as const;

// Memoized desktop navigation item
const DesktopNavItem = memo(
  ({ href, label }: { href: string; label: string }) => (
    <a
      href={href}
      className="px-4 py-2 text-sm font-medium text-[rgb(var(--foreground))]/70 hover:text-[rgb(var(--primary))] hover:bg-[rgb(var(--muted))] transition-all duration-200"
    >
      {label}
    </a>
  )
);
DesktopNavItem.displayName = "DesktopNavItem";

// Memoized mobile navigation item with full-screen design
const MobileNavItem = memo(
  ({
    href,
    label,
    onClick,
  }: {
    href: string;
    label: string;
    onClick: () => void;
  }) => (
    <a
      href={href}
      onClick={onClick}
      className="block text-2xl font-semibold text-[rgb(var(--foreground))] hover:text-[rgb(var(--primary))] transition-colors duration-300"
    >
      {label}
    </a>
  )
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
          className="absolute right-0 mt-2 w-32 bg-white shadow-lg border border-[rgb(var(--border))] overflow-hidden"
        >
          <Link
            href={pathname}
            locale="en"
            className={cn(
              "block px-4 py-2 text-sm hover:bg-[rgb(var(--muted))] transition-colors",
              locale === "en" && "bg-[rgb(var(--muted))] font-semibold"
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
              locale === "so" && "bg-[rgb(var(--muted))] font-semibold"
            )}
            onClick={onClose}
          >
            Somali
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  )
);
LanguageMenu.displayName = "LanguageMenu";

function Navigation({ locale }: { locale: string }) {
  const t = useTranslations("navigation");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const pathname = usePathname();

  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);
  const toggleMobileMenu = useCallback(
    () => setMobileMenuOpen((prev) => !prev),
    []
  );
  const toggleLangMenu = useCallback(
    () => setLangMenuOpen((prev) => !prev),
    []
  );
  const closeLangMenu = useCallback(() => setLangMenuOpen(false), []);

  return (
    <>
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-[rgb(var(--border))]">
        <div className="container-custom">
          {/* Mobile Layout - Centered logo with hamburger on left */}
          <div className="flex md:hidden relative items-center justify-center h-16">
            {/* Mobile Menu Button - Left */}
            <button
              onClick={toggleMobileMenu}
              className="absolute left-0 p-2.5 text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))] transition-colors"
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
              className="flex items-center group transition-all duration-200"
            >
              <Image
                src="/logo.png"
                alt="A&A Logo"
                width={240}
                height={80}
                className="h-12 w-auto transition-all duration-200 brightness-0 group-hover:[filter:brightness(0)_saturate(100%)_invert(16%)_sepia(98%)_saturate(2537%)_hue-rotate(260deg)_brightness(91%)_contrast(96%)]"
                priority
              />
            </Link>
          </div>

          {/* Desktop Layout - Normal flex layout */}
          <div className="hidden md:flex items-center justify-between h-20">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center group transition-all duration-200"
            >
              <Image
                src="/logo.png"
                alt="A&A Logo"
                width={240}
                height={80}
                className="h-10 w-auto transition-all duration-200 brightness-0 group-hover:[filter:brightness(0)_saturate(100%)_invert(16%)_sepia(98%)_saturate(2537%)_hue-rotate(260deg)_brightness(91%)_contrast(96%)]"
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="flex items-center space-x-1">
              {navItems.map((item) => (
                <DesktopNavItem
                  key={item.key}
                  href={item.href}
                  label={t(item.key)}
                />
              ))}
            </div>

            {/* Desktop Language Toggle */}
            <div className="flex items-center space-x-3">
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
            className="fixed top-16 left-0 right-0 bottom-0 z-40 md:hidden bg-white/95 backdrop-blur-xl overflow-y-auto"
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
                      onClick={closeMobileMenu}
                    />
                  </motion.div>
                ))}
              </nav>

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
                      : "text-[rgb(var(--foreground))]/50 hover:text-[rgb(var(--foreground))]"
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
                      : "text-[rgb(var(--foreground))]/50 hover:text-[rgb(var(--foreground))]"
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
