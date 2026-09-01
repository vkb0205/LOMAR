import { resolveAgentEndpoint } from '../../../shared/api/agentConfig';
import { getAccessToken } from '../../../shared/api/supabaseClient';
import {
  ConsultHistoryMessage,
  ConsultReplyResult,
  ConsultResponse,
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

export async function requestConsultReply(
  message: string,
  history: ConsultHistoryMessage[] = [],
): Promise<ConsultReplyResult> {
  const trimmedHistory = history
    .filter(entry => entry.content.trim().length > 0)
    .slice(-MAX_HISTORY_TURNS);
  const sessionId = readSessionId();

  const accessToken = await getAccessToken();
  const response = await fetch(resolveAgentEndpoint('/api/v1/agents/consultant/execute'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify({
      session_id: sessionId,
      input: {
        message,
        ...(sessionId ? { sessionId } : {}),
        ...(trimmedHistory.length > 0 ? { history: trimmedHistory } : {}),
      },
    }),
  });

  if (!response.ok) {
    let detail: unknown = null;
    try {
      detail = await response.json();
    } catch {
      // Keep the user-facing fallback stable when the Agent Service returns a
      // non-JSON error such as a gateway/proxy response.
    }
    console.error('Agent Service consultant endpoint returned non-OK status', {
      status: response.status,
      detail,
    });
    return { reply: CONSULT_FALLBACK_MESSAGE };
  }

  const envelope = (await response.json()) as { output?: ConsultResponse };
  const body = envelope.output;

  saveSessionId(body?.sessionId);
  return {
    reply: body?.reply?.trim() || CONSULT_FALLBACK_MESSAGE,
  };
}

export const CONSULT_NETWORK_FALLBACK_MESSAGE =
  'Mình xin lỗi, hiện tại chưa thể kết nối tới trợ lý AI. Vui lòng thử lại sau hoặc duyệt danh mục dịch vụ của Phố Hạnh Phúc nhé!';
