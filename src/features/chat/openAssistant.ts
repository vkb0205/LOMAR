/** Cross-surface signal to open the floating Bé Song Hỷ assistant. */
export const OPEN_ASSISTANT_EVENT = 'lomar:open-assistant';

export type OpenAssistantDetail = {
  /** Optional draft to prefill the composer when the panel opens. */
  prompt?: string;
};

export function openContextualAssistant(detail?: OpenAssistantDetail): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<OpenAssistantDetail>(OPEN_ASSISTANT_EVENT, { detail }));
}
