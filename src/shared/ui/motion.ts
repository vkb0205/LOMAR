import type { Transition, Variants } from 'motion/react';

/** Signature spring-like curve — the single easing of the design system. */
export const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];

/** Shared whileInView viewport config — animate once, slightly before entering. */
export const viewportOnce = { once: true, margin: '-50px' } as const;

/** Heavy fade-up with blur resolution — the system entry reveal. */
export const fadeBlurVariant: Variants = {
  hidden: { opacity: 0, y: 40, filter: 'blur(10px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
};

export function fluidTransition(duration = 0.8, delay = 0): Transition {
  return { duration, delay, ease: EASE };
}
