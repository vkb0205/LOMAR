import { resolveDataEndpoint } from '../../../shared/api/backendConfig';
import { postJsonTyped } from '../../../shared/api/backendClient';
import {
  ConsultHistoryMessage,
  ConsultReplyResult,
  ConsultResponse,
  RetrievedService,
} from '../types';

const CONSULT_FALLBACK_MESSAGE =
  'Mình xin lỗi, hiện tại chưa thể trả lời câu hỏi của bạn. Vui lòng thử lại sau hoặc duyệt danh mục dịch vụ của Phố Hạnh Phúc nhé!';

/**
 * Turns of context sent with each request. The backend re-clamps this, so the
 * limit here is about payload size rather than trust. Server-side session
 * memory is authoritative once a session id exists.
 */
const MAX_HISTORY_TURNS = 10;
const SESSION_STORAGE_KEY = 'lomar.ai-consultant.session-id';

function readSessionId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.sessionStorage.getItem(SESSION_STORAGE_KEY);
  } catch {
    // Storage can be disabled by browser privacy settings. The endpoint still
    // works; only continuity for the tab is lost.
    return null;
  }
}

function saveSessionId(sessionId: string | undefined): void {
  if (!sessionId || typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  } catch {
    // Non-fatal: backend memory remains available for the current response.
  }
}

/**
 * Keep only rows the card row can actually render.
 *
 * An entry with no `id` has no stable key and no link target, so it is dropped
 * rather than rendered as a dead card. The backend already filters these; this
 * is defence against a older/newer server shape, not redundancy.
 */
function normalizeRetrievedServices(raw: unknown): RetrievedService[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (item): item is RetrievedService =>
      typeof item === 'object' && item !== null && typeof (item as RetrievedService).id === 'string',
  );
}

export async function requestConsultReply(
  message: string,
  history: ConsultHistoryMessage[] = [],
): Promise<ConsultReplyResult> {
  const trimmedHistory = history
    .filter(entry => entry.content.trim().length > 0)
    .slice(-MAX_HISTORY_TURNS);
  const sessionId = readSessionId();

  const response = await postJsonTyped<ConsultResponse>(resolveDataEndpoint('/api/v1/chat/consult'), {
    body: {
      message,
      ...(sessionId ? { sessionId } : {}),
      ...(trimmedHistory.length > 0 ? { history: trimmedHistory } : {}),
    },
  });

  saveSessionId(response.sessionId ?? undefined);
  return {
    reply: response.reply?.trim() || CONSULT_FALLBACK_MESSAGE,
    retrievedServices: normalizeRetrievedServices(response.retrievedServices),
  };
}

export const CONSULT_NETWORK_FALLBACK_MESSAGE =
  'Mình xin lỗi, hiện tại chưa thể kết nối tới trợ lý AI. Vui lòng thử lại sau hoặc duyệt danh mục dịch vụ của Phố Hạnh Phúc nhé!';
