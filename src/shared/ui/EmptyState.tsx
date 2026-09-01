import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  className?: string;
}

export function EmptyState({ icon, title, description, className = '' }: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center rounded-bezel border border-dashed border-ink/15 bg-white/60 px-8 py-20 text-center ${className}`}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-mist text-rose-deep">
        {icon}
      </div>
      <h3 className="mt-5 font-serif text-xl font-bold text-ink">{title}</h3>
      {description && <p className="mt-2 max-w-md text-sm leading-relaxed text-ink/60">{description}</p>}
    </div>
  );
}
