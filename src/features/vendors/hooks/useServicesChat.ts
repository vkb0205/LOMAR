import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import {
  CONSULT_NETWORK_FALLBACK_MESSAGE,
  requestConsultReply,
} from '../../ai-consultant/services/aiConsultantService';
import {
  fetchConsultantMessages,
  insertConsultantMessage,
} from '../../ai-consultant/services/chatMessageRepository';
import type { ConsultantMessage, RetrievedService } from '../../ai-consultant/types';

function buildDefaultMessage(userName?: string | null): ConsultantMessage {
  return {
    id: 'default',
    role: 'assistant',
    content: `Chào ${userName || 'bạn'}! Mình là AI Consultant của Phố Hạnh Phúc. Bạn cần tìm dịch vụ nào trong danh sách bên trái?`,
  };
}

export function useServicesChat() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [messages, setMessages] = useState<ConsultantMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  // Products behind the latest answer. A turn that retrieves nothing (a
  // clarifying question, a follow-up answered from history) keeps the previous
  // row on screen — the user is usually still choosing among those cards.
  const [retrievedServices, setRetrievedServices] = useState<RetrievedService[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;

    async function loadMessages() {
      if (!userId) {
        if (active) setMessages([buildDefaultMessage(null)]);
        return;
      }

      const chatHistory = await fetchConsultantMessages(userId);
      if (!active) return;

      setMessages(chatHistory.length > 0 ? chatHistory : [buildDefaultMessage(user?.name)]);
    }

    void loadMessages();
    return () => {
      active = false;
    };
  }, [userId, user]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    const content = inputValue.trim();
    if (!content || isGenerating) return;

    const userMessage: ConsultantMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
    };

    setMessages(previous => [...previous, userMessage]);
    setInputValue('');
    setIsGenerating(true);

    await insertConsultantMessage(userId, 'user', content);

    try {
      const { reply, retrievedServices: turnServices } = await requestConsultReply(content);
      const assistantMessage: ConsultantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: reply,
      };
      setMessages(previous => [...previous, assistantMessage]);
      if (turnServices.length > 0) setRetrievedServices(turnServices);
      await insertConsultantMessage(userId, 'assistant', reply);
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
      setIsGenerating(false);
    }
  };

  return {
    chatContainerRef,
    inputValue,
    isGenerating,
    messages,
    onGenerate: handleSend,
    retrievedServices,
    setInputValue,
  };
}
