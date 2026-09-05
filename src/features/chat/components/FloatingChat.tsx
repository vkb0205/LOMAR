import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, X, Heart, Sparkles } from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';
import {
  CONSULT_NETWORK_FALLBACK_MESSAGE,
  loadConsultantHistory,
  requestConsultReply,
  type StoredConsultMessage,
} from '../../ai-consultant/services/aiConsultantService';
import type { RetrievedService } from '../../ai-consultant/types';
import { OPEN_ASSISTANT_EVENT, type OpenAssistantDetail } from '../openAssistant';
import InteractiveMascot from './InteractiveMascot';

const DEFAULT_GREETING =
  'Chào bạn! Mình là Bé Song Hỷ. Mình có thể giúp gì cho ngày trọng đại của bạn không?';

type FloatingMessage = {
  text: string;
  isUser: boolean;
  services?: RetrievedService[];
};

function metadataServices(metadata: Record<string, unknown> | undefined): RetrievedService[] | undefined {
  const raw = metadata?.retrieved_services;
  if (!Array.isArray(raw)) return undefined;

  const mapped: RetrievedService[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') continue;
    const row = entry as Record<string, unknown>;
    if (typeof row.id !== 'string') continue;
    mapped.push({
      id: row.id,
      name: typeof row.name === 'string' ? row.name : null,
      category: typeof row.category === 'string' ? row.category : null,
      basePrice: typeof row.base_price === 'number' ? row.base_price : null,
      currency: typeof row.currency === 'string' ? row.currency : null,
      thumbnailUrl: typeof row.thumbnail_url === 'string' ? row.thumbnail_url : null,
      vendorId: typeof row.vendor_id === 'string' ? row.vendor_id : null,
    });
  }
  return mapped.length > 0 ? mapped : undefined;
}

function toFloatingMessage(row: StoredConsultMessage): FloatingMessage {
  return {
    text: row.content,
    isUser: row.role === 'user',
    services: metadataServices(row.metadata),
  };
}

