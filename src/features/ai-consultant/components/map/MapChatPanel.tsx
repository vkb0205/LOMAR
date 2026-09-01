import { FormEvent, useEffect, useRef, useState } from 'react';
import { Clock3, Heart, Send, Sparkles, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../../../auth/hooks/useAuth';
import { chatSteps, getNextStep, type MapChatMessage, type QuickReply } from '../../data/hoVanHueChatFlow';
import { categoryMeta, getVendorById } from '../../data/hoVanHueVendors';
import { fetchChatSessions, fetchSessionMessages, type ChatSession } from '../../services/chatMessageRepository';
import { EASE } from '../../../../shared/ui/motion';

interface MapChatPanelProps {
  highlightedIds: string[];
  onHighlight: (ids: string[]) => void;
  onSelectVendor: (id: string | null) => void;
  onClose: () => void;
}

type ActiveTab = 'chat' | 'vendors' | 'history';

/**
 * Guided consultant chat for the interactive map. The conversation is a
 * deterministic flow (hoVanHueChatFlow) so every recommendation can pin an
 * ordered route onto the map without depending on backend availability.
 */
export function MapChatPanel({ highlightedIds, onHighlight, onSelectVendor, onClose }: MapChatPanelProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<MapChatMessage[]>([]);
  const [currentStep, setCurrentStep] = useState('welcome');
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>(chatSteps.welcome.quickReplies ?? []);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => addAssistantMessage('welcome'), 450);
    return () => window.clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!user) {
      setChatSessions([]);
      return;
    }

    let active = true;
    setIsLoadingSessions(true);

    async function loadSessions() {
      if (!user) {
        setChatSessions([]);
        setIsLoadingSessions(false);
        return;
      }
      const sessions = await fetchChatSessions(user.id);
      if (active) {
        setChatSessions(sessions);
        setIsLoadingSessions(false);
      }
    }

    void loadSessions();

    return () => {
      active = false;
    };
  }, [user]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  function addAssistantMessage(stepId: string) {
    const step = chatSteps[stepId];
    if (!step) return;

    setIsTyping(true);
    setQuickReplies([]);

    const timeout = window.setTimeout(() => {
      const routeVendorIds = step.vendorIds ? [...step.vendorIds].reverse() : undefined;
      const assistantMessage: MapChatMessage = {
        id: `${Date.now()}-assistant`,
        role: 'assistant',
        content: step.message,
        vendorIds: routeVendorIds,
        timestamp: new Date(),
      };

      setIsTyping(false);
      setMessages(previous => [...previous, assistantMessage]);
      setQuickReplies(step.quickReplies ?? []);
      if (routeVendorIds && routeVendorIds.length > 0) {
        onHighlight(routeVendorIds);
      }
    }, Math.min(650 + step.message.length * 6, 1800));

    return () => window.clearTimeout(timeout);
  }

  function handleSend(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    const userMessage: MapChatMessage = {
      id: `${Date.now()}-user`,
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages(previous => [...previous, userMessage]);
    setInputValue('');
    setQuickReplies([]);

    const nextStep = getNextStep(currentStep, trimmed);
    setCurrentStep(nextStep);
    window.setTimeout(() => addAssistantMessage(nextStep), 250);
  }

  const highlightedVendors = highlightedIds
    .map(id => getVendorById(id))
    .filter((vendor): vendor is NonNullable<typeof vendor> => Boolean(vendor));

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-hairline bg-canvas shadow-card">
      {/* Header — canvas, hairline divider, ink-deep avatar tile */}
      <div className="shrink-0 border-b border-hairline bg-canvas px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink-deep">
            <Sparkles strokeWidth={1.5} className="h-4.5 w-4.5 text-canvas" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-ink">Bé Song Hỷ</h2>
            <p className="flex items-center gap-1 truncate text-xs font-medium text-sage">
              <Heart strokeWidth={1.75} className="h-2.5 w-2.5 shrink-0 fill-current" />
              Bản đồ Hạnh Phúc · Hồ Văn Huê
            </p>
          </div>
          <div className="ml-auto hidden shrink-0 items-center gap-1.5 rounded-full border border-sage/20 bg-sage/10 px-2.5 py-1 text-[11px] font-medium text-forest sm:flex">
            <span className="tabular-nums">
              {highlightedIds.length} <span className="hidden font-medium lg:inline">đã ghim</span>
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Ẩn chat"
            title="Ẩn chat"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition-colors duration-200 hover:bg-surface-soft hover:text-ink lg:hidden"
          >
            <X strokeWidth={1.5} className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs — ink active pill, ghost inactive */}
        <div className="no-scrollbar mt-3 flex gap-1 overflow-x-auto">
          {([
            { id: 'chat', label: 'Trò chuyện' },
            { id: 'vendors', label: `Lựa chọn của tôi${highlightedIds.length > 0 ? ` (${highlightedIds.length})` : ''}` },
            ...(user ? [{ id: 'history', label: 'Lịch sử' }] : []),
          ] as Array<{ id: ActiveTab; label: string }>).map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'bg-ink text-canvas'
                  : 'text-muted hover:bg-surface-soft hover:text-ink'
              }`}
            >
              {tab.id === 'history' && <Clock3 strokeWidth={1.5} className="mr-1 inline h-3 w-3" />}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'chat' ? (
        <>
          {/* Messages — hairline bubbles on canvas */}
          <div ref={messagesContainerRef} className="scroll-area flex-1 space-y-3.5 overflow-y-auto bg-canvas p-4">
            {messages.map(message => {
              const isUser = message.role === 'user';
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: EASE }}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="mr-2.5 mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-ink-deep">
                      <Sparkles strokeWidth={1.5} className="h-3.5 w-3.5 text-canvas" />
                    </div>
                  )}
                  <div className="max-w-[85%]">
                    <div
                      className={`whitespace-pre-wrap rounded-lg p-3 text-xs font-medium leading-relaxed ${
                        isUser
                          ? 'rounded-tr-sm bg-surface-card text-ink'
                          : 'rounded-tl-sm border border-hairline bg-canvas text-ink'
                      }`}
                    >
                      {message.content}
                    </div>

                    {/* Pinned vendor chips — hairline mono rows */}
                    {message.vendorIds && message.vendorIds.length > 0 && (
                      <div className="mt-2 flex flex-col gap-1.5">
                        {message.vendorIds.slice(0, 5).map((id, index) => {
                          const vendor = getVendorById(id);
                          if (!vendor) return null;
                          const meta = categoryMeta[vendor.category];
                          return (
                            <button
                              key={id}
                              type="button"
                              onClick={() => onSelectVendor(id)}
                              className="flex items-center gap-2 rounded-lg border border-hairline bg-canvas px-2.5 py-1.5 text-left text-[11px] font-medium text-ink transition-colors duration-200 hover:border-rose hover:bg-surface-soft"
                            >
                              <span className="font-mono text-[10px] text-muted-soft">
                                #{String(index + 1).padStart(2, '0')}
                              </span>
                              <span aria-hidden>{meta.icon}</span>
                              <span className="truncate">{vendor.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    <p className="mt-1 px-1 font-mono text-[10px] text-muted-soft">
                      {message.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              );
            })}

            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="flex justify-start"
              >
                <div className="mr-2.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-ink-deep">
                  <Sparkles strokeWidth={1.5} className="h-3.5 w-3.5 text-canvas" />
                </div>
                <div className="rounded-lg rounded-tl-sm border border-hairline bg-canvas p-3">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-rose" style={{ animationDelay: '0ms' }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-rose" style={{ animationDelay: '150ms' }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-rose" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Quick replies — outline chips */}
          {quickReplies.length > 0 && !isTyping && (
            <div className="flex shrink-0 flex-wrap gap-2 border-t border-hairline bg-canvas px-4 py-3">
              {quickReplies.map(reply => (
                <button
                  key={reply.value}
                  type="button"
                  onClick={() => handleSend(reply.value)}
                  className="rounded-lg border border-hairline bg-canvas px-3 py-1.5 text-[11px] font-medium text-muted transition-colors duration-200 hover:border-rose hover:bg-rose/15 hover:text-rose-deep"
                >
                  {reply.label}
                </button>
              ))}
            </div>
          )}

          {/* Composer — AIC input pattern + ink send button */}
          <div className="shrink-0 border-t border-hairline bg-canvas p-3">
            <form
              onSubmit={(event: FormEvent) => {
                event.preventDefault();
                handleSend(inputValue);
              }}
              className="flex items-center gap-2"
            >
              <input
                value={inputValue}
                onChange={event => setInputValue(event.target.value)}
                placeholder="Nhắn tin với Bé Song Hỷ..."
                className="h-10 min-w-0 flex-1 rounded-lg border border-hairline bg-surface-soft px-3.5 text-sm text-ink outline-none transition-colors duration-200 placeholder:text-muted-soft focus:border-rose focus:ring-1 focus:ring-rose/30"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink text-canvas transition-colors duration-200 hover:bg-ink-soft active:bg-ink-soft disabled:pointer-events-none disabled:opacity-50"
                aria-label="Gửi tin nhắn"
              >
                <Send strokeWidth={1.75} className="h-4 w-4" />
              </button>
            </form>
          </div>
        </>
      ) : activeTab === 'vendors' ? (
        <div className="scroll-area flex-1 overflow-y-auto bg-canvas p-4">
          {highlightedVendors.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center pb-8 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg border border-dashed border-hairline bg-surface-soft text-muted">
                <Sparkles strokeWidth={1.5} className="h-5 w-5" />
              </div>
              <p className="font-serif text-sm font-normal text-ink">Chưa có lựa chọn</p>
              <p className="mt-1.5 max-w-[210px] text-xs leading-relaxed text-muted">
                Trò chuyện với Bé Song Hỷ để tạo tuyến vendor trên phố Hồ Văn Huê.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('chat')}
                className="mt-4 rounded-lg bg-ink px-4 py-2 text-xs font-medium text-canvas transition-colors duration-200 hover:bg-ink-soft"
              >
                Bắt đầu trò chuyện
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="px-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-soft">
                Tuyến đã chọn · {highlightedVendors.length} vendor
              </p>
              {highlightedIds.map((id, index) => {
                const vendor = getVendorById(id);
                if (!vendor) return null;
                const meta = categoryMeta[vendor.category];
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      onSelectVendor(id);
                      setActiveTab('chat');
                    }}
                    className="vendor-highlighted group flex w-full items-center gap-3 rounded-xl border border-hairline bg-canvas p-2.5 text-left transition-colors duration-200 hover:border-rose"
                  >
                    <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-ink-deep font-mono text-[11px] font-medium text-canvas">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <img
                      src={vendor.image}
                      alt={vendor.name}
                      className="h-12 w-12 shrink-0 rounded-lg border border-hairline object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-ink">{vendor.name}</p>
                      <p className="mt-0.5 truncate font-mono text-[10px] text-muted-soft">
                        {meta.label} · {vendor.priceRange}
                      </p>
                      <p className="mt-0.5 font-mono text-[10px]">
                        <span className="text-forest">★ {vendor.rating}</span>
                        <span className="ml-1 text-muted-soft">({vendor.reviews})</span>
                      </p>
                    </div>
                  </button>
                );
              })}
              <div className="rounded-xl border border-dashed border-hairline bg-surface-soft p-3 text-center">
                <p className="text-xs leading-relaxed text-muted">
                  Đi theo route trên bản đồ để ghé từng vendor theo thứ tự.
                </p>
              </div>
            </div>
          )}
        </div>
      ) : activeTab === 'history' ? (
        <div className="scroll-area flex-1 overflow-y-auto bg-canvas p-4">
          {!user ? (
            <div className="flex h-full flex-col items-center justify-center pb-8 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg border border-dashed border-hairline bg-surface-soft text-muted">
                <Heart strokeWidth={1.5} className="h-5 w-5" />
              </div>
              <p className="font-serif text-sm font-normal text-ink">Đăng nhập để xem lịch sử</p>
              <p className="mt-1.5 max-w-[220px] text-xs leading-relaxed text-muted">
                Lịch sử trò chuyện sẽ được lưu cho mỗi tài khoản đã đăng nhập.
              </p>
            </div>
          ) : isLoadingSessions ? (
            <div className="flex h-full flex-col items-center justify-center pb-8 text-center">
              <p className="font-serif text-sm font-normal text-ink">Đang tải lịch sử...</p>
            </div>
          ) : chatSessions.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center pb-8 text-center">
              <p className="font-serif text-sm font-normal text-ink">Chưa có phiên trò chuyện nào</p>
              <p className="mt-1.5 max-w-[220px] text-xs leading-relaxed text-muted">
                Các phiên trò chuyện của bạn sẽ xuất hiện ở đây sau khi tư vấn cùng Bé Song Hỷ.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="px-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-soft">
                Phiên trò chuyện đã lưu
              </p>
              {chatSessions.map(session => (
                <button
                  key={session.id}
                  type="button"
                  onClick={() => {
                    void (async () => {
                      const sessionMessages = await fetchSessionMessages(session.id);
                      const mapMessages: MapChatMessage[] = sessionMessages.map(msg => ({
                        id: msg.id,
                        role: msg.role,
                        content: msg.content,
                        timestamp: new Date(msg.createdAt),
                      }));
                      setMessages(mapMessages);
                      setActiveTab('chat');
                      setCurrentStep('welcome');
                      setQuickReplies([]);
                    })();
                  }}
                  className="w-full rounded-xl border border-hairline bg-canvas p-3 text-left transition-colors duration-200 hover:border-rose"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-xs font-semibold text-ink">{session.title}</span>
                    <span className="shrink-0 font-mono text-[10px] text-muted-soft">
                      {new Date(session.lastMessageAt).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-[11px] text-muted">
                    {session.messageCount} tin nhắn · {session.preview}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1" />
      )}
    </div>
  );
}
