import type { ReactNode } from 'react';

type Tone = 'rose' | 'sage' | 'onDark';

const tones: Record<Tone, string> = {
  rose: 'border-rose/30 bg-rose-mist/70 text-rose-deep',
  sage: 'border-sage/30 bg-sage-mist/70 text-forest',
  onDark: 'border-white/20 bg-white/10 text-cream',
};

interface EyebrowTagProps {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}

/** Microscopic pill badge preceding major headings. */
export function EyebrowTag({ children, tone = 'rose', className = '' }: EyebrowTagProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
