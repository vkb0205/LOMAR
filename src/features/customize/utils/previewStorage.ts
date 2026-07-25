export const CUSTOMIZE_TEMP_PREVIEW_KEY = 'lomar_customize_temp_preview';

export function getTempPreviewKey(
  tab: string,
  productId: string | undefined,
  mannequin: string
): string {
  return [tab, productId, mannequin].filter(Boolean).join('__');
}

export function readTempPreviewMap(): Record<string, string> {
  if (typeof window === 'undefined') return {};

  try {
    return JSON.parse(window.localStorage.getItem(CUSTOMIZE_TEMP_PREVIEW_KEY) || '{}') as Record<string, string>;
  } catch {
    return {};
  }
}

export function saveTempPreview(tempKey: string, imageUrl: string): void {
  if (typeof window === 'undefined' || !tempKey) return;

  try {
    window.localStorage.setItem(CUSTOMIZE_TEMP_PREVIEW_KEY, JSON.stringify({
      ...readTempPreviewMap(),
      [tempKey]: imageUrl,
    }));
  } catch (error) {
    console.error('Lỗi khi lưu ảnh tạm:', error);
  }
}
