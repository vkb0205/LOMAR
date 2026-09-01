import { Database } from '../../shared/types/database';

export type ChatMessageRow = Database['public']['Tables']['chat_messages']['Row'];
export type ChatMessageInsert = Database['public']['Tables']['chat_messages']['Insert'];
export type ServiceRow = Database['public']['Tables']['services']['Row'];

export interface ConsultantMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggested_service_id?: string | null;
}

export interface ConsultHistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ConsultResponse {
  reply?: string;
  /** Server-generated id for the process-local prototype session memory. */
  sessionId?: string;
  /** Names of catalog tools the agent invoked. Diagnostic only. */
  toolsUsed?: string[];
}

export interface ConsultReplyResult { reply: string }
