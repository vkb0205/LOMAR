import { Star } from 'lucide-react';
import { motion } from 'motion/react';
import type { VendorCardModel } from '../types';
import { EASE } from '../../../shared/ui/motion';
import { ArrowUpRightIcon } from '../../../shared/ui/icons';

interface VendorCardProps {
  index: number;
  vendor: VendorCardModel;
  onOpen: (vendorId: string) => void;
}

export function VendorCard({ index, vendor, onOpen }: VendorCardProps) {
  const fallbackImage = `https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&q=80&w=600&sig=${vendor.id}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.7, delay: (index % 4) * 0.08, ease: EASE }}
      onClick={() => onOpen(vendor.id)}
      className="group flex cursor-pointer flex-col rounded-bezel bg-ink/5 p-1.5 ring-1 ring-ink/5 shadow-tile transition-all duration-700 ease-fluid hover:-translate-y-1.5 hover:bg-ink/8 hover:shadow-float"
    >
      {/* Inner core */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-bezel-inner bg-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-canvas">
          <img
            src={vendor.img || fallbackImage}
            alt={vendor.name}
            className="h-full w-full object-cover transition-transform duration-700 ease-fluid group-hover:scale-105"
          />
          <div className="absolute top-4 left-4 rounded-full bg-canvas/90 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-ink">
            {vendor.category}
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5 md:p-6">
          <div className="mb-3 flex items-start justify-between gap-3">
            <h3 className="font-serif text-lg font-bold leading-tight text-ink transition-colors duration-500 group-hover:text-rose-deep">
              {vendor.name}
            </h3>
            <div className="flex shrink-0 items-center rounded-full bg-cream px-2.5 py-1 text-[11px] font-bold text-ink-deep">
              <Star strokeWidth={1.5} className="mr-1 h-3 w-3 fill-current" />
              {vendor.rating || '5.0'}
            </div>
          </div>

          {vendor.addr && (
            <div className="mb-4 flex items-center text-xs text-ink/55">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-1.5 h-3.5 w-3.5 shrink-0"
                aria-hidden
              >
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span className="truncate">{vendor.addr}</span>
            </div>
          )}

          {/* Button-in-button CTA */}
          <div className="mt-auto flex w-full items-center justify-between rounded-full border border-ink/10 bg-canvas py-1.5 pr-1.5 pl-5 transition-all duration-500 ease-fluid group-hover:border-ink group-hover:bg-ink">
            <span className="text-[10px] font-bold uppercase tracking-widest text-ink transition-colors duration-500 group-hover:text-canvas">
              Xem chi tiết
            </span>
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink/5 text-ink transition-all duration-500 ease-fluid group-hover:translate-x-0.5 group-hover:-translate-y-[1px] group-hover:scale-105 group-hover:bg-white/10 group-hover:text-canvas">
              <ArrowUpRightIcon className="h-3 w-3" />
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
