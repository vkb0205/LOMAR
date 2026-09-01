import { SlidersHorizontal } from 'lucide-react';
import { motion } from 'motion/react';
import { EASE } from '../../../shared/ui/motion';

interface CategoryFilterBarProps {
  activeCategory: string;
  categories: string[];
  onCategoryChange: (category: string) => void;
}

export function CategoryFilterBar({ activeCategory, categories, onCategoryChange }: CategoryFilterBarProps) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-center">
      <div className="no-scrollbar flex w-full items-center gap-1.5 overflow-x-auto pb-1 md:w-auto md:pb-0">
        {categories.map((category) => {
          const active = activeCategory === category;
          return (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              aria-pressed={active}
              className={`relative shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors duration-200 ${
                active
                  ? 'text-canvas'
                  : 'border border-hairline text-muted hover:bg-surface-soft hover:text-ink'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="category-active-pill"
                  className="absolute inset-0 rounded-full bg-ink"
                  transition={{ duration: 0.4, ease: EASE }}
                />
              )}
              <span className="relative z-10">{category}</span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        aria-label="Bộ lọc nâng cao"
        className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-medium text-muted transition-colors duration-200 hover:bg-surface-soft hover:text-ink"
      >
        <SlidersHorizontal strokeWidth={1.75} className="h-4 w-4" />
        <span className="hidden md:inline">Bộ lọc</span>
      </button>
    </div>
  );
}
