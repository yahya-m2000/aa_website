"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/core/utils";

gsap.registerPlugin(ScrollTrigger);

export interface ParallaxProps {
  children: React.ReactNode;
  /** Vertical travel distance in px as the element crosses the viewport. Positive = moves down slower than scroll (content lags behind), negative = moves up faster. */
  speed?: number;
  /** className applied to the outer, non-animated trigger wrapper (e.g. sizing/positioning). */
  className?: string;
  /** className applied to the inner element that actually moves. */
  innerClassName?: string;
}

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Scroll-scrubbed vertical parallax - the inner element lags/leads the
 * native scroll position as the outer wrapper passes through the
 * viewport, tied to GSAP ScrollTrigger (synced to Lenis via
 * SmoothScrollProvider).
 *
 * The ScrollTrigger MUST watch a stable (non-animated) element - using
 * the animated element itself as the trigger creates a feedback loop
 * where the animation shifts the very box ScrollTrigger measures
 * progress against, corrupting the scroll math. So this renders two
 * nested elements: an outer static trigger and an inner animated layer.
 *
 * Live-subscribes to the reduced-motion media query (rather than
 * reading it once) so a change while the page is open is respected
 * immediately in either direction.
 */
export function Parallax({
  children,
  speed = 60,
  className,
  innerClassName,
}: ParallaxProps) {
  const triggerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState<boolean | null>(null);

  useEffect(() => {
    const mql = window.matchMedia(REDUCED_MOTION_QUERY);
    setReduced(mql.matches);
    const onChange = () => setReduced(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const trigger = triggerRef.current;
    const inner = innerRef.current;
    if (!trigger || !inner || reduced === null || reduced) return;

    const ctx = gsap.context(() => {
      gsap.set(inner, { y: -speed });
      gsap.to(inner, {
        y: speed,
        ease: "none",
        scrollTrigger: {
          trigger,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
    }, triggerRef);

    const raf = requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      cancelAnimationFrame(raf);
      ctx.revert();
    };
  }, [speed, reduced]);

  return (
    <div ref={triggerRef} className={cn(className)}>
      <div ref={innerRef} className={cn(innerClassName)}>
        {children}
      </div>
    </div>
  );
}
