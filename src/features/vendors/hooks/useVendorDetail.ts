import { useEffect, useState } from 'react';
import type { VendorDetailService, VendorDetailVendor } from '../types';
import { fetchVendorDetail } from '../services/vendorDetailService';

export function useVendorDetail(vendorId?: string) {
  const [vendor, setVendor] = useState<VendorDetailVendor | null>(null);
  const [services, setServices] = useState<VendorDetailService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadVendor() {
      if (!vendorId) {
        setVendor(null);
        setServices([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await fetchVendorDetail(vendorId);
        if (!active) return;
        setVendor(data.vendor);
        setServices(data.services);
      } catch (error) {
        console.error('Error fetching vendor details:', error);
        if (!active) return;
        setVendor(null);
        setServices([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadVendor();

    return () => {
      active = false;
    };
  }, [vendorId]);

  return { loading, services, vendor };
}
