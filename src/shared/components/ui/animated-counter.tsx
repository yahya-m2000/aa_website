'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

interface AnimatedCounterProps {
  from?: number;
  to: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  className?: string;
}

export function AnimatedCounter(props: AnimatedCounterProps) {
  const from = props.from ?? 0;
  const to = props.to;
  const duration = props.duration ?? 2;
  const suffix = props.suffix ?? '';
  const prefix = props.prefix ?? '';
  const decimals = props.decimals ?? 0;
  const className = props.className;

  const [count, setCount] = useState(from);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  useEffect(
    function () {
      if (!isInView) return;

      const startTime = performance.now();
      const range = to - from;

      function updateCount(currentTime: number) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / (duration * 1000), 1);
        const easeProgress = 1 - Math.pow(1 - progress, 4);
        const currentCount = from + range * easeProgress;

        setCount(currentCount);

        if (progress < 1) {
          requestAnimationFrame(updateCount);
        } else {
          setCount(to);
        }
      }

      requestAnimationFrame(updateCount);
    },
    [isInView, from, to, duration]
  );

  return (
    <span ref={ref} className={className}>
      {prefix}
      {count.toFixed(decimals)}
      {suffix}
    </span>
  );
}
