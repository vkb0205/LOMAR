import { MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../shared/config/routes';
import { formatServicePrice } from '../../../shared/utils/formatServicePrice';
import type { RetrievedService } from '../types';

export const FALLBACK_VENDOR_IMAGE =
  'https://images.unsplash.com/photo-1595000072051-5afcb1eef556?auto=format&fit=crop&q=80&w=600';

interface RetrievedServiceRowProps {
  services: RetrievedService[];
}

/** Horizontal strip of catalog cards for the latest assistant answer. */
export function RetrievedServiceRow({ services }: RetrievedServiceRowProps) {
  if (services.length === 0) return null;

  const vendorCount = services.filter(service => service.vendorId).length;

  return (
    <div className="border-t border-hairline bg-canvas px-4 py-3">
      <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.12em] text-sage">
        {vendorCount > 0 ? 'Nhà cung cấp gợi ý' : 'Dịch vụ gợi ý'} ({services.length})
      </p>
      <div
        className="scroll-area-x flex gap-2 overflow-x-auto pb-1"
        role="list"
        aria-label="Dịch vụ được gợi ý"
      >
        {services.map(service => {
          const price = formatServicePrice(service);
          const name = service.name ?? 'Dịch vụ';
          const vendorName = service.vendorName ?? (service.suggestionType === 'vendor' ? name : null);
          const location = service.vendorAddress ?? 'Chưa cập nhật địa chỉ';
          const card = (
            <>
              <div className="h-20 w-full overflow-hidden rounded-lg bg-surface-soft">
                <img
                  src={service.vendorImageUrl || service.thumbnailUrl || FALLBACK_VENDOR_IMAGE}
                  alt={vendorName ? `Hình ảnh ${vendorName}` : name}
                  loading="lazy"
                  onError={event => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = FALLBACK_VENDOR_IMAGE;
                  }}
                  className="h-full w-full object-cover"
                />
              </div>
              <p className="mt-2 line-clamp-2 text-xs font-semibold text-ink">{name}</p>
              {vendorName && service.suggestionType !== 'vendor' && (
                <p className="mt-0.5 truncate text-[11px] font-medium text-sage">{vendorName}</p>
              )}
              {service.vendorId && (
                <p className="mt-1 flex items-start gap-1 text-[10px] leading-snug text-muted">
                  <MapPin strokeWidth={1.75} className="mt-0.5 h-3 w-3 shrink-0 text-rose-deep" />
                  <span className="line-clamp-2">{location}</span>
                </p>
              )}
              {price && <p className="mt-0.5 font-mono text-xs font-semibold text-forest">{price}</p>}
            </>
          );

          const shared =
            'w-36 flex-shrink-0 rounded-lg border border-hairline bg-canvas p-2 transition-all duration-150';

          return (
            <div role="listitem" key={service.id}>
              {service.vendorId ? (
                <Link
                  to={ROUTES.vendorDetail(service.vendorId)}
                  className={`${shared} block hover:border-rose hover:shadow-subtle focus:outline-none focus:ring-2 focus:ring-rose/40`}
                  title={name}
                >
                  {card}
                </Link>
              ) : (
                <div className={shared} title={name}>
                  {card}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
