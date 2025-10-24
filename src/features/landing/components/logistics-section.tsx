"use client";
import { memo } from "react";

import { useTranslations } from "next-intl";
import { FadeIn, StaggerContainer, StaggerItem } from "@/shared/components/ui";
import { MapPin, Ship, FileCheck, Truck, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  { key: "sourcing", icon: MapPin, color: "from-blue-500 to-blue-600" },
  {
    key: "shipping",
    icon: Ship,
    color: "from-[rgb(var(--primary))] to-teal-600",
  },
  {
    key: "customs",
    icon: FileCheck,
    color: "from-[rgb(var(--accent))] to-orange-600",
  },
  { key: "delivery", icon: Truck, color: "from-green-500 to-green-600" },
];

export function LogisticsSection() {
  const t = useTranslations("logistics");

  return (
    <section
      id="logistics"
      className="py-20 md:py-32 bg-gradient-to-b from-slate-50 to-white"
    >
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <FadeIn direction="up">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              {t("title")}
            </h2>
            <p className="text-lg text-[rgb(var(--muted-foreground))]">
              {t("subtitle")}
            </p>
          </FadeIn>
        </div>

        {/* Mobile: Vertical Flow */}
        <div className="md:hidden">
          <StaggerContainer staggerDelay={0.2} className="space-y-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <StaggerItem key={step.key}>
                  <div className="relative">
                    <div className="flex items-start space-x-4">
                      <div
                        className={`w-14 h-14 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center flex-shrink-0 shadow-lg`}
                      >
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1 pt-1">
                        <h3 className="text-xl font-bold mb-2">
                          {t(`steps.${step.key}.title`)}
                        </h3>
                        <p className="text-[rgb(var(--muted-foreground))]">
                          {t(`steps.${step.key}.description`)}
                        </p>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className="ml-7 mt-4 mb-2">
                        <ArrowRight className="w-5 h-5 text-[rgb(var(--muted-foreground))] rotate-90" />
                      </div>
                    )}
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>

        {/* Desktop: Horizontal Flow */}
        <div className="hidden md:block">
          <div className="relative">
            {/* Connection Line */}
            <motion.div
              className="absolute top-14 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-[rgb(var(--primary))] via-[rgb(var(--accent))] to-green-500"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              style={{ transformOrigin: "left" }}
            />

            <StaggerContainer
              staggerDelay={0.2}
              className="grid grid-cols-4 gap-8 relative"
            >
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <StaggerItem key={step.key}>
                    <div className="relative flex flex-col items-center text-center">
                      {/* Icon Circle */}
                      <motion.div
                        className={`w-28 h-28 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center shadow-2xl relative z-10 border-4 border-white`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Icon className="w-12 h-12 text-white" />
                      </motion.div>

                      {/* Content */}
                      <div className="mt-6 space-y-2">
                        <h3 className="text-xl font-bold">
                          {t(`steps.${step.key}.title`)}
                        </h3>
                        <p className="text-sm text-[rgb(var(--muted-foreground))]">
                          {t(`steps.${step.key}.description`)}
                        </p>
                      </div>

                      {/* Arrow */}
                      {index < steps.length - 1 && (
                        <motion.div
                          className="absolute top-14 -right-4 z-20"
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{
                            delay: 0.3 * (index + 1),
                            duration: 0.5,
                          }}
                        >
                          <ArrowRight className="w-6 h-6 text-white drop-shadow-lg" />
                        </motion.div>
                      )}
                    </div>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
export default memo(LogisticsSection);
