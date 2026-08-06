import { getJson, postJsonTyped } from '../../../shared/api/backendClient';
import { resolveDataEndpoint } from '../../../shared/api/backendConfig';
import { ChatBubbleMessage } from '../types';

export const MOCK_THREAD_ID = '00000000-0000-0000-0000-000000000000';

interface ChatMessageResponse {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  suggestedServiceId?: string | null;
}

async function ensureThread(): Promise<string> {
  const { threadId } = await postJsonTyped<{ threadId: string }>(
    resolveDataEndpoint('/api/v1/chat/threads'),
    { body: { contextType: 'consultant' } }
  );
  return threadId;
}

export async function fetchConsultantMessages(_userId: string): Promise<ChatMessageResponse[]> {
  // Existing UI has no persisted thread identifier. The backend thread-create
  // endpoint is the source of truth; callers can pass/store returned IDs when
  // they need multiple independent chat sessions.
  const threadId = await ensureThread();
  const { messages } = await getJson<{ messages: ChatMessageResponse[] }>(
    resolveDataEndpoint(`/api/v1/chat/threads/${encodeURIComponent(threadId)}/messages`)
  );
  return messages;
}

export async function insertConsultantMessage(
  _userId: string | null,
  role: 'user' | 'assistant',
  content: string,
  suggestedServiceId?: string | null
): Promise<void> {
  if (!_userId || role !== 'user') return;
  const threadId = await ensureThread();
  await postJsonTyped(
    resolveDataEndpoint(`/api/v1/chat/threads/${encodeURIComponent(threadId)}/messages`),
    { body: { content, suggestedServiceId } }
  );
}
