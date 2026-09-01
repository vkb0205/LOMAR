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

/**
 * A catalog row the agent retrieved this turn, rendered as a product card.
 *
 * The reply text deliberately carries no image URLs or links; these rows are
 * the sole source for that presentation.
 */
export interface RetrievedService {
  id: string;
  name?: string | null;
  category?: string | null;
  basePrice?: number | null;
  currency?: string | null;
  thumbnailUrl?: string | null;
  vendorId?: string | null;
}

export interface ConsultResponse {
  reply?: string;
  sessionId?: string | null;
  retrievedServices?: RetrievedService[];
  toolsUsed?: string[];
  degraded?: boolean;
}

/** Result of one consult turn: prose plus the products behind it. */
export interface ConsultReplyResult {
  reply: string;
  retrievedServices: RetrievedService[];
}
