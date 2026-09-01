import { Heart, Send, Sparkles } from 'lucide-react';
import type { FormEvent, RefObject } from 'react';
import type { ConsultantMessage, RetrievedService } from '../types';
import { MessageBubble } from './MessageBubble';
import { RetrievedServiceRow } from './RetrievedServiceRow';
import { TypingIndicator } from './TypingIndicator';

export type AssistantChatLayout = 'sidebar';

interface AssistantChatProps {
  layout?: AssistantChatLayout;
  title?: string;
  subtitle?: string;
  input: string;
  isTyping: boolean;
  messages: ConsultantMessage[];
  retrievedServices: RetrievedService[];
  messagesEndRef: RefObject<HTMLDivElement | null>;
  scrollContainerRef?: RefObject<HTMLDivElement | null>;
  onInputChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
  className?: string;
  compact?: boolean;
}

const DEFAULT_TITLE = 'Bé Song Hỷ';
const DEFAULT_SUBTITLE = 'Trợ lý AI · Đồng hành cùng bạn';

/** In-page assistant chrome (services sidebar). Floating launcher is separate. */
export function AssistantChat({
  layout = 'sidebar',
  title = DEFAULT_TITLE,
  subtitle = DEFAULT_SUBTITLE,
  input,
  isTyping,
  messages,
  retrievedServices,
  messagesEndRef,
  scrollContainerRef,
  onInputChange,
  onSubmit,
  className = '',
  compact,
}: AssistantChatProps) {
  const useCompact = compact ?? layout === 'sidebar';
  const shell = 'h-[calc(100vh-8rem)] max-h-[calc(100vh-8rem)]';

  return (
    <div className={`flex flex-col overflow-hidden rounded-xl border border-hairline bg-canvas shadow-card ${shell} ${className}`}>
      <div className="flex shrink-0 items-center gap-3 border-b border-hairline bg-canvas px-4 py-3.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink-deep">
          <Sparkles strokeWidth={1.5} className="h-4.5 w-4.5 text-canvas" />
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold text-ink">{title}</h2>
          <p className="flex items-center gap-1 truncate text-xs font-medium text-sage">
            <Heart strokeWidth={1.75} className="h-2.5 w-2.5 shrink-0 fill-current" />
            {subtitle}
          </p>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className={`scroll-area flex-1 space-y-3.5 overflow-y-auto bg-canvas ${
          useCompact ? 'p-4' : 'p-5 md:p-6'
        }`}
      >
        {messages.map(message => (
          <MessageBubble key={message.id} message={message} compact={useCompact} />
        ))}
        {isTyping && <TypingIndicator compact={useCompact} />}
        <div ref={messagesEndRef} />
      </div>

      <RetrievedServiceRow services={retrievedServices} />

      <form onSubmit={onSubmit} className="shrink-0 border-t border-hairline bg-canvas p-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={event => onInputChange(event.target.value)}
            placeholder="Nhắn tin với Bé Song Hỷ..."
            disabled={isTyping}
            className="h-10 min-w-0 flex-1 rounded-lg border border-hairline bg-surface-soft px-3.5 text-sm text-ink outline-none transition-colors duration-200 placeholder:text-muted-soft focus:border-rose focus:ring-1 focus:ring-rose/30 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink text-canvas transition-colors duration-200 hover:bg-ink-soft active:bg-ink-soft disabled:pointer-events-none disabled:opacity-50"
            aria-label="Gửi tin nhắn"
          >
            <Send strokeWidth={1.75} className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
