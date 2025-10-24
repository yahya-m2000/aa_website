'use client';

import { motion, type Variants } from 'framer-motion';
import { type ReactNode, memo, useMemo } from 'react';

interface StaggerContainerProps {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
}

const StaggerContainerComponent = ({
  children,
  staggerDelay = 0.08,
  className,
}: StaggerContainerProps) => {
  const containerVariants: Variants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1,
      },
    },
  }), [staggerDelay]);

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '0px', amount: 0.1 }}
      variants={containerVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const StaggerContainer = memo(StaggerContainerComponent);

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
}

const StaggerItemComponent = ({
  children,
  className,
}: StaggerItemProps) => {
  const itemVariants: Variants = useMemo(() => ({
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  }), []);

  return (
    <motion.div 
      variants={itemVariants} 
      className={className}
      style={{ willChange: 'transform, opacity' }}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem = memo(StaggerItemComponent);
