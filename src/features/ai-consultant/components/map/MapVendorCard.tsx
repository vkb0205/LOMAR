import { Aperture, ArrowUpRight, Camera, Clock, MapPin, Navigation, Phone, Shirt, Sparkles, Star, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../../shared/config/routes';
import type { MapVendor } from '../../services/mapVendorService';

interface MapVendorCardProps {
  vendor: MapVendor;
  onClose: () => void;
}

function CategoryIcon({ category }: { category: string }) {
  const normalized = category.toLocaleLowerCase('vi-VN');
  const Icon = normalized.includes('chụp')
    ? Camera
    : normalized.includes('váy')
      ? Shirt
      : normalized.includes('trang điểm')
        ? Sparkles
        : normalized.includes('studio')
          ? Aperture
          : MapPin;

  return <Icon aria-hidden className="h-4 w-4" strokeWidth={1.7} />;
}

export function MapVendorCard({ vendor, onClose }: MapVendorCardProps) {
  const image = vendor.image?.trim() || null;
  const hasRating = vendor.reviews > 0 && vendor.rating > 0;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${vendor.lat},${vendor.lng}`;

  return (
    <article
      role="dialog"
      aria-label={`Thông tin ${vendor.name}`}
      className="pointer-events-auto w-full max-w-[380px] overflow-hidden rounded-2xl border border-hairline bg-canvas shadow-lift"
    >
      <div className="relative h-28 overflow-hidden bg-rose-mist">
        {image ? (
          <img
            src={image}
            alt={vendor.name}
            className="h-full w-full object-cover"
            onError={event => {
              event.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-surface-soft text-rose-deep">
            <CategoryIcon category={vendor.category} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-deep/55 to-transparent" />
        <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-canvas/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink">
          <CategoryIcon category={vendor.category} />
          <span>{vendor.category}</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng thông tin cửa hàng"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-ink/70 text-canvas backdrop-blur-sm transition-colors hover:bg-ink"
        >
          <X aria-hidden className="h-4 w-4" strokeWidth={1.7} />
        </button>
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-serif text-lg font-semibold leading-tight text-ink">{vendor.name}</h2>
            <p className="mt-1 flex items-start gap-1.5 text-xs leading-snug text-muted">
              <MapPin aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-deep" strokeWidth={1.7} />
              <span>{vendor.address || 'Chưa cập nhật địa chỉ'}</span>
            </p>
          </div>
          {vendor.priceRange && (
            <span className="shrink-0 rounded-full bg-surface-soft px-2 py-1 font-mono text-[11px] font-semibold text-ink">
              {vendor.priceRange}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
          {hasRating ? (
            <span className="inline-flex items-center gap-1 font-mono font-semibold text-ink">
              <Star aria-hidden className="h-3.5 w-3.5 fill-gold text-gold" strokeWidth={1.7} />
              {vendor.rating.toFixed(1)}
              <span className="font-sans font-normal text-muted">({vendor.reviews})</span>
            </span>
          ) : (
            <span className="text-muted">Chưa có đánh giá</span>
          )}
          {vendor.hours && (
            <span className="inline-flex items-center gap-1.5 text-muted">
              <Clock aria-hidden className="h-3.5 w-3.5 text-rose-deep" strokeWidth={1.7} />
              {vendor.hours}
            </span>
          )}
        </div>

        {vendor.description && (
          <p className="line-clamp-2 text-xs leading-relaxed text-muted">{vendor.description}</p>
        )}

        {(vendor.phone || vendor.specialties.length > 0) && (
          <div className="space-y-2 border-t border-hairline pt-3">
            {vendor.phone && (
              <a
                href={`tel:${vendor.phone.replace(/[^\d+]/g, '')}`}
                className="flex items-center gap-1.5 text-xs text-ink transition-colors hover:text-rose-deep"
              >
                <Phone aria-hidden className="h-3.5 w-3.5 text-rose-deep" strokeWidth={1.7} />
                {vendor.phone}
              </a>
            )}
            {vendor.specialties.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {vendor.specialties.slice(0, 4).map(specialty => (
                  <span key={specialty} className="rounded-full border border-hairline bg-surface-soft px-2 py-1 text-[10px] text-muted">
                    {specialty}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 pt-1">
          <a
            href={directionsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-ink px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-canvas transition-colors hover:bg-ink-soft"
          >
            <Navigation aria-hidden className="h-3.5 w-3.5" strokeWidth={1.7} />
            Chỉ đường
          </a>
          <Link
            to={ROUTES.vendorDetail(vendor.id)}
            className="inline-flex items-center gap-1 rounded-full border border-hairline px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-ink transition-colors hover:bg-surface-soft"
          >
            Chi tiết
            <ArrowUpRight aria-hidden className="h-3.5 w-3.5" strokeWidth={1.7} />
          </Link>
        </div>
      </div>
    </article>
  );
}
