import { ArrowDownAZ, Clock, Sparkles, Star } from 'lucide-react';
import type { VendorSortKey } from '../types';

const SORTS: { key: VendorSortKey; label: string; icon: typeof Star }[] = [
  { key: 'featured', label: 'Nổi bật', icon: Sparkles },
  { key: 'rating', label: 'Đánh giá', icon: Star },
  { key: 'name', label: 'A–Z', icon: ArrowDownAZ },
];

interface ResultToolbarProps {
  activeCategory: string;
  loadMs: number | null;
  rangeStart: number;
  rangeEnd: number;
  sortKey: VendorSortKey;
  totalCount: number;
  onSortChange: (key: VendorSortKey) => void;
}

/** AIC ResultToolbar: count + timing + task badge left, view controls right. */
export function ResultToolbar({
  activeCategory,
  loadMs,
  rangeStart,
  rangeEnd,
  sortKey,
  totalCount,
  onSortChange,
}: ResultToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-hairline bg-canvas px-3 py-2">
      {/* Left: result count + execution time + task badge */}
      <div className="mr-auto flex min-w-0 flex-wrap items-center gap-2">
        <span className="shrink-0 text-base font-semibold text-ink">
          {rangeStart}–{rangeEnd}{' '}
          <span className="font-normal text-muted">/ {totalCount} kết quả</span>
        </span>

        {loadMs !== null && (
          <span
            className="flex shrink-0 items-center gap-1 rounded-md border border-sage/20 bg-sage/10 px-2 py-0.5 font-mono text-xs font-semibold text-forest"
            title={`Thời gian tải danh mục: ${(loadMs / 1000).toFixed(2)} giây`}
          >
            <Clock size={12} />
            {(loadMs / 1000).toFixed(2)}s
          </span>
        )}

        <span className="hidden items-center gap-1.5 text-sm text-muted sm:flex">
          <span>·</span>
          <span className="rounded-full border border-hairline px-2.5 py-0.5 text-[12px] text-muted">
            {activeCategory}
          </span>
        </span>
      </div>

      {/* Right: sort controls */}
      <div className="flex shrink-0 items-center gap-1.5">
        <div className="mx-0.5 h-4 w-px bg-hairline" />
        {SORTS.map(({ key, label, icon: Icon }) => {
          const active = sortKey === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSortChange(key)}
              aria-pressed={active}
              className={`inline-flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-colors duration-200 ${
                active
                  ? 'border border-rose/60 bg-rose/15 font-semibold text-rose-deep'
                  : 'text-muted hover:bg-surface-soft hover:text-ink'
              }`}
            >
              <Icon size={13} strokeWidth={active ? 2 : 1.75} />
              <span className="hidden md:inline">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
