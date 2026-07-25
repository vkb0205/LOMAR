import { supabase } from '../../../shared/api/supabaseClient';
import type { VendorDetailService, VendorDetailVendor } from '../types';

export interface VendorDetailData {
  vendor: VendorDetailVendor;
  services: VendorDetailService[];
}

export async function fetchVendorDetail(vendorId: string): Promise<VendorDetailData> {
  const { data: vendorData, error: vendorError } = await supabase
    .from('vendors')
    .select('*')
    .eq('id', vendorId)
    .single();

  if (vendorError) throw vendorError;

  const { data: servicesData, error: servicesError } = await supabase
    .from('services')
    .select('*')
    .eq('vendor_id', vendorId);

  if (servicesError) throw servicesError;

  return {
    vendor: vendorData,
    services: servicesData || [],
  };
}
