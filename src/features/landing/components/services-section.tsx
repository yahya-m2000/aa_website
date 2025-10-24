'use client';

import { memo } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui';
import { FadeIn, StaggerContainer, StaggerItem } from '@/shared/components/ui';
import { services } from '@/shared/data';
import type { LucideIcon } from 'lucide-react';

// Memoized service card component
const ServiceCard = memo(({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: LucideIcon; 
  title: string; 
  description: string;
}) => (
  <Card className="group h-full hover:shadow-2xl hover:scale-105 transition-all duration-300 hover:border-[rgb(var(--primary))] cursor-pointer">
    <CardHeader className="space-y-4">
      <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-7 h-7 text-[rgb(var(--primary))] group-hover:text-[rgb(var(--primary-hover))] transition-colors" />
      </div>
      <div>
        <CardTitle className="text-xl mb-2">
          {title}
        </CardTitle>
        <CardDescription className="text-base leading-relaxed">
          {description}
        </CardDescription>
      </div>
    </CardHeader>
  </Card>
));
ServiceCard.displayName = 'ServiceCard';

function ServicesSection() {
  const t = useTranslations('services');

  return (
    <section id="services" className="py-20 md:py-32 bg-white">
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <FadeIn direction="up">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              {t('title')}
            </h2>
            <p className="text-lg text-[rgb(var(--muted-foreground))]">
              {t('subtitle')}
            </p>
          </FadeIn>
        </div>

        <StaggerContainer staggerDelay={0.15} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {services.map((service) => (
            <StaggerItem key={service.key}>
              <ServiceCard
                icon={service.icon}
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
