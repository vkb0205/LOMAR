import { getJson } from '../../../shared/api/backendClient';
import { resolveDataEndpoint } from '../../../shared/api/backendConfig';

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

interface MapVendorResponse {
  vendors: MapVendor[];
}

/**
 * The backend owns the public map catalog. It returns the reviewed address
 * coordinates together with the basic vendor data used by the map card.
 */
export async function fetchMapVendors(): Promise<MapVendor[]> {
  const response = await getJson<MapVendorResponse>(
    resolveDataEndpoint('/api/v1/catalog/map/vendors'),
  );
  return response.vendors;
}
