import type { ReactNode } from 'react';

interface BezelCardProps {
  children: ReactNode;
  /** Outer-shell extras (hover motion, custom width...). */
  className?: string;
  /** Inner-core extras (padding, overflow, flex...). */
  innerClassName?: string;
  as?: 'div' | 'article' | 'section';
}

/**
 * The "Double-Bezel" (Doppelrand) — every major container reads as machined
 * hardware: a tinted outer shell tray + inset inner core with concentric
 * radii and an inner highlight.
 */
export function BezelCard({ children, className = '', innerClassName = '', as: Tag = 'div' }: BezelCardProps) {
  return (
    <Tag className={`rounded-bezel bg-ink/5 p-1.5 ring-1 ring-ink/5 shadow-tile ${className}`}>
      <div
        className={`rounded-bezel-inner bg-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] ${innerClassName}`}
      >
        {children}
      </div>
    </Tag>
  );
}
