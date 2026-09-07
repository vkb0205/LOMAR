export interface ServicePrice {
  basePrice?: number | null;
  maxPrice?: number | null;
  priceUnit?: string | null;
  priceDisplay?: string | null;
  currency?: string | null;
}

/**
 * Preserve authored catalog wording when available. Numeric formatting is a
 * safe fallback for legacy rows and API responses that omit price_display.
 */
export function formatServicePrice(price: ServicePrice): string | null {
  const display = price.priceDisplay?.trim();
  if (display) return display;

  if (typeof price.basePrice !== 'number' || Number.isNaN(price.basePrice)) {
    return null;
  }

  const currency = price.currency?.trim() || 'VND';
  const unit = price.priceUnit?.trim();
  const lower = price.basePrice.toLocaleString('vi-VN');
  const upper =
    typeof price.maxPrice === 'number' && !Number.isNaN(price.maxPrice)
      ? `–${price.maxPrice.toLocaleString('vi-VN')}`
      : '';

  return `${lower}${upper} ${currency}${unit ? `/${unit}` : ''}`;
}
