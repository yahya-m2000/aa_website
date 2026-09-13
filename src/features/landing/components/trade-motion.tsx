'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function TradeMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const context = gsap.context(() => {
        gsap.from('[data-hero-reveal]', { y: 28, opacity: 0, duration: 1, stagger: .13, ease: 'power3.out', clearProps: 'all' });
        if (root.current?.querySelector('[data-hero-parallax]')) {
          gsap.to('[data-hero-parallax]', { yPercent: 16, ease: 'none', scrollTrigger: { trigger: '.trade-hero', start: 'top top', end: 'bottom top', scrub: true } });
        }
        gsap.utils.toArray<HTMLElement>('[data-trade-reveal]').forEach((element) => {
          gsap.from(element, { y: 35, opacity: 0, duration: .9, ease: 'power2.out', clearProps: 'all', scrollTrigger: { trigger: element, start: 'top 94%', once: true } });
        });
        gsap.utils.toArray<HTMLElement>('[data-trade-parallax]').forEach((element) => {
          gsap.fromTo(element, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: element.parentElement, start: 'top bottom', end: 'bottom top', scrub: 1 } });
        });
      }, root);
      return () => context.revert();
    });
    // The server-rendered layout has reserved image dimensions; refresh after fonts settle.
    let mounted = true;
    document.fonts.ready.then(() => { if (mounted) ScrollTrigger.refresh(); });
    return () => { mounted = false; media.revert(); };
  }, []);
  return <div ref={root}>{children}</div>;
}
