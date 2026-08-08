"use client";

import { memo, useState, useEffect } from "react";
import { Facebook, X, MessageCircle } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { socialLinks } from "@/shared/data";

export function SocialFloatingButtons() {
  const t = useTranslations("social");
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show buttons after scrolling 300px
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleExpanded = () => setIsExpanded(!isExpanded);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed right-6 bottom-6 z-50"
        >
          <div className="flex flex-col items-end space-y-3">
            {/* Expanded Menu */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex flex-col space-y-2 mb-2"
                >
                  {/* Facebook Button */}
                  <motion.a
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    transition={{ delay: 0.05 }}
                    href={socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-full bg-white text-[rgb(var(--foreground))] border border-[rgb(var(--border))] pl-4 pr-1.5 py-1.5 shadow-md hover:shadow-lg transition-shadow min-w-40"
                    aria-label="Visit our Facebook page"
                  >
                    <span className="text-sm font-semibold">{t("facebook")}</span>
                    <div className="w-9 h-9 rounded-full bg-[rgb(var(--accent))] text-[rgb(var(--accent-foreground))] flex items-center justify-center">
                      <Facebook className="w-4 h-4" />
                    </div>
                  </motion.a>

                  {/* WhatsApp Button */}
                  <motion.a
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    transition={{ delay: 0.1 }}
                    href={socialLinks.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-full bg-white text-[rgb(var(--foreground))] border border-[rgb(var(--border))] pl-4 pr-1.5 py-1.5 shadow-md hover:shadow-lg transition-shadow min-w-40"
                    aria-label="Contact us on WhatsApp"
                  >
                    <span className="text-sm font-semibold">{t("whatsapp")}</span>
                    <div className="w-9 h-9 rounded-full bg-[#25D366] text-white flex items-center justify-center">
                      <FaWhatsapp className="w-5 h-5" />
                    </div>
                  </motion.a>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Toggle Button */}
            <div className="group relative">
              {/* Pulse ring - only while collapsed, scales outward and fades */}
              {!isExpanded && (
                <span className="absolute inset-0 rounded-full bg-[rgb(var(--accent))] animate-pulse-ring pointer-events-none" />
              )}

              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleExpanded}
                className="relative w-16 h-16 rounded-full bg-[rgb(var(--accent))] text-[rgb(var(--accent-foreground))] shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center"
                aria-label={isExpanded ? "Close menu" : "Open social menu"}
              >
                {isExpanded ? (
                  <X className="w-7 h-7" />
                ) : (
                  <MessageCircle className="w-7 h-7" />
                )}
              </motion.button>

              {/* Tooltip */}
              <span className="absolute right-full top-1/2 -translate-y-1/2 mr-3 rounded-full bg-[rgb(var(--primary))] text-white text-xs font-medium px-3 py-1.5 whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {t("contactUs")}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default memo(SocialFloatingButtons);
