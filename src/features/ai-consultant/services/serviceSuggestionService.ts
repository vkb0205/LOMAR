import { supabase } from '../../../shared/api/supabaseClient';
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
    const { data } = await supabase
      .from('services')
      .select('*')
      .eq('category', queryCategory)
      .limit(1)
      .single();

    return data ? (data as ServiceRow).id : null;
  } catch (error) {
    console.error('Error fetching suggestion', error);
    return null;
  }
}

export async function fetchSuggestedService(serviceId: string): Promise<ServiceRow | null> {
  const { data } = await supabase
    .from('services')
    .select('*')
    .eq('id', serviceId)
    .single();

  return data ? (data as ServiceRow) : null;
}
