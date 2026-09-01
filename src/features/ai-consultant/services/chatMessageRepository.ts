import { getJson, postJsonTyped } from '../../../shared/api/backendClient';
import { resolveDataEndpoint } from '../../../shared/api/backendConfig';

export const MOCK_THREAD_ID = '00000000-0000-0000-0000-000000000000';

interface ChatMessageResponse {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  suggestedServiceId?: string | null;
}

export interface ChatSession {
  id: string;
  title: string;
  messageCount: number;
  lastMessageAt: string;
  preview: string;
}

interface ChatSessionsResponse {
  sessions: ChatSession[];
}

async function ensureThread(): Promise<string> {
  const { threadId } = await postJsonTyped<{ threadId: string }>(
    resolveDataEndpoint('/api/v1/chat/threads'),
    { body: { contextType: 'consultant' } }
  );
  return threadId;
}

export async function fetchConsultantMessages(_userId: string): Promise<ChatMessageResponse[]> {
  const threadId = await ensureThread();
  const { messages } = await getJson<{ messages: ChatMessageResponse[] }>(
    resolveDataEndpoint(`/api/v1/chat/threads/${encodeURIComponent(threadId)}/messages`)
  );
  return messages;
}

export async function fetchChatSessions(userId: string): Promise<ChatSession[]> {
  if (!userId) return [];
  try {
    const { sessions } = await getJson<ChatSessionsResponse>(
      resolveDataEndpoint('/api/v1/chat/sessions')
    );
    return sessions;
  } catch (error) {
    console.error('Failed to fetch chat sessions', error);
    return [];
  }
}

export async function fetchSessionMessages(sessionId: string): Promise<ChatMessageResponse[]> {
  const { messages } = await getJson<{ messages: ChatMessageResponse[] }>(
    resolveDataEndpoint(`/api/v1/chat/sessions/${encodeURIComponent(sessionId)}/messages`)
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
