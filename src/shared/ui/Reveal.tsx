import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { EASE, viewportOnce } from './motion';

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  y?: number;
}

/**
 * Scroll-entry reveal: heavy fade-up resolving out of a blur.
 * Animates only transform/opacity/filter — GPU-safe.
 */
export function Reveal({ children, className, delay = 0, duration = 0.8, y = 40 }: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y, filter: 'blur(10px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={viewportOnce}
      transition={{ duration, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
