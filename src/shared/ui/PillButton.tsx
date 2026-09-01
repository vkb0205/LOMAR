import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRightIcon } from './icons';

type Variant = 'primary' | 'rose' | 'cream' | 'ghost' | 'onDark';

const shells: Record<Variant, string> = {
  primary: 'bg-ink text-canvas hover:bg-ink-soft shadow-lift',
  rose: 'bg-rose text-white hover:bg-rose-bright shadow-lift',
  cream: 'bg-cream text-ink-deep hover:bg-gold shadow-lift',
  ghost: 'border border-ink/15 bg-white/70 text-ink hover:border-ink/40 hover:bg-white',
  onDark: 'border border-white/25 text-canvas hover:bg-white/10',
};

const circles: Record<Variant, string> = {
  primary: 'bg-white/10 text-canvas group-hover:bg-white/20',
  rose: 'bg-white/20 text-white group-hover:bg-white/30',
  cream: 'bg-ink-deep/10 text-ink-deep group-hover:bg-ink-deep/15',
  ghost: 'bg-ink/5 text-ink group-hover:bg-ink/10',
  onDark: 'bg-white/10 text-canvas group-hover:bg-white/20',
};

const sizes = {
  sm: 'px-5 py-2.5 text-[10px]',
  md: 'px-6 py-3 text-[11px]',
  lg: 'px-7 py-3.5 text-xs',
} as const;

const circleSizes = {
  sm: 'h-7 w-7',
  md: 'h-8 w-8',
  lg: 'h-9 w-9',
} as const;

interface PillButtonProps {
  children: ReactNode;
  to?: string;
  href?: string;
  onClick?: () => void;
  type?: ButtonHTMLAttributes<HTMLButtonElement>['type'];
  disabled?: boolean;
  variant?: Variant;
  size?: keyof typeof sizes;
  /** Trailing icon rendered inside its own nested circle (button-in-button). */
  icon?: ReactNode;
  className?: string;
  ariaLabel?: string;
}

/**
 * Fluid-island pill with physical press physics and a nested trailing-icon
 * circle that translates diagonally on hover (internal kinetic tension).
 */
export function PillButton({
  children,
  to,
  href,
  onClick,
  type = 'button',
  disabled,
  variant = 'primary',
  size = 'md',
  icon = <ArrowUpRightIcon className="h-3.5 w-3.5" />,
  className = '',
  ariaLabel,
}: PillButtonProps) {
  const cls = `group inline-flex items-center gap-3 rounded-full font-bold uppercase tracking-[0.14em] transition-all duration-500 ease-fluid active:scale-[0.98] ${shells[variant]} ${sizes[size]} ${className}`;

  const content = (
    <>
      <span className="whitespace-nowrap">{children}</span>
      {icon && (
        <span
          className={`flex shrink-0 items-center justify-center rounded-full transition-all duration-500 ease-fluid group-hover:translate-x-1 group-hover:-translate-y-[1px] group-hover:scale-105 ${circleSizes[size]} ${circles[variant]}`}
        >
          {icon}
        </span>
      )}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={cls} aria-label={ariaLabel}>
        {content}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={cls} aria-label={ariaLabel}>
        {content}
      </a>
    );
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${cls} disabled:cursor-not-allowed disabled:opacity-50`}
      aria-label={ariaLabel}
    >
      {content}
    </button>
  );
}
