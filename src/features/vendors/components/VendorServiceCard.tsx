import { Heart, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { openContextualAssistant } from '../../chat/openAssistant';
import type { VendorDetailService } from '../types';
import { EASE } from '../../../shared/ui/motion';

interface VendorServiceCardProps {
  index: number;
  service: VendorDetailService;
}

export function VendorServiceCard({ index, service }: VendorServiceCardProps) {
  return (
    <motion.div
      key={service.id}
      initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.7, delay: (index % 4) * 0.08, ease: EASE }}
      className="group flex flex-col rounded-bezel bg-ink/5 p-1.5 ring-1 ring-ink/5 shadow-tile transition-all duration-700 ease-fluid hover:-translate-y-1.5 hover:bg-ink/8 hover:shadow-float"
    >
      <div className="flex flex-1 flex-col overflow-hidden rounded-bezel-inner bg-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]">
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-canvas">
          <img
            src={
              service.thumbnail_url ||
              'https://images.unsplash.com/photo-1595000072051-5afcb1eef556?auto=format&fit=crop&q=80&w=600'
            }
            alt={service.name || 'Service'}
            className="h-full w-full object-cover transition-transform duration-700 ease-fluid group-hover:scale-105"
          />
          <button
            type="button"
            aria-label="Lưu dịch vụ"
            className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-canvas/90 text-rose-deep opacity-0 transition-all duration-500 ease-fluid group-hover:opacity-100 hover:scale-110 hover:bg-canvas"
          >
            <Heart strokeWidth={1.5} className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-1 flex-col p-5 md:p-6">
          <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-rose-deep">
            {service.category || 'Dịch vụ'}
          </span>
          <h3 className="mb-4 font-serif text-lg font-bold leading-tight text-ink transition-colors duration-500 group-hover:text-rose-deep">
            {service.name}
          </h3>
          <div className="mt-auto flex items-center justify-between gap-3">
            <span className="font-bold text-ink">
              {Number(service.base_price).toLocaleString('vi-VN')}{' '}
              <span className="text-[10px] font-normal">VND</span>
            </span>
            <button
              type="button"
              aria-label="Hỏi tư vấn AI"
              onClick={() =>
                openContextualAssistant({
                  prompt: service.name ? `Tư vấn về dịch vụ: ${service.name}` : undefined,
                })
              }
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-mist text-rose-deep transition-all duration-500 ease-fluid hover:-translate-y-0.5 hover:bg-rose hover:text-white active:scale-95"
            >
              <Sparkles strokeWidth={1.5} className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
