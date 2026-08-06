import { getJson } from '../../../shared/api/backendClient';
import { resolveDataEndpoint } from '../../../shared/api/backendConfig';
import { ServiceRow } from '../types';

const SERVICE_CATEGORY_KEYWORDS: Array<{ category: string; keywords: string[] }> = [
  { category: 'Váy Cưới', keywords: ['váy', 'cưới'] },
  { category: 'Vest', keywords: ['vest'] },
  { category: 'Venue', keywords: ['venue', 'nhà hàng'] },
  { category: 'Trang Trí', keywords: ['trang trí'] },
];

function inferServiceCategory(input: string): string {
  const lowerInput = input.toLowerCase();
  return SERVICE_CATEGORY_KEYWORDS.find(({ keywords }) =>
    keywords.some(keyword => lowerInput.includes(keyword))
  )?.category ?? '';
}

export async function findSuggestedServiceId(input: string): Promise<string | null> {
  const queryCategory = inferServiceCategory(input);
  if (!queryCategory) return null;

  try {
    const { services } = await getJson<{ services: ServiceRow[] }>(
      resolveDataEndpoint('/api/v1/catalog/customize')
    );
    return services.find(service => service.category === queryCategory)?.id ?? null;
  } catch {
    return null;
  }
}

export async function fetchSuggestedService(serviceId: string): Promise<ServiceRow | null> {
  try {
    const { service } = await getJson<{ service: ServiceRow }>(
      resolveDataEndpoint(`/api/v1/catalog/services/${encodeURIComponent(serviceId)}/suggestion`)
    );
    return service ?? null;
  } catch {
    return null;
  }
}
