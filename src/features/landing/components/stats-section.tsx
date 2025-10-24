'use client';

import { memo } from 'react';
import { useTranslations } from 'next-intl';
import { FadeIn, AnimatedCounter, StaggerContainer, StaggerItem } from '@/shared/components/ui';
import { stats } from '@/shared/data';

// Memoized stat card
const StatCard = memo(({ 
  value, 
  suffix, 
  label 
}: { 
  value: number; 
  suffix: string; 
  label: string;
}) => (
  <div className="text-center">
    <div className="mb-4">
      <div className="text-4xl md:text-5xl lg:text-6xl font-bold">
        <AnimatedCounter
          to={value}
          duration={2.5}
          suffix={suffix}
        />
      </div>
    </div>
    <div className="text-base md:text-lg text-white/90 font-medium">
      {label}
    </div>
  </div>
));
StatCard.displayName = 'StatCard';

function StatsSection() {
  const t = useTranslations('stats');

  return (
    <section id="stats" className="py-20 md:py-32 bg-black text-white relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }} />
      </div>

      <div className="container-custom relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <FadeIn direction="up">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              {t('title')}
            </h2>
            <p className="text-lg text-white/90">
              {t('subtitle')}
            </p>
          </FadeIn>
        </div>

        <StaggerContainer staggerDelay={0.15} className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat) => (
            <StaggerItem key={stat.key}>
              <StatCard
                value={stat.value}
                suffix={stat.suffix}
                label={t(`${stat.key}.label`)}
              />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}

export default memo(StatsSection);
export { StatsSection };
