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
    <div
      className={`flex flex-col overflow-hidden rounded-bezel bg-ink/5 p-1.5 ring-1 ring-ink/5 shadow-card ${shell} ${className}`}
    >
      <div className="flex shrink-0 items-center gap-3 rounded-bezel-inner border-b border-ink/8 bg-white px-5 py-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-mist">
          <Sparkles strokeWidth={1.5} className="h-5 w-5 text-rose-deep" />
        </div>
        <div className="min-w-0">
          <h2 className="truncate font-serif text-sm font-bold text-ink">{title}</h2>
          <p className="flex items-center gap-1 truncate text-[11px] font-medium text-sage">
            <Heart strokeWidth={1.5} className="h-2.5 w-2.5 shrink-0 fill-current" />
            {subtitle}
          </p>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className={`no-scrollbar flex-1 space-y-4 overflow-y-auto bg-canvas/60 ${
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

      <form
        onSubmit={onSubmit}
        className="shrink-0 border-t border-ink/8 bg-white/80 p-3 md:p-4"
      >
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={event => onInputChange(event.target.value)}
            placeholder="Nhắn tin với Bé Song Hỷ..."
            disabled={isTyping}
            className="flex-1 rounded-full bg-canvas px-4 py-2.5 text-xs text-ink outline-none ring-1 ring-ink/10 transition-shadow duration-500 placeholder:text-ink/40 focus:ring-rose/50 disabled:opacity-60 md:px-5 md:py-3 md:text-sm"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose text-white transition-all duration-500 ease-fluid hover:-translate-y-0.5 hover:bg-ink active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 md:h-11 md:w-11"
            aria-label="Gửi tin nhắn"
          >
            <Send strokeWidth={1.5} className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
