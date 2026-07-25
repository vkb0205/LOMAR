import { Database } from '../../../shared/types/database';
import { supabase } from '../../../shared/api/supabaseClient';
import { ChatBubbleMessage, ChatMessageRow } from '../types';

export const MOCK_THREAD_ID = '00000000-0000-0000-0000-000000000000';

export async function fetchCustomizeChat(userId: string): Promise<ChatBubbleMessage[]> {
  const { data } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (!data || data.length === 0) return [];

  return (data as ChatMessageRow[]).map(message => ({
    text: message.content || '',
    isUser: message.role === 'user',
  }));
}

export async function insertCustomizeChatMessage(
  userId: string | null,
  role: string,
  content: string
): Promise<void> {
  if (!userId) return;

  const payload: Database['public']['Tables']['chat_messages']['Insert'] = {
    thread_id: MOCK_THREAD_ID,
    user_id: userId,
    role,
    content,
  };

  await supabase
    .from('chat_messages')
    .insert<Database['public']['Tables']['chat_messages']['Insert']>(payload);
}

export function buildCustomizeGreeting(activeTab: string): ChatBubbleMessage[] {
  return [
    { text: `Mẫu ${activeTab.toLowerCase()} trong mơ của bạn như thế nào nhỉ ?`, isUser: false },
    {
      text: `Hãy tự thiết kế ${activeTab.toLowerCase()} của bạn bằng các công cụ bên trái nha! Bé Song sẽ gợi ý lựa chọn phù hợp cho bạn nè!`,
      isUser: false,
    },
  ];
}
