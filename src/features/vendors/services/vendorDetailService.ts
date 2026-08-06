import { getJson } from '../../../shared/api/backendClient';
import { resolveDataEndpoint } from '../../../shared/api/backendConfig';
import type { VendorDetailService, VendorDetailVendor } from '../types';

export interface VendorDetailData {
  vendor: VendorDetailVendor;
  services: VendorDetailService[];
}

export async function fetchVendorDetail(vendorId: string): Promise<VendorDetailData> {
  return getJson<VendorDetailData>(
    resolveDataEndpoint(`/api/v1/catalog/vendors/${encodeURIComponent(vendorId)}`)
  );
}
