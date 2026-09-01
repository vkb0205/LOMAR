import type { ReactNode } from 'react';
import { EyebrowTag } from './EyebrowTag';
import { Reveal } from './Reveal';

/** Italic rose serif accent phrase inside a heading. */
export function Accent({ children }: { children: ReactNode }) {
  return <span className="italic text-rose">{children}</span>;
}

interface SectionHeadingProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  align?: 'center' | 'left';
  className?: string;
}

/** Editorial section header: eyebrow pill + massive serif heading + lead copy. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  className = '',
}: SectionHeadingProps) {
  const centered = align === 'center';
  return (
    <Reveal
      className={`flex flex-col ${centered ? 'items-center text-center' : 'items-start text-left'} ${className}`}
    >
      {eyebrow && <EyebrowTag>{eyebrow}</EyebrowTag>}
      <h2 className="mt-5 font-serif text-[1.75rem] font-bold leading-[1.1] tracking-[-0.015em] text-ink text-balance md:text-4xl lg:text-[2.75rem]">
        {title}
      </h2>
      {description && (
        <p
          className={`mt-4 text-sm leading-relaxed text-ink/70 text-pretty md:text-base ${
            centered ? 'max-w-xl' : 'max-w-2xl'
          }`}
        >
          {description}
        </p>
      )}
    </Reveal>
  );
}
