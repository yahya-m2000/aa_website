'use client';

import dynamic from 'next/dynamic';
import { HeroSection } from '@/features/landing/components';

// Lazy load sections that are below the fold
const ServicesSection = dynamic(() => import('@/features/landing/components').then(mod => ({ default: mod.ServicesSection })), {
  loading: () => <div className="min-h-screen" />
});

const AboutSection = dynamic(() => import('@/features/landing/components').then(mod => ({ default: mod.AboutSection })), {
  loading: () => <div className="min-h-screen" />
});

const LogisticsSection = dynamic(() => import('@/features/landing/components').then(mod => ({ default: mod.LogisticsSection })), {
  loading: () => <div className="min-h-screen" />
});

const StatsSection = dynamic(() => import('@/features/landing/components').then(mod => ({ default: mod.StatsSection })), {
  loading: () => <div className="min-h-screen" />
});

const ContactSection = dynamic(() => import('@/features/landing/components').then(mod => ({ default: mod.ContactSection })), {
  loading: () => <div className="min-h-screen" />
});

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <AboutSection />
      <LogisticsSection />
      <StatsSection />
      <ContactSection />
    </>
  );
}
