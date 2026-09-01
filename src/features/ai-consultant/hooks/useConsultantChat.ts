import { FormEvent, useEffect, useRef, useState } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import {
  CONSULT_NETWORK_FALLBACK_MESSAGE,
  requestConsultReply,
} from '../services/aiConsultantService';
import { fetchConsultantMessages, insertConsultantMessage } from '../services/chatMessageRepository';
import type { ConsultantMessage, RetrievedService } from '../types';

export type ConsultantGreeting = 'services';

function buildDefaultMessage(
  greeting: ConsultantGreeting,
  userName?: string | null,
): ConsultantMessage {
  const name = userName || 'bạn';
  if (greeting === 'services') {
    return {
      id: 'default',
      role: 'assistant',
      content: `Chào ${name}! Mình là Bé Song Hỷ. Bạn cần tìm dịch vụ nào trong danh sách bên trái?`,
    };
  }
  return {
    id: 'default',
    role: 'assistant',
    content: `Chào ${name}! Mình là Bé Song Hỷ — trợ lý AI của Phố Hạnh Phúc. Bạn đang tìm Váy Cưới, Dịch Vụ Khám Sức Khỏe hay Studio Chụp Ảnh?`,
  };
}

/** Chat controller for embedded assistant surfaces (e.g. services sidebar). */
export function useConsultantChat(greeting: ConsultantGreeting = 'services') {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [messages, setMessages] = useState<ConsultantMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [retrievedServices, setRetrievedServices] = useState<RetrievedService[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;

    async function loadMessages() {
      if (!userId) {
        if (active) setMessages([buildDefaultMessage(greeting, null)]);
        return;
      }

      const chatHistory = await fetchConsultantMessages(userId);
      if (!active) return;

      setMessages(
        chatHistory.length > 0
          ? chatHistory
          : [buildDefaultMessage(greeting, user?.name)],
      );
    }

    void loadMessages();
    return () => {
      active = false;
    };
  }, [userId, user?.name, greeting]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    const el = scrollContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isTyping]);

  const sendMessage = async (raw?: string) => {
    const content = (raw ?? input).trim();
    if (!content || isTyping) return;

    const userMessage: ConsultantMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
    };

    setMessages(previous => [...previous, userMessage]);
    setInput('');
    setIsTyping(true);

    await insertConsultantMessage(userId, 'user', content);

    try {
      const history = [...messages, userMessage]
        .filter(m => m.id !== 'default' && m.content.trim())
        .slice(-10)
        .map(m => ({ role: m.role, content: m.content }));
      const { reply, retrievedServices: turnServices } = await requestConsultReply(content, history);
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
      setIsTyping(false);
    }
  };

  const submitMessage = async (event: FormEvent) => {
    event.preventDefault();
    await sendMessage();
  };

  return {
    input,
    isTyping,
    messages,
    messagesEndRef,
    scrollContainerRef,
    retrievedServices,
    setInput,
    sendMessage,
    submitMessage,
  };
}
