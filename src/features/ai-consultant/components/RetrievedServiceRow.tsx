import { Link } from 'react-router-dom';
import { ROUTES } from '../../../shared/config/routes';
import type { RetrievedService } from '../types';

const FALLBACK_THUMBNAIL =
  'https://images.unsplash.com/photo-1595000072051-5afcb1eef556?auto=format&fit=crop&q=80&w=600';

interface RetrievedServiceRowProps {
  services: RetrievedService[];
}

function formatPrice(service: RetrievedService): string | null {
  if (typeof service.basePrice !== 'number' || Number.isNaN(service.basePrice)) return null;
  return `${service.basePrice.toLocaleString('vi-VN')} ${service.currency ?? 'VND'}`;
}

/** Horizontal strip of catalog cards for the latest assistant answer. */
export function RetrievedServiceRow({ services }: RetrievedServiceRowProps) {
  if (services.length === 0) return null;

  return (
    <div className="border-t border-hairline bg-canvas px-4 py-3">
      <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.12em] text-sage">
        Dịch vụ gợi ý ({services.length})
      </p>
      <div
        className="scroll-area-x flex gap-2 overflow-x-auto pb-1"
        role="list"
        aria-label="Dịch vụ được gợi ý"
      >
        {services.map(service => {
          const price = formatPrice(service);
          const name = service.name ?? 'Dịch vụ';
          const card = (
            <>
              <div className="h-20 w-full overflow-hidden rounded-lg bg-surface-soft">
                <img
                  src={service.thumbnailUrl || FALLBACK_THUMBNAIL}
                  alt={name}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
              <p className="mt-2 line-clamp-2 text-xs font-semibold text-ink">{name}</p>
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
