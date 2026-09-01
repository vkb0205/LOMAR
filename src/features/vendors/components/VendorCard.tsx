import { useEffect, useState } from 'react';
import { Check, Copy, ExternalLink, MapPin, Star } from 'lucide-react';
import { motion } from 'motion/react';
import type { VendorCardModel } from '../types';
import { EASE } from '../../../shared/ui/motion';

interface VendorCardProps {
  index: number;
  vendor: VendorCardModel;
  onOpen: (vendorId: string) => void;
}

function formatRank(rank: number) {
  return `#${String(rank).padStart(2, '0')}`;
}

/** AIC FinalScoreBadge mapping — mono score colored by value tier. */
function scoreColorClass(rating: number) {
  if (rating >= 4.8) return 'text-forest';
  if (rating >= 4.5) return 'text-amber-600';
  return 'text-muted';
}

export function VendorCard({ index, vendor, onOpen }: VendorCardProps) {
  const globalRank = index + 1;
  const fallbackImage = `https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&q=80&w=600&sig=${vendor.id}`;
  const rating = vendor.rating || 5.0;
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1500);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const handleCopy = (event: React.MouseEvent) => {
    event.stopPropagation();
    const text = [vendor.name, vendor.addr].filter(Boolean).join(' — ');
    navigator.clipboard.writeText(text).catch(() => null);
    setCopied(true);
  };

  const handleDirections = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!vendor.addr) return;
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(vendor.addr)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.06, ease: EASE }}
      role="article"
      aria-label={`Kết quả ${globalRank}: ${vendor.name}`}
      tabIndex={0}
      onClick={() => onOpen(vendor.id)}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpen(vendor.id);
        }
      }}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border border-hairline bg-canvas transition-all duration-150 hover:border-rose hover:shadow-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose"
    >
      {/* Rank badge — dark mono chip, top-left */}
      <span className="absolute top-2 left-2 z-10 rounded-md bg-ink-deep px-1.5 py-0.5 font-mono text-[11px] font-semibold text-canvas opacity-90">
        {formatRank(globalRank)}
      </span>

      {/* Category chip — outline, top-right */}
      <span className="absolute top-2 right-2 z-10 rounded-full border border-hairline bg-canvas/90 px-2.5 py-0.5 text-[10px] font-semibold tracking-wider text-muted uppercase backdrop-blur-sm">
        {vendor.category}
      </span>

      {/* Media frame — 16/9 */}
      <div className="relative aspect-video w-full overflow-hidden bg-surface-soft">
        <img
          src={vendor.img || fallbackImage}
          alt={vendor.name}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      </div>

      {/* Card body */}
      <div className="flex flex-1 flex-col gap-2.5 p-3">
        {/* Identity row */}
        <div className="flex min-w-0 items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-[14px] leading-tight font-semibold text-ink">
              {vendor.name}
            </p>
            {vendor.addr && (
              <p className="mt-0.5 flex min-w-0 items-center gap-1 font-mono text-[12px] text-muted">
                <MapPin size={11} strokeWidth={1.75} className="shrink-0" />
                <span className="truncate">{vendor.addr}</span>
              </p>
            )}
          </div>
          <span
            className={`flex shrink-0 items-center gap-1 font-mono text-sm font-semibold ${scoreColorClass(rating)}`}
            title={`Đánh giá ${rating.toFixed(1)}/5`}
          >
            <Star size={12} strokeWidth={2} className="fill-current" />
            {rating.toFixed(1)}
          </span>
        </div>

        {/* Action row */}
        <div className="mt-auto grid grid-cols-3 gap-2 border-t border-hairline pt-2.5">
          <button
            type="button"
            aria-label="Xem chi tiết"
            onClick={event => {
              event.stopPropagation();
              onOpen(vendor.id);
            }}
            className="inline-flex h-8 w-full items-center justify-center rounded-lg bg-surface-soft text-muted transition-colors duration-150 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-rose"
          >
            <ExternalLink size={15} strokeWidth={1.75} />
          </button>
          <button
            type="button"
            aria-label="Chỉ đường"
            disabled={!vendor.addr}
            title={vendor.addr ? 'Chỉ đường trên Google Maps' : 'Không có địa chỉ'}
            onClick={handleDirections}
            className="inline-flex h-8 w-full items-center justify-center rounded-lg bg-surface-soft text-muted transition-colors duration-150 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-rose disabled:cursor-not-allowed disabled:opacity-40"
          >
            <MapPin size={15} strokeWidth={1.75} />
          </button>
          <button
            type="button"
            aria-label={copied ? 'Đã sao chép' : 'Sao chép thông tin'}
            title={copied ? 'Đã sao chép' : 'Sao chép thông tin'}
            onClick={handleCopy}
            className={`inline-flex h-8 w-full items-center justify-center rounded-lg bg-surface-soft transition-colors duration-150 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-rose ${
              copied ? 'text-rose-deep' : 'text-muted'
            }`}
          >
            {copied ? <Check size={15} strokeWidth={2} /> : <Copy size={15} strokeWidth={1.75} />}
          </button>
        </div>
      </div>
    </motion.article>
  );
}
