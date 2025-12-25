"use client";

import { memo, useState, useEffect } from "react";
import { Facebook, X, MessageCircle } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";

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
                    href="https://www.facebook.com/aatradesolutions"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between bg-white text-[rgb(var(--primary))] pl-4 pr-3 py-2 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 min-w-[160px]"
                    aria-label="Visit our Facebook page"
                  >
                    <span className="text-sm font-semibold">{t("facebook")}</span>
                    <div className="w-10 h-10 bg-[rgb(var(--primary))] text-white flex items-center justify-center">
                      <Facebook className="w-5 h-5" />
                    </div>
                  </motion.a>

                  {/* WhatsApp Button */}
                  <motion.a
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    transition={{ delay: 0.1 }}
                    href="https://api.whatsapp.com/send?phone=%2B252638571847"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between bg-white text-[#25D366] pl-4 pr-3 py-2 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 min-w-[160px]"
                    aria-label="Contact us on WhatsApp"
                  >
                    <span className="text-sm font-semibold">{t("whatsapp")}</span>
                    <div className="w-10 h-10 bg-[#25D366] text-white flex items-center justify-center">
                      <FaWhatsapp className="w-6 h-6" />
                    </div>
                  </motion.a>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Toggle Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleExpanded}
              className="relative w-16 h-16 bg-gradient-to-br from-[rgb(var(--primary-light))] to-[rgb(var(--primary))] text-white shadow-2xl hover:shadow-3xl transition-all flex items-center justify-center group"
              aria-label={isExpanded ? "Close menu" : "Open social menu"}
            >
              <AnimatePresence mode="wait">
                {isExpanded ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -180, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 180, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <X className="w-7 h-7" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="open"
                    initial={{ rotate: -180, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 180, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <MessageCircle className="w-7 h-7" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Pulse animation */}
              {!isExpanded && (
                <span className="absolute inset-0 animate-slow-pulse bg-[rgb(var(--primary))] opacity-20" />
              )}

              {/* Tooltip */}
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="absolute right-full mr-3 bg-black text-white text-xs font-medium px-3 py-1.5 whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {t("contactUs")}
              </motion.div>
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default memo(SocialFloatingButtons);