export default function FloatingChat() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [messages, setMessages] = useState<FloatingMessage[]>([
    { text: DEFAULT_GREETING, isUser: false },
  ]);
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mascotRef = useRef<HTMLDivElement>(null);

  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // Auth change should start a clean context, but logged-in couples rehydrate
    // the previous DB-backed thread so page reloads don't wipe history.
    let active = true;
    setMessages([{ text: DEFAULT_GREETING, isUser: false }]);

    async function hydrate() {
      const stored = await loadConsultantHistory();
      if (!active || stored.length === 0) return;
      setMessages(stored.map(toFloatingMessage));
    }

    void hydrate();
    return () => {
      active = false;
    };
  }, [userId]);

  useEffect(() => {
    // Scroll only the message list; scrollIntoView on a fixed panel also
    // scrolls the page behind it, yanking users to the bottom of the site.
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping, isOpen]);

  useEffect(() => {
    function onOpenAssistant(event: Event) {
      const detail = (event as CustomEvent<OpenAssistantDetail>).detail;
      if (detail?.prompt?.trim()) {
        setInputValue(detail.prompt.trim());
      }
      setIsOpen(true);
    }
    window.addEventListener(OPEN_ASSISTANT_EVENT, onOpenAssistant);
    return () => window.removeEventListener(OPEN_ASSISTANT_EVENT, onOpenAssistant);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  const handleSendMessage = async () => {
    const userText = inputValue.trim();
    if (!userText || isTyping) return;

    const nextMessages: FloatingMessage[] = [...messages, { text: userText, isUser: true }];
    setMessages(nextMessages);
    setInputValue('');
    setIsTyping(true);

    try {
      const history = nextMessages
        .filter(m => m.text.trim() && m.text !== DEFAULT_GREETING)
        .slice(-10)
        .map(m => ({
          role: (m.isUser ? 'user' : 'assistant') as 'user' | 'assistant',
          content: m.text,
        }));
      const { reply, retrievedServices } = await requestConsultReply(userText, history);
      const botText = reply.trim() || CONSULT_NETWORK_FALLBACK_MESSAGE;
      setMessages(prev => [
        ...prev,
        {
          text: botText,
          isUser: false,
          services: retrievedServices.length > 0 ? retrievedServices : undefined,
        },
      ]);
    } catch (error) {
      console.error('Floating chat request failed', error);
      setMessages(prev => [
        ...prev,
        { text: CONSULT_NETWORK_FALLBACK_MESSAGE, isUser: false },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      {!isOpen ? (
        <motion.div
          key="chat-tab"
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() => setIsOpen(true)}
          role="button"
          aria-label="Mở trò chuyện với Bé Song Hỷ"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setIsOpen(true)}
          className="group fixed bottom-6 right-6 z-50 flex cursor-pointer items-center gap-2 rounded-full border border-ink/10 bg-white p-1.5 pr-4 shadow-lift transition-all duration-500 ease-fluid hover:-translate-y-0.5 hover:shadow-float"
        >
          <div className="relative h-10 w-10" ref={mascotRef}>
            <InteractiveMascot isHovered={isHovered} isOpen={isOpen} />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-xs font-bold uppercase tracking-wider text-ink">Bé Song Hỷ</span>
            <span className="flex items-center gap-1 text-[9px] font-medium text-sage">
              <Sparkles strokeWidth={1.5} className="h-2.5 w-2.5" /> Trợ lý AI của bạn
            </span>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="chat-panel"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
          onAnimationComplete={() => {
            // Focus only on pointer devices; on phones this would summon the keyboard.
            if (window.matchMedia('(hover: hover)').matches) inputRef.current?.focus();
          }}
          className="fixed bottom-6 right-6 z-50 flex h-[520px] max-h-[85dvh] w-[380px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-bezel bg-ink/5 p-1.5 ring-1 ring-ink/5 shadow-float"
        >
          <div className="flex shrink-0 items-center justify-between rounded-bezel-inner border-b border-ink/8 bg-white/95 p-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10" ref={mascotRef}>
                <InteractiveMascot isHovered={false} isOpen={true} />
              </div>
              <div>
                <h3 className="font-serif text-sm font-bold text-ink">Bé Song Hỷ</h3>
                <p className="flex items-center gap-1 text-[9px] text-sage">
                  <Heart strokeWidth={1.5} className="h-2 w-2 fill-current" /> Đồng hành cùng bạn
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-rose-deep transition-colors duration-500 hover:bg-rose-mist"
              aria-label="Đóng trò chuyện"
            >
              <X strokeWidth={1.5} className="h-4 w-4" />
            </button>
          </div>

          <div ref={scrollRef} className="scroll-area flex-1 space-y-4 overflow-y-auto overscroll-contain bg-canvas/70 p-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                {!msg.isUser && (
                  <div className="mr-2 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-mist">
                    <Sparkles strokeWidth={1.5} className="h-4 w-4 text-rose-deep" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl p-3 text-xs font-medium leading-relaxed ${msg.isUser
                  ? 'rounded-br-sm bg-cream text-ink-deep'
                  : 'rounded-bl-sm border border-ink/8 bg-white text-ink shadow-card'
                  }`}>
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                  {!msg.isUser && msg.services && msg.services.length > 0 && (
                    <ul className="mt-2 space-y-1 border-t border-ink/8 pt-2 text-[11px] text-ink/70">
                      {msg.services.map(service => (
                        <li key={service.id} className="truncate">
                          - {service.name || service.id}
                          {service.basePrice != null
                            ? ` · ${service.basePrice.toLocaleString('vi-VN')}${service.currency ? ` ${service.currency}` : ''}`
                            : ''}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="mr-2 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-mist">
                  <Sparkles strokeWidth={1.5} className="h-4 w-4 text-rose-deep" />
                </div>
                <div className="rounded-2xl rounded-bl-sm border border-ink/8 bg-white p-3 text-xs text-ink shadow-card">
                  Bé Song Hỷ đang trả lời...
                </div>
              </div>
            )}
          </div>

          <div className="shrink-0 border-t border-ink/8 bg-white p-3">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.nativeEvent.isComposing && handleSendMessage()}
                placeholder="Nhắn tin với Bé Song..."
                disabled={isTyping}
                className="flex-1 rounded-full bg-canvas px-4 py-2.5 text-xs text-ink outline-none ring-1 ring-ink/10 transition-shadow duration-500 placeholder:text-ink/40 focus:ring-rose/50 disabled:opacity-60"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose text-white transition-all duration-500 ease-fluid hover:-translate-y-0.5 hover:bg-ink active:scale-95 disabled:opacity-50"
                aria-label="Gửi tin nhắn"
              >
                <Send strokeWidth={1.5} className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
