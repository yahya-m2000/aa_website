'use client';

import { memo, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowUpRight } from 'lucide-react';
import { gsap } from 'gsap';
import { StaggerContainer, StaggerItem, SplitHeading } from '@/shared/components/ui';
import { services } from '@/shared/data';
import { prefersReducedMotion } from '@/core/providers/smooth-scroll-provider';
import type { LucideIcon } from 'lucide-react';

const ServiceRow = ({
  icon: Icon,
  index,
  title,
  description,
}: {
  icon: LucideIcon;
  index: number;
  title: string;
  description: string;
}) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const row = rowRef.current;
    const line = lineRef.current;
    if (!row || !line || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        line,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: row,
            start: 'top 90%',
            end: 'top 55%',
            scrub: true,
          },
        }
      );
    }, rowRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={rowRef}
      className="group relative grid md:grid-cols-12 gap-4 md:gap-8 items-center py-8 md:py-10 px-4 md:px-6 -mx-4 md:-mx-6 transition-colors duration-300 hover:bg-[rgb(var(--muted))]"
    >
      {/* Scroll-scrubbed underline that draws left-to-right as the row enters view */}
      <div className="absolute top-0 left-4 right-4 md:left-6 md:right-6 h-px bg-[rgb(var(--border))]">
        <div
          ref={lineRef}
          className="h-full w-full bg-[rgb(var(--accent))] origin-left"
          style={{ transform: 'scaleX(0)' }}
        />
      </div>

      <span className="md:col-span-1 font-display text-sm font-bold text-[rgb(var(--stone))] tracking-widest transition-colors duration-300 group-hover:text-[rgb(var(--accent))]">
        {String(index + 1).padStart(2, '0')}
      </span>

      <div className="md:col-span-4 flex items-center gap-4">
        <div className="w-12 h-12 shrink-0 rounded-full bg-[rgb(var(--muted))] flex items-center justify-center transition-all duration-300 group-hover:bg-[rgb(var(--primary))] group-hover:scale-110">
          <Icon className="w-5 h-5 text-[rgb(var(--foreground))] transition-colors duration-300 group-hover:text-white" />
        </div>
        <h3 className="font-display text-2xl md:text-3xl font-bold tracking-tight transition-transform duration-300 group-hover:translate-x-1">
          {title}
        </h3>
      </div>

      <p className="md:col-span-6 text-[rgb(var(--muted-foreground))] leading-relaxed">
        {description}
      </p>

      <ArrowUpRight className="hidden md:block md:col-span-1 w-6 h-6 justify-self-end text-[rgb(var(--foreground))] opacity-0 -translate-x-2 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0" />
    </div>
  );
};

function ServicesSection() {
  const t = useTranslations('services');

  return (
    <section id="services" className="py-20 md:py-32">
      <div className="container-custom">
        <div className="max-w-2xl mb-12 md:mb-16">
          <SplitHeading
            as="h2"
            className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4"
          >
            {t('title')}
          </SplitHeading>
          <p className="text-lg text-[rgb(var(--muted-foreground))]">
            {t('subtitle')}
          </p>
        </div>

        <StaggerContainer staggerDelay={0.1} className="border-b border-[rgb(var(--border))]">
          {services.map((service, index) => (
            <StaggerItem key={service.key}>
              <ServiceRow
                icon={service.icon}
                index={index}
                title={t(`${service.key}.title`)}
                description={t(`${service.key}.description`)}
              />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}

export default memo(ServicesSection);
export { ServicesSection };
