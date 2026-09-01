import { useEffect, useState } from 'react';
import { ArrowUpRight, Check, Clock, Copy, MapPin, Star } from 'lucide-react';
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

function scoreColorClass(rating: number) {
  if (rating >= 4.8) return 'text-forest';
  if (rating >= 4.5) return 'text-amber-600';
  return 'text-muted';
}

function formatHoursLine(hours: NonNullable<VendorCardModel['hours']>) {
  if (!hours.length) return '';
  const today = new Date().getDay();
  const todayEntry = hours.find(entry => {
    const dayMap: Record<string, number> = {
      CN: 0,
      T2: 1,
      T3: 2,
      T4: 3,
      T5: 4,
      T6: 5,
      T7: 6,
    };
    return dayMap[entry.day.toUpperCase()] === today;
  });
  if (todayEntry) return `Hôm nay ${todayEntry.open} – ${todayEntry.close}`;
  const first = hours[0];
  return `${first.day}: ${first.open} – ${first.close}`;
}

export function VendorCard({ index, vendor, onOpen }: VendorCardProps) {
  const globalRank = index + 1;
  const fallbackImage = `https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&q=80&w=600&sig=${vendor.id}`;
  const rating = vendor.rating || 5.0;
  const [copied, setCopied] = useState(false);
  const [hoursOpen, setHoursOpen] = useState(false);

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

  const handleOpen = (event: React.MouseEvent) => {
    event.stopPropagation();
    onOpen(vendor.id);
  };

  const handleToggleHours = (event: React.MouseEvent) => {
    event.stopPropagation();
    setHoursOpen(prev => !prev);
  };

  const hoursLine = vendor.hours && vendor.hours.length > 0 ? formatHoursLine(vendor.hours) : 'Null time';
  const hasHoursList = Boolean(vendor.hours && vendor.hours.length > 0);

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
      <div className="flex flex-1 flex-col gap-2 p-3">
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

        {/* Opening hours — subtle inline disclosure */}
        {hoursLine && (
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted">
            <Clock size={11} strokeWidth={1.75} className="shrink-0" />
            <span className="truncate">{hoursLine}</span>
            {hasHoursList && vendor.hours && vendor.hours.length > 1 && (
              <button
                type="button"
                aria-expanded={hoursOpen}
                aria-label={hoursOpen ? 'Ẩn giờ mở cửa' : 'Xem tất cả giờ mở cửa'}
                onClick={handleToggleHours}
                className="ml-auto text-[11px] font-medium text-rose-deep transition-opacity duration-150 hover:opacity-80 focus-visible:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose"
              >
                {hoursOpen ? 'Thu gọn' : 'Tất cả'}
              </button>
            )}
          </div>
        )}
        {hoursOpen && vendor.hours && vendor.hours.length > 0 && (
          <ul className="flex flex-col gap-0.5 border-l border-hairline pl-2 font-mono text-[11px] text-muted">
            {vendor.hours.map(entry => (
              <li key={entry.day} className="flex justify-between gap-2">
                <span>{entry.day}</span>
                <span className="text-ink">{entry.open} – {entry.close}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.article>
  );
}