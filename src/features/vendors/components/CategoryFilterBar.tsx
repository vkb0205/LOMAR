import { Filter } from 'lucide-react';
import { motion } from 'motion/react';
import { EASE } from '../../../shared/ui/motion';

interface CategoryFilterBarProps {
  activeCategory: string;
  categories: string[];
  onCategoryChange: (category: string) => void;
}

export function CategoryFilterBar({ activeCategory, categories, onCategoryChange }: CategoryFilterBarProps) {
  return (
    <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
      <div className="no-scrollbar flex w-full gap-2 overflow-x-auto pb-1 md:w-auto md:pb-0">
        {categories.map((category) => {
          const active = activeCategory === category;
          return (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              aria-pressed={active}
              className={`relative shrink-0 rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-colors duration-500 ${
                active ? 'text-canvas' : 'text-ink/70 hover:text-ink'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="category-active-pill"
                  className="absolute inset-0 rounded-full bg-ink shadow-lift"
                  transition={{ duration: 0.5, ease: EASE }}
                />
              )}
              {!active && (
                <span className="absolute inset-0 rounded-full ring-1 ring-ink/15 transition-all duration-500 ease-fluid hover:ring-ink/40" />
              )}
              <span className="relative z-10">{category}</span>
            </button>
          );
        })}
      </div>

      <button className="flex shrink-0 items-center gap-2 rounded-full bg-canvas px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-ink ring-1 ring-ink/15 transition-all duration-500 ease-fluid hover:ring-ink/40">
        <Filter strokeWidth={1.5} className="h-4 w-4" /> Bộ lọc
      </button>
    </div>
  );
}
