import type { Database } from '../../shared/types/database';

export type VendorDetailVendor = Database['public']['Tables']['vendors']['Row'];
export type VendorDetailService = Database['public']['Tables']['services']['Row'];

export interface VendorOpeningHour {
  day: string;
  open: string;
  close: string;
}

export interface VendorCardModel {
  id: string;
  name: string;
  category: string;
  rating: number;
  addr?: string;
  img?: string;
  hours?: VendorOpeningHour[];
}

export type VendorSortKey = 'featured' | 'rating' | 'name';
