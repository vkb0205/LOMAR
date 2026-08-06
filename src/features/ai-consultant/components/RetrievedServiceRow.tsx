import { Link } from 'react-router-dom';
import { RetrievedService } from '../types';
import { ROUTES } from '../../../shared/config/routes';

const FALLBACK_THUMBNAIL =
    'https://images.unsplash.com/photo-1595000072051-5afcb1eef556?auto=format&fit=crop&q=80&w=600';

/**
 * The two chat surfaces use different palettes — the AI consultant page is
 * rose-on-white, the services page is gold-on-cream. The row adapts rather than
 * imposing one look on both.
 */
type RetrievedServiceRowVariant = 'rose' | 'sand';

const VARIANT_STYLES: Record<
    RetrievedServiceRowVariant,
    { container: string; label: string; card: string; price: string; focus: string }
> = {
    rose: {
        container: 'border-t border-gray-100 bg-gray-50/50',
        label: 'text-gray-500',
        card: 'border-gray-100 bg-white',
        price: 'text-rose-600',
        focus: 'focus:ring-rose-300',
    },
    sand: {
        container: 'border-t border-[#ffdb9f]/30 bg-white/50 backdrop-blur-md',
        label: 'text-[#6B92B4]',
        card: 'border-[#ffdb9f]/30 bg-white',
        price: 'text-[#1B2C40]',
        focus: 'focus:ring-[#ffdb9f]',
    },
};

interface RetrievedServiceRowProps {
    services: RetrievedService[];
    variant?: RetrievedServiceRowVariant;
}

function formatPrice(service: RetrievedService): string | null {
    if (typeof service.basePrice !== 'number' || Number.isNaN(service.basePrice)) return null;
    // Catalog prices are VND; the currency column is shown as-is when present so
    // a future non-VND listing is not silently mislabelled.
    return `${service.basePrice.toLocaleString('vi-VN')} ${service.currency ?? 'VND'}`;
}

/**
 * Horizontal strip of products the assistant retrieved for the latest answer.
 *
 * This row is the only place catalog imagery and links appear in the chat, so
 * the assistant's prose can stay conversational and free of raw URLs.
 */
export function RetrievedServiceRow({
    services,
    variant = 'rose',
}: RetrievedServiceRowProps) {
    if (services.length === 0) return null;

    const styles = VARIANT_STYLES[variant];

    return (
        <div className={`${styles.container} px-4 py-3`}>
            <p className={`text-[11px] font-semibold uppercase tracking-wider ${styles.label} mb-2`}>
                Dịch vụ gợi ý ({services.length})
            </p>
            <div
                className="flex gap-3 overflow-x-auto pb-1"
                // Native horizontal scrolling is reachable by keyboard and touch; a
                // labelled list keeps the cards announced as a group by screen readers.
                role="list"
                aria-label="Dịch vụ được gợi ý"
            >
                {services.map(service => {
                    const price = formatPrice(service);
                    const name = service.name ?? 'Dịch vụ';

                    // Without a vendor there is no destination, so the card renders as a
                    // non-interactive tile rather than a link that goes nowhere.
                    const card = (
                        <>
                            <div className="h-20 w-full overflow-hidden rounded-xl bg-gray-100">
                                <img
                                    src={service.thumbnailUrl || FALLBACK_THUMBNAIL}
                                    alt={name}
                                    loading="lazy"
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <p className="mt-2 line-clamp-2 text-xs font-semibold text-gray-900">{name}</p>
                            {price && <p className={`mt-0.5 text-xs font-bold ${styles.price}`}>{price}</p>}
                        </>
                    );

                    const shared = `w-36 flex-shrink-0 rounded-2xl border p-2 ${styles.card}`;

                    return (
                        <div role="listitem" key={service.id}>
                            {service.vendorId ? (
                                <Link
                                    to={ROUTES.vendorDetail(service.vendorId)}
                                    className={`${shared} block transition-shadow hover:shadow-md focus:outline-none focus:ring-2 ${styles.focus}`}
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
