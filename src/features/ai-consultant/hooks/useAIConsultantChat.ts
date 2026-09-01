import { FormEvent, useEffect, useRef, useState } from 'react';
import type { UserProfile } from '../../auth/types';
import { CONSULT_NETWORK_FALLBACK_MESSAGE, requestConsultReply } from '../services/aiConsultantService';
import { fetchConsultantMessages, insertConsultantMessage } from '../services/chatMessageRepository';
import { fetchSuggestedService, findSuggestedServiceId } from '../services/serviceSuggestionService';
import { ConsultantMessage, ServiceRow } from '../types';

function buildDefaultMessage(user: UserProfile | null): ConsultantMessage {
  return {
    id: 'default',
    role: 'assistant',
    content: `Chào ${user ? user.name : 'bạn'}! Mình là AI Consultant của Phố Hạnh Phúc. Bạn đang tìm Váy Cưới, Dịch Vụ Khám Sức Khỏe hay Studio Chụp Ảnh?`,
  };
}

export function useAIConsultantChat(user: UserProfile | null) {
  const userId = user?.id ?? null;
  const [messages, setMessages] = useState<ConsultantMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestedService, setSuggestedService] = useState<ServiceRow | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;

    async function loadMessages() {
      if (!userId) {
        if (active) setMessages([buildDefaultMessage(null)]);
        return;
      }

      const chatHistory = await fetchConsultantMessages(userId);
      if (!active) return;

      setMessages(chatHistory.length > 0 ? chatHistory : [buildDefaultMessage(user)]);
    }

    void loadMessages();

    return () => {
      active = false;
    };
  }, [userId, user]);

  useEffect(() => {
    let active = true;

    async function loadSuggestedService() {
      const latestSuggestedId = [...messages]
        .reverse()
        .find(message => message.suggested_service_id)?.suggested_service_id;

      if (!latestSuggestedId) {
        if (active) setSuggestedService(null);
        return;
      }

      const service = await fetchSuggestedService(latestSuggestedId);
      if (active) setSuggestedService(service);
    }

    if (messages.length > 0) void loadSuggestedService();

    return () => {
      active = false;
    };
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const submitMessage = async (event: FormEvent) => {
    event.preventDefault();
    if (!input.trim()) return;

    const userContent = input;
    const userMessage: ConsultantMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userContent,
    };

    setMessages(previous => [...previous, userMessage]);
    setInput('');
    setIsTyping(true);

    await insertConsultantMessage(userId, 'user', userContent);

    try {
      // Backend session memory now owns continuity across turns. The optional
      // history argument remains available for callers that need bootstrap
      // recovery, but this hook no longer replays the visible transcript.
      const { reply } = await requestConsultReply(userContent);
      const suggestedServiceId = await findSuggestedServiceId(userContent);
      const assistantMessage: ConsultantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: reply,
        suggested_service_id: suggestedServiceId,
      };

      setMessages(previous => [...previous, assistantMessage]);
      await insertConsultantMessage(userId, 'assistant', reply, suggestedServiceId);
    } catch (error) {
      console.error('Consult request failed', error);
      setMessages(previous => [
        ...previous,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: CONSULT_NETWORK_FALLBACK_MESSAGE,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return {
    input,
    isTyping,
    messages,
    messagesEndRef,
    setInput,
    submitMessage,
    suggestedService,
  };
}
