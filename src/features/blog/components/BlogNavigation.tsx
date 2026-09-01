import { Bookmark, Clock, Flame, Folder, Hash, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { EASE } from '../../../shared/ui/motion';

const navigationItems = [
  { icon: Flame, text: 'Sắp Xếp Theo', active: true },
  { icon: Clock, text: 'Mới Nhất' },
  { icon: Heart, text: 'Phổ Biến' },
  { icon: Folder, text: 'Danh Mục' },
  { icon: Hash, text: 'Chủ Đề' },
  { icon: Bookmark, text: 'Lưu Bài Viết' },
];

export function BlogNavigation() {
  return (
    <motion.aside
      initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
      className="flex h-fit w-full shrink-0 flex-col gap-6 lg:sticky lg:top-24 lg:w-[320px]"
    >
      {/* Nav island */}
      <div className="no-scrollbar flex overflow-x-auto rounded-bezel bg-ink/5 p-1.5 ring-1 ring-ink/5 shadow-tile lg:overflow-x-visible">
        <div className="flex flex-row gap-1 rounded-bezel-inner bg-white p-2 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] lg:flex-col lg:p-3">
          {navigationItems.map((item) => {
            const active = Boolean(item.active);
            return (
              <button
                key={item.text}
                className={`relative flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-full px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-all duration-500 ease-fluid lg:gap-3 ${
                  active
                    ? 'bg-ink text-canvas shadow-lift'
                    : 'text-ink/65 hover:bg-canvas hover:text-ink'
                }`}
              >
                <item.icon
                  strokeWidth={1.5}
                  className={`h-4 w-4 lg:h-[18px] lg:w-[18px] ${active ? 'text-rose-soft' : 'text-sage'}`}
                />
                {item.text}
              </button>
            );
          })}
        </div>
      </div>

      {/* Editorial intro card — dark accent */}
      <div className="hidden rounded-bezel bg-ink p-1.5 ring-1 ring-white/10 lg:flex">
        <div className="relative flex w-full flex-col overflow-hidden rounded-bezel-inner bg-gradient-to-br from-ink via-ink to-ink-soft p-6 text-center">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_80%_0%,rgba(215,139,162,0.2),transparent_65%)]"
          />
          <h2 className="relative z-10 mb-1 font-serif text-4xl font-bold tracking-wider text-canvas">
            Blog
          </h2>
          <p className="relative z-10 mb-4 flex items-center justify-center gap-2 font-serif text-sm italic text-rose-soft">
            Cảm hứng cho hành trình hạnh phúc <Heart strokeWidth={1.5} className="h-3 w-3 fill-current" />
          </p>
          <p className="relative z-10 mb-2 px-2 text-[11px] leading-relaxed text-canvas/75">
            Những chia sẻ, kinh nghiệm và cảm hứng từ Phố Hạnh Phúc Hồ Văn Huê để giúp bạn chuẩn bị
            cho ngày trọng đại một cách hoàn hảo nhất.
          </p>
        </div>
      </div>
    </motion.aside>
  );
}
