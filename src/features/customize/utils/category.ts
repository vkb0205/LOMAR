import { ServiceRow } from '../types';

export const ALLOWED_CUSTOMIZE_CATEGORIES = ['Váy Cưới', 'Vest', 'Venue'];

export function isServiceInCategory(service: ServiceRow, category: string): boolean {
  return service.category?.toLowerCase() === category.toLowerCase();
}

export function getTryOnCategory(categoryName: string): string {
  const normalized = categoryName.toLowerCase();
  if (normalized.includes('vest')) return 'tops';
  if (normalized.includes('váy') || normalized.includes('vay') || normalized.includes('dress')) return 'dress';
  return 'clothes';
}
