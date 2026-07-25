import { Send, Sparkles } from 'lucide-react';
import { FormEvent, RefObject } from 'react';
import { ConsultantMessage } from '../types';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';

interface ChatPanelProps {
  input: string;
  isTyping: boolean;
  messages: ConsultantMessage[];
  messagesEndRef: RefObject<HTMLDivElement | null>;
  onInputChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
}

export function ChatPanel({
  input,
  isTyping,
  messages,
  messagesEndRef,
  onInputChange,
  onSubmit,
}: ChatPanelProps) {
  return (
    <div className="w-full md:w-1/2 lg:w-3/5 h-[500px] md:h-full bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
      <div className="border-b border-gray-100 p-4 px-6 flex items-center bg-gray-50/50">
        <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center mr-3">
          <Sparkles className="w-5 h-5 text-rose-600" />
        </div>
        <div>
          <h2 className="font-bold text-gray-900">Tư vấn viên AI</h2>
          <p className="text-xs text-rose-600 font-medium flex items-center">
            <span className="w-2 h-2 rounded-full bg-rose-500 mr-1 animate-pulse" />
            Đang trực tuyến
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map(message => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={onSubmit} className="border-t border-gray-100 p-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={event => onInputChange(event.target.value)}
            placeholder="Nhập câu hỏi của bạn..."
            className="flex-1 bg-gray-50 rounded-full px-6 py-3 text-sm outline-none focus:ring-2 focus:ring-rose-200 transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="w-12 h-12 bg-rose-500 text-white rounded-full flex items-center justify-center hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
