import { FormEvent, useEffect, useRef, useState } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import {
  CONSULT_NETWORK_FALLBACK_MESSAGE,
  requestConsultReply,
} from '../services/aiConsultantService';
import { fetchConsultantMessages, sendConsultantMessage } from '../services/chatMessageRepository';
import type { ConsultantMessage, RetrievedService } from '../types';

export type ConsultantGreeting = 'services' | 'map';

function buildDefaultMessage(
  greeting: ConsultantGreeting,
  userName?: string | null,
): ConsultantMessage {
  const name = userName || 'bạn';
  if (greeting === 'map') {
    return {
      id: 'default',
      role: 'assistant',
      content: `Chào ${name}! Mình là Bé Song Hỷ. Hãy cho mình biết phong cách, ngân sách hoặc dịch vụ bạn cần; mình sẽ tìm các nhà cung cấp phù hợp và ghim họ lên bản đồ.`,
    };
  }
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

      try {
        const chatHistory = await fetchConsultantMessages(userId);
        if (!active) return;

        setMessages(
          chatHistory.length > 0
            ? [buildDefaultMessage(greeting, user?.name), ...chatHistory]
            : [buildDefaultMessage(greeting, user?.name)],
        );
      } catch (error) {
        console.error('Failed to load consultant history', error);
        if (active) setMessages([buildDefaultMessage(greeting, user?.name)]);
      }
    }

    void loadMessages();
    return () => {
      active = false;
    };
  }, [userId, user?.name, greeting]);

  useEffect(() => {
    // Scroll only the message list container; scrollIntoView on a fixed/sticky
    // panel also scrolls the page behind it, yanking users to the bottom of the site.
    const el = scrollContainerRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
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
    setRetrievedServices([]);
    setIsTyping(true);

    try {
      if (userId) {
        // Logged-in couples use the durable thread endpoint so history survives
        // page reloads. The backend stores both turns and returns the exchange.
        const exchange = await sendConsultantMessage(content);
        setMessages(previous => [
          ...previous,
          {
            id: exchange.assistantMessage.id,
            role: 'assistant',
            content: exchange.assistantMessage.content,
          },
        ]);
        setRetrievedServices(exchange.retrievedServices);
      } else {
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
        setRetrievedServices(turnServices);
      }
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

