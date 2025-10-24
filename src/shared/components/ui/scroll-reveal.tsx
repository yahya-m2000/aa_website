'use client';

import { motion } from 'framer-motion';
import { type ReactNode, memo } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  parallax?: boolean;
  className?: string;
}

const ScrollRevealComponent = ({
  children,
  parallax = false,
  className,
}: ScrollRevealProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-50px', amount: 0.2 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={className}
      style={{ willChange: 'transform, opacity' }}
    >
      {children}
    </motion.div>
  );
};

export const ScrollReveal = memo(ScrollRevealComponent);
