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

export interface ConsultResponse {
  reply?: string;
}
