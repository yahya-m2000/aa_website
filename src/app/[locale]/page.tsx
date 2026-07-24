'use client';

import dynamic from 'next/dynamic';
import { HeroSection, SocialFloatingButtons } from '@/features/landing/components';

// Lazy load sections that are below the fold
const ReelSection = dynamic(() => import('@/features/landing/components').then(mod => ({ default: mod.ReelSection })), {
  loading: () => <div className="min-h-screen" />
});

const StatsSection = dynamic(() => import('@/features/landing/components').then(mod => ({ default: mod.StatsSection })), {
  loading: () => <div className="min-h-screen" />
});

const ServicesSection = dynamic(() => import('@/features/landing/components').then(mod => ({ default: mod.ServicesSection })), {
  loading: () => <div className="min-h-screen" />
});

const ProcessSection = dynamic(() => import('@/features/landing/components').then(mod => ({ default: mod.ProcessSection })), {
  loading: () => <div className="min-h-screen" />
});

const AboutSection = dynamic(() => import('@/features/landing/components').then(mod => ({ default: mod.AboutSection })), {
  loading: () => <div className="min-h-screen" />
});

const SocialSection = dynamic(() => import('@/features/landing/components').then(mod => ({ default: mod.SocialSection })), {
  loading: () => <div className="min-h-screen" />
});

const TestimonialsSection = dynamic(() => import('@/features/landing/components').then(mod => ({ default: mod.TestimonialsSection })), {
  loading: () => <div className="min-h-screen" />
});

const ContactSection = dynamic(() => import('@/features/landing/components').then(mod => ({ default: mod.ContactSection })), {
  loading: () => <div className="min-h-screen" />
});

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ReelSection />
      <StatsSection />
      <ServicesSection />
      <ProcessSection />
      <AboutSection />
      <SocialSection />
      <TestimonialsSection />
      <ContactSection />
      <SocialFloatingButtons />
    </>
  );
}
