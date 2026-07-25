import { Database } from '../../../shared/types/database';
import { supabase, withAuthHeaders } from '../../../shared/api/supabaseClient';
import { resolveBackendEndpoint } from '../../../shared/api/backendConfig';
import { ServiceRow, VendorRow } from '../types';
import { PLACEHOLDER_IMAGE } from './customizeCatalogService';
import { getTryOnCategory } from '../utils/category';

export interface GeneratePreviewInput {
  activeTab: string;
  activeService: ServiceRow;
  currentMainImage: string;
  customPrompt: string;
  mannequinImage: string;
  vendorInfo: VendorRow | null;
}

export interface GeneratePreviewResult {
  imageUrl: string;
  message: string;
}

export function buildGenerationPrompt({
  activeTab,
  activeService,
  customPrompt,
  vendorInfo,
}: Pick<GeneratePreviewInput, 'activeTab' | 'activeService' | 'customPrompt' | 'vendorInfo'>): string {
  return [
    `Create a premium wedding customization preview for category: ${activeTab}.`,
    activeService.name ? `Base product: ${activeService.name}.` : '',
    vendorInfo?.name ? `Vendor: ${vendorInfo.name}.` : '',
    customPrompt ? `User request: ${customPrompt}.` : '',
    'Style: elegant, realistic, romantic, luxury Vietnamese wedding aesthetic, high quality image preview.',
  ].filter(Boolean).join(' ');
}

export async function fetchImageBlob(url: string, label: string): Promise<Blob> {
  const isExternal = url.startsWith('http') || url.startsWith('data:');
  let resolvedUrl: string;

  if (isExternal) {
    if (url.startsWith('data:')) {
      resolvedUrl = url;
    } else {
      resolvedUrl = `${resolveBackendEndpoint('/proxy-image')}?url=${encodeURIComponent(url)}`;
    }
  } else {
    resolvedUrl = new URL(url, window.location.origin).href;
  }

  const response = await fetch(resolvedUrl);
  if (!response.ok) {
    throw new Error(`Cannot fetch ${label} image (${response.status} ${response.statusText}): ${resolvedUrl}`);
  }

  return response.blob();
}

export async function generateCustomizePreview(input: GeneratePreviewInput): Promise<GeneratePreviewResult> {
  const endpoint = resolveVtonUploadEndpoint();
  const [bodyBlob, garmentBlob] = await Promise.all([
    fetchImageBlob(input.mannequinImage, 'mannequin'),
    fetchImageBlob(input.currentMainImage || PLACEHOLDER_IMAGE, 'garment'),
  ]);

  const formData = new FormData();
  formData.append('body_image', bodyBlob, 'body.png');
  formData.append('garment_image', garmentBlob, 'garment.png');
  formData.append('category', getTryOnCategory(input.activeTab));
  formData.append('prompt', buildGenerationPrompt(input));

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: await withAuthHeaders({}),
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`VTON backend error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const imageUrl = data.imageUrl || data.image_url || data.output?.imageUrl || data.output?.image_url;

  if (!imageUrl) {
    throw new Error(`VTON response did not include an image URL: ${JSON.stringify(data)}`);
  }

  return {
    imageUrl,
    message: data.message || 'Bé Song đã tạo ảnh thử đồ trên mannequin từ mẫu bạn chọn.',
  };
}

export function resolveVtonUploadEndpoint(): string {
  const configuredEndpoint = import.meta.env.VITE_VTON_ENDPOINT || '/test-try-on-upload';
  const endpointPath = configuredEndpoint.startsWith('/') ? configuredEndpoint : `/${configuredEndpoint}`;

  return endpointPath.startsWith('/test-') ? resolveBackendEndpoint(endpointPath as `/${string}`) : configuredEndpoint;
}

export async function saveDesignProject(
  userId: string,
  activeTab: string,
  activeService: ServiceRow
): Promise<void> {
  const designPayload: Database['public']['Tables']['ai_design_projects']['Insert'] = {
    user_id: userId,
    category: activeTab,
    service_id: activeService.id,
    title: activeService.name || 'Untitled design',
    status: 'draft',
  };

  await supabase
    .from('ai_design_projects')
    .insert<Database['public']['Tables']['ai_design_projects']['Insert']>(designPayload);
}
