import { getJson } from '../../../shared/api/backendClient';
import { resolveDataEndpoint } from '../../../shared/api/backendConfig';
import type { VendorCardModel } from '../types';

const DEFAULT_CATEGORIES = ['Tất Cả', 'Váy Cưới', 'Chụp Ảnh', 'Địa Điểm', 'Trang Trí', 'Trang Điểm'];

export function getDefaultVendorCategories() {
  return DEFAULT_CATEGORIES;
}

export function mapExternalCategory(category: string) {
  const normalized = category.toLowerCase().trim();
  if (normalized === 'trang điểm') return 'Make Up';
  if (normalized === 'chụp ảnh') return 'Studio';
  if (normalized === 'sức khỏe' || normalized === 'y tế') return 'Sức Khỏe';
  if (normalized === 'quà tặng') return 'Thiệp Cưới';
  return category;
}

export function deriveVendorCategories(vendors: VendorCardModel[]) {
  const rawCategories = [...new Set(vendors.map(vendor => vendor.category).filter(Boolean))];
  const hasOther = rawCategories.includes('Khác');
  return ['Tất Cả', ...rawCategories.filter(category => category !== 'Khác'), ...(hasOther ? ['Khác'] : [])];
}

export function filterVendors(vendors: VendorCardModel[], activeCategory: string, searchTerm: string) {
  const normalizedSearch = searchTerm.toLowerCase();
  return vendors.filter(vendor => {
    const matchesCategory = activeCategory === 'Tất Cả' || vendor.category === activeCategory;
    const matchesSearch =
      vendor.name.toLowerCase().includes(normalizedSearch) ||
      vendor.category.toLowerCase().includes(normalizedSearch) ||
      Boolean(vendor.addr?.toLowerCase().includes(normalizedSearch));
    return matchesCategory && matchesSearch;
  });
}

export async function fetchVendorCatalog(): Promise<VendorCardModel[]> {
  const { vendors } = await getJson<{ vendors: VendorCardModel[] }>(
    resolveDataEndpoint('/api/v1/catalog/vendors')
  );
  return vendors;
}
