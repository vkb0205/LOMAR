import { useEffect, useRef, useState } from 'react';
import {
  buildCustomizeGreeting,
  fetchCustomizeChat,
  insertCustomizeChatMessage,
} from '../services/customizeChatRepository';
import { ChatBubbleMessage } from '../types';

interface UseCustomizeChatResult {
  chatContainerRef: React.RefObject<HTMLDivElement | null>;
  inputValue: string;
  messages: ChatBubbleMessage[];
  appendAssistantMessage: (text: string) => void;
  appendUserMessage: (text: string) => void;
  persistMessage: (role: string, content: string) => Promise<void>;
  setInputValue: React.Dispatch<React.SetStateAction<string>>;
}

export function useCustomizeChat(userId: string | null, activeTab: string): UseCustomizeChatResult {
  const [messages, setMessages] = useState<ChatBubbleMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadChat() {
      if (!userId) return;
      const chatHistory = await fetchCustomizeChat(userId);
      if (chatHistory.length > 0) setMessages(chatHistory);
    }

    loadChat();
  }, [userId]);

  useEffect(() => {
    if (!activeTab) return;
    setMessages(buildCustomizeGreeting(activeTab));
  }, [activeTab]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const appendAssistantMessage = (text: string) => {
    setMessages(previous => [...previous, { text, isUser: false }]);
  };

  const appendUserMessage = (text: string) => {
    setMessages(previous => [...previous, { text, isUser: true }]);
  };

  const persistMessage = async (role: string, content: string) => {
    await insertCustomizeChatMessage(userId, role, content);
  };

  return {
    chatContainerRef,
    inputValue,
    messages,
    appendAssistantMessage,
    appendUserMessage,
    persistMessage,
    setInputValue,
  };
}
