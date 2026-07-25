import { supabase } from '../../../shared/api/supabaseClient';
import { CustomizeCatalog, ServiceImageRow, ServiceRow, VendorRow } from '../types';
import { ALLOWED_CUSTOMIZE_CATEGORIES, isServiceInCategory } from '../utils/category';

export const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1519225495810-7512c696505a?auto=format&fit=crop&q=80&w=1000';

export async function fetchCustomizeCatalog(): Promise<CustomizeCatalog | null> {
  const { data: serviceData } = await supabase.from('services').select('*');
  const { data: imageData } = await supabase.from('service_images').select('*');
  const { data: vendorData } = await supabase.from('vendors').select('*');

  if (!serviceData || serviceData.length === 0) return null;

  const services = serviceData as ServiceRow[];
  const vendorsById = buildVendorMap((vendorData || []) as VendorRow[]);
  const imagesByServiceId = buildServiceImageMap(services, (imageData || []) as ServiceImageRow[]);
  const discoveredTabs = Array.from(new Set(services.map(service => service.category).filter(Boolean))) as string[];
  const tabs = discoveredTabs.filter(category => ALLOWED_CUSTOMIZE_CATEGORIES.includes(category));

  return {
    services,
    vendorsById,
    imagesByServiceId,
    tabs: tabs.length > 0 ? tabs : ALLOWED_CUSTOMIZE_CATEGORIES,
  };
}

export function buildInitialActiveProductIds(
  tabs: string[],
  services: ServiceRow[],
  customizedServices: Record<string, { productId: string }>
): Record<string, string> {
  const initialActiveIds: Record<string, string> = {};

  tabs.forEach(category => {
    const saved = customizedServices[category];
    if (saved) {
      initialActiveIds[category] = saved.productId;
      return;
    }

    const firstService = services.find(service => isServiceInCategory(service, category));
    if (firstService) initialActiveIds[category] = firstService.id;
  });

  return initialActiveIds;
}

function buildVendorMap(vendors: VendorRow[]): Record<string, VendorRow> {
  return vendors.reduce<Record<string, VendorRow>>((vendorsById, vendor) => {
    vendorsById[vendor.id] = vendor;
    return vendorsById;
  }, {});
}

function buildServiceImageMap(
  services: ServiceRow[],
  serviceImages: ServiceImageRow[]
): Record<string, string[]> {
  return services.reduce<Record<string, string[]>>((imagesByServiceId, service) => {
    const orderedImages = serviceImages
      .filter(image => image.service_id === service.id)
      .sort((first, second) => Number(second.is_main) - Number(first.is_main))
      .map(image => image.image_url)
      .filter(Boolean);

    imagesByServiceId[service.id] = orderedImages.length > 0
      ? orderedImages
      : service.thumbnail_url
        ? [service.thumbnail_url]
        : [];

    return imagesByServiceId;
  }, {});
}
