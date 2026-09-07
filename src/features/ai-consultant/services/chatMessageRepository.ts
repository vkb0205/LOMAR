import { getJson, postJsonTyped } from '../../../shared/api/backendClient';
import type { RetrievedService } from '../types';
import { resolveDataEndpoint } from '../../../shared/api/backendConfig';

export const MOCK_THREAD_ID = '00000000-0000-0000-0000-000000000000';

export interface ChatMessageResponse {
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

interface ChatThreadSummary {
  id: string;
  contextType?: string | null;
  updatedAt?: string | null;
}

interface ChatThreadsResponse {
  threads: ChatThreadSummary[];
}

/**
 * Resolve the caller's existing consultant thread, or create one when none
 * exists yet. Reusing the same thread is what lets a logged-in couple keep
 * their conversation after a page reload.
 */
async function resolveConsultantThread(): Promise<string> {
  const { threads } = await getJson<ChatThreadsResponse>(
    resolveDataEndpoint('/api/v1/chat/threads?context_type=general')
  );
  const existing = threads[0];
  if (existing?.id) return existing.id;

  const { threadId } = await postJsonTyped<{ threadId: string }>(
    resolveDataEndpoint('/api/v1/chat/threads'),
    { body: { contextType: 'general' } }
  );
  return threadId;
}

export async function fetchConsultantMessages(_userId: string): Promise<ChatMessageResponse[]> {
  const threadId = await resolveConsultantThread();
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

export interface ChatExchangeResponse {
  userMessage: ChatMessageResponse;
  assistantMessage: ChatMessageResponse;
  persisted: boolean;
  retrievedServices: RetrievedService[];
}

/**
 * Send a message through the durable consultant thread. The backend stores the
 * user message, generates the assistant reply, stores it, and returns both.
 */
export async function sendConsultantMessage(
  content: string,
  suggestedServiceId?: string | null
): Promise<ChatExchangeResponse> {
  const threadId = await resolveConsultantThread();
  return postJsonTyped<ChatExchangeResponse>(
    resolveDataEndpoint(`/api/v1/chat/threads/${encodeURIComponent(threadId)}/messages`),
    { body: { content, suggestedServiceId } }
  );
}

