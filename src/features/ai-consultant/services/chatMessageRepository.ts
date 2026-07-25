import { supabase } from '../../../shared/api/supabaseClient';
import { ChatMessageInsert, ChatMessageRow, ConsultantMessage } from '../types';

export const MOCK_THREAD_ID = '00000000-0000-0000-0000-000000000000';

export async function fetchConsultantMessages(userId: string): Promise<ConsultantMessage[]> {
  const { data } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (!data || data.length === 0) return [];

  return (data as ChatMessageRow[]).map(message => ({
    id: message.id.toString(),
    role: message.role as 'user' | 'assistant',
    content: message.content || '',
    suggested_service_id: message.suggested_service_id,
  }));
}

export async function insertConsultantMessage(
  userId: string | null,
  role: 'user' | 'assistant',
  content: string,
  suggestedServiceId?: string | null
): Promise<void> {
  if (!userId) return;

  const payload: ChatMessageInsert = {
    thread_id: MOCK_THREAD_ID,
    user_id: userId,
    role,
    content,
    suggested_service_id: suggestedServiceId,
  };

  await supabase
    .from('chat_messages')
    .insert<ChatMessageInsert>(payload);
}
