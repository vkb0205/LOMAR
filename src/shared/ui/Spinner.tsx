interface SpinnerProps {
  className?: string;
}

export function Spinner({ className = 'h-12 w-12' }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Đang tải"
      className={`animate-spin rounded-full border-2 border-rose/25 border-t-rose ${className}`}
    />
  );
}
