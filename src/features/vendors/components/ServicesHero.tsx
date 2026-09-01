import { useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { motion } from 'motion/react';
import { EASE } from '../../../shared/ui/motion';

interface ServicesHeroProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
}

export function ServicesHero({ searchTerm, onSearchTermChange }: ServicesHeroProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== '/') return;
      const target = event.target as HTMLElement | null;
      const isTyping =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);
      if (isTyping) return;
      event.preventDefault();
      const input = searchInputRef.current;
      input?.focus();
      input?.select();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div data-hero className="relative w-full">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE }}
        className="relative mx-auto w-full max-w-[1200px] px-4 pt-20 pb-6 md:pt-24 md:pb-8"
      >
        {/* Query composer — AIC input pattern on surface-soft */}
        <div className="flex items-center gap-2 rounded-lg border border-hairline bg-surface-soft py-1.5 pl-3.5 pr-1.5 transition-colors duration-200 focus-within:border-rose focus-within:ring-1 focus-within:ring-rose/30">
          <Search strokeWidth={1.75} className="h-4.5 w-4.5 shrink-0 text-muted-soft" aria-hidden />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Tìm kiếm dịch vụ, thương hiệu..."
            value={searchTerm}
            onChange={(event) => onSearchTermChange(event.target.value)}
            aria-label="Tìm kiếm dịch vụ, thương hiệu"
            className="min-w-0 flex-1 bg-transparent py-2 text-sm text-ink outline-none placeholder:text-ink/40"
          />
          <kbd
            aria-hidden
            className="hidden h-6 min-w-6 select-none items-center justify-center rounded-md border border-hairline bg-canvas px-1.5 font-mono text-[11px] text-muted md:flex"
          >
            /
          </kbd>
          <button
            type="button"
            className="inline-flex h-9 shrink-0 items-center gap-2 rounded-md bg-ink px-4 text-sm font-medium text-canvas transition-colors duration-200 hover:bg-ink-soft active:bg-ink-soft"
          >
            Tìm kiếm
          </button>
        </div>
      </motion.div>
    </div>
  );
}
