import { supabase } from '../../../shared/api/supabaseClient';
import type { Database } from '../../../shared/types/database';

export interface MapVendor {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviews: number;
  priceRange: '$' | '$$' | '$$$' | null;
  lat: number;
  lng: number;
  address: string;
  description: string;
  specialties: string[];
  image: string | null;
  phone: string | null;
  hours: string | null;
}

type VendorRow = Database['public']['Tables']['vendors']['Row'];

type MapVendorRow = Pick<
  VendorRow,
  | 'id'
  | 'name'
  | 'category'
  | 'description'
  | 'address'
  | 'phone'
  | 'image_url'
  | 'rating_avg'
  | 'rating_count'
  | 'latitude'
  | 'longitude'
  | 'price_tier'
  | 'business_hours'
  | 'specialties'
>;

const MAP_VENDOR_FIELDS =
  'id,name,category,description,address,phone,image_url,rating_avg,rating_count,latitude,longitude,price_tier,business_hours,specialties' as const;

function toPriceRange(value: string | null): MapVendor['priceRange'] {
  return value === '$' || value === '$$' || value === '$$$' ? value : null;
}

function toMapVendor(row: MapVendorRow): MapVendor {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    rating: row.rating_avg,
    reviews: row.rating_count,
    priceRange: toPriceRange(row.price_tier),
    lat: row.latitude as number,
    lng: row.longitude as number,
    address: row.address ?? '',
    description: row.description ?? '',
    specialties: row.specialties ?? [],
    image: row.image_url,
    phone: row.phone,
    hours: row.business_hours,
  };
}

export async function fetchMapVendors(): Promise<MapVendor[]> {
  const { data, error } = await supabase
    .from('vendors')
    .select(MAP_VENDOR_FIELDS)
    .eq('status', 'active');
  if (error) throw error;

  return (data ?? [])
    .filter(row => row.latitude !== null && row.longitude !== null)
    .map(toMapVendor);
}
