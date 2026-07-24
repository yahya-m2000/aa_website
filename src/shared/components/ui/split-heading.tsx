"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from "split-type";
import { cn } from "@/core/utils";
import { prefersReducedMotion } from "@/core/providers/smooth-scroll-provider";

export interface SplitHeadingProps {
  as?: "h1" | "h2" | "h3" | "p";
  children: React.ReactNode;
  variant?: "rise" | "scrub" | "immediate";
  className?: string;
  delay?: number;
}

export function SplitHeading({
  as: Tag = "h2",
  children,
  variant = "rise",
  className,
  delay = 0,
}: SplitHeadingProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    let splitter: SplitType;
    let trigger: ScrollTrigger | undefined;

    const ctx = gsap.context(() => {
      if (variant === "immediate") {
        // No scroll trigger - for above-the-fold content (e.g. the Hero
        // H1) that's visible on load, not revealed by scrolling.
        splitter = new SplitType(el, { types: "lines,words" });
        gsap.from(splitter.words, {
          y: "120%",
          stagger: 0.02,
          duration: 1,
          delay,
          ease: "power2.out",
        });
      } else if (variant === "rise") {
        splitter = new SplitType(el, { types: "lines,words" });
        const tween = gsap.from(splitter.words, {
          y: "120%",
          stagger: 0.02,
          duration: 1,
          delay,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            once: true,
          },
        });
        trigger = tween.scrollTrigger;
      } else {
        splitter = new SplitType(el, { types: "words,chars" });
        const tween = gsap.fromTo(
          splitter.chars,
          { opacity: 0.15 },
          {
            opacity: 1,
            stagger: 0.05,
            scrollTrigger: {
              trigger: el,
              start: "top 90%",
              end: "top 40%",
              scrub: true,
            },
          }
        );
        trigger = tween.scrollTrigger;
      }
    });

    // In React 19 Strict Mode (dev only), this effect mounts, cleans up,
    // and remounts immediately. For elements already in the viewport on
    // load (e.g. the Hero H1), a `once: true` ScrollTrigger can fire and
    // get reverted before the second mount ever sees it enter. Refreshing
    // after setup forces ScrollTrigger to re-evaluate current positions
    // against the final DOM, so already-visible elements still animate.
    ScrollTrigger.refresh();

    return () => {
      trigger?.kill();
      splitter?.revert();
      ctx.revert();
    };
  }, [variant, delay]);

  return (
    <Tag
      ref={ref as never}
      data-split-heading
      className={cn(className)}
    >
      {children}
    </Tag>
  );
}
