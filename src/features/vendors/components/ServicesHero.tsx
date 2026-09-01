import { Search } from 'lucide-react';
import { motion } from 'motion/react';
import { EASE } from '../../../shared/ui/motion';
import { EyebrowTag } from '../../../shared/ui/EyebrowTag';
import { Accent } from '../../../shared/ui/SectionHeading';
import { ArrowRightIcon } from '../../../shared/ui/icons';

interface ServicesHeroProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
}

export function ServicesHero({ searchTerm, onSearchTermChange }: ServicesHeroProps) {
  return (
    <div data-hero className="relative w-full overflow-hidden">
      {/* Ambient washes replace the full-bleed photo scrim */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_60%_at_80%_0%,rgba(215,139,162,0.16),transparent_60%),radial-gradient(45%_55%_at_5%_100%,rgba(124,154,90,0.14),transparent_60%)]"
      />

      <div className="relative mx-auto grid max-w-[1200px] items-end gap-10 px-4 pt-32 pb-12 md:grid-cols-[1fr_auto] md:pt-40 md:pb-16">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <EyebrowTag>Dịch vụ trong khu phố</EyebrowTag>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 32, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.9, delay: 0.1, ease: EASE }}
            className="mt-5 font-serif text-[clamp(2.25rem,5.5vw,4.25rem)] font-bold leading-[1.05] tracking-[-0.015em] text-balance text-ink"
          >
            Dịch vụ <Accent>cưới trọn vẹn</Accent>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25, ease: EASE }}
            className="mt-5 max-w-xl text-sm leading-relaxed text-pretty text-ink/70 md:text-base"
          >
            Khám phá hệ sinh thái dịch vụ cưới trọn vẹn tại Phố Hạnh Phúc, nơi quy tụ những
            thương hiệu uy tín nhất trên Hồ Văn Huê.
          </motion.p>
        </div>
      </div>

      {/* Search island — double-bezel */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4, ease: EASE }}
        className="relative mx-auto w-full max-w-[1200px] px-4 pb-14"
      >
        <div className="rounded-bezel bg-ink/5 p-1.5 ring-1 ring-ink/5 shadow-card">
          <div className="flex items-center gap-2 rounded-bezel-inner bg-white p-2 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]">
            <Search strokeWidth={1.5} className="ml-3 h-5 w-5 shrink-0 text-sage" aria-hidden />
            <input
              type="text"
              placeholder="Tìm kiếm dịch vụ, thương hiệu..."
              value={searchTerm}
              onChange={(event) => onSearchTermChange(event.target.value)}
              className="min-w-0 flex-1 bg-transparent py-2.5 pr-2 text-sm text-ink outline-none placeholder:text-ink/40"
            />
            <button
              type="button"
              className="group hidden shrink-0 items-center gap-2.5 rounded-full bg-ink py-2 pl-5 pr-2 text-[11px] font-bold uppercase tracking-[0.14em] text-canvas transition-all duration-500 ease-fluid hover:bg-ink-soft active:scale-[0.98] sm:inline-flex"
            >
              Tìm kiếm
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 transition-all duration-500 ease-fluid group-hover:translate-x-1 group-hover:-translate-y-[1px] group-hover:scale-105 group-hover:bg-white/20">
                <ArrowRightIcon className="h-3 w-3" />
              </span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
