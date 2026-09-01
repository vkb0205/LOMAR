import { FormEvent, useEffect, useRef, useState } from 'react';
import { Clock3, Heart, Send, Sparkles, X } from 'lucide-react';
import { useAuth } from '../../../auth/hooks/useAuth';
import { chatSteps, getNextStep, type MapChatMessage, type QuickReply } from '../../data/hoVanHueChatFlow';
import { categoryMeta, getVendorById } from '../../data/hoVanHueVendors';
import { fetchChatSessions, fetchSessionMessages, type ChatSession } from '../../services/chatMessageRepository';
import { TypingIndicator } from '../TypingIndicator';

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
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
    <div className="flex h-full flex-col overflow-hidden rounded-bezel bg-ink/5 p-1.5 ring-1 ring-ink/5 shadow-card">
      {/* Header */}
      <div className="flex shrink-0 flex-col gap-3 rounded-bezel-inner border-b border-ink/8 bg-white px-4 py-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] sm:px-5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-mist">
              <Sparkles strokeWidth={1.5} className="h-5 w-5 text-rose-deep" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-sage" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate font-serif text-sm font-bold text-ink">Bé Song Hỷ</h2>
            <p className="flex items-center gap-1 truncate text-[11px] font-medium text-sage">
              <Heart strokeWidth={1.5} className="h-2.5 w-2.5 shrink-0 fill-current" />
              Bản đồ Hạnh Phúc · Hồ Văn Huê
            </p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 rounded-full bg-sage-mist/70 px-3 py-1.5 text-[10px] font-semibold text-forest">
            <Sparkles strokeWidth={1.5} className="h-3 w-3" />
            <span className="tabular-nums">
              {highlightedIds.length} <span className="hidden font-medium normal-case lg:inline">đã ghim</span>
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Ẩn chat"
            title="Ẩn chat"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-rose-deep transition-colors duration-500 hover:bg-rose-mist lg:hidden"
          >
            <X strokeWidth={1.5} className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-full bg-ink/5 p-1">
          {([
            { id: 'chat', label: 'Trò chuyện' },
            { id: 'vendors', label: `Lựa chọn của tôi${highlightedIds.length > 0 ? ` (${highlightedIds.length})` : ''}` },
            ...(user ? [{ id: 'history', label: 'Lịch sử' }] : []),
          ] as Array<{ id: ActiveTab; label: string }>).map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 rounded-full px-2 py-1.5 text-[11px] font-semibold transition-all duration-500 ${
                activeTab === tab.id ? 'bg-white text-ink shadow-sm' : 'text-ink/55 hover:text-ink'
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
          {/* Messages */}
          <div className="no-scrollbar flex-1 space-y-4 overflow-y-auto bg-canvas/60 p-4">
            {messages.map(message => (
              <div key={message.id} className="chat-message flex">
                {message.role === 'assistant' && (
                  <div className="mr-2 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-mist">
                    <Sparkles strokeWidth={1.5} className="h-4 w-4 text-rose-deep" />
                  </div>
                )}
                <div className="max-w-[85%]">
                  <div
                    className={`whitespace-pre-wrap rounded-2xl p-3 text-xs font-medium leading-relaxed ${
                      message.role === 'user'
                        ? 'rounded-br-sm bg-cream text-ink-deep'
                        : 'rounded-bl-sm border border-ink/8 bg-white text-ink shadow-card'
                    }`}
                  >
                    {message.content}
                  </div>

                  {message.vendorIds && message.vendorIds.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {message.vendorIds.slice(0, 5).map((id, index) => {
                        const vendor = getVendorById(id);
                        if (!vendor) return null;
                        const meta = categoryMeta[vendor.category];
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => onSelectVendor(id)}
                            className="flex items-center gap-1.5 rounded-full border border-ink/8 bg-white px-2.5 py-1 text-[11px] font-medium text-ink shadow-sm transition hover:border-rose/50 hover:bg-rose-mist/50"
                          >
                            <span
                              className="grid h-4 w-4 place-items-center rounded-full text-[9px]"
                              style={{ background: meta.bg }}
                            >
                              {meta.icon}
                            </span>
                            <span>
                              #{index + 1} {vendor.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <p className="mt-1 px-1 text-[10px] text-ink/40">
                    {message.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && <div className="chat-message"><TypingIndicator compact /></div>}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick replies */}
          {quickReplies.length > 0 && !isTyping && (
            <div className="flex flex-wrap gap-2 px-4 pb-3">
              {quickReplies.map(reply => (
                <button
                  key={reply.value}
                  type="button"
                  onClick={() => handleSend(reply.value)}
                  className="rounded-full border border-rose/40 bg-white px-3.5 py-2 text-[11px] font-semibold text-rose-deep shadow-sm transition hover:-translate-y-0.5 hover:border-transparent hover:bg-rose hover:text-white hover:shadow-card"
                >
                  {reply.label}
                </button>
              ))}
            </div>
          )}

          {/* Composer */}
          <div className="px-4 pb-4">
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
                className="min-w-0 flex-1 rounded-full bg-canvas px-4 py-2.5 text-xs text-ink outline-none ring-1 ring-ink/10 transition-shadow duration-500 placeholder:text-ink/40 focus:ring-rose/50 md:py-3 md:text-sm"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose text-white transition-all duration-500 ease-fluid hover:-translate-y-0.5 hover:bg-ink active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Gửi tin nhắn"
              >
                <Send strokeWidth={1.5} className="h-4 w-4" />
              </button>
            </form>
          </div>
        </>
      ) : activeTab === 'vendors' ? (
        <div className="no-scrollbar flex-1 overflow-y-auto bg-canvas/60 p-4">
          {highlightedVendors.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center pb-8 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-rose-mist">
                <Sparkles strokeWidth={1.5} className="h-5 w-5 text-rose-deep" />
              </div>
              <p className="font-serif text-sm font-medium text-ink">Chưa có lựa chọn</p>
              <p className="mt-1.5 max-w-[210px] text-xs leading-relaxed text-ink/60">
                Trò chuyện với Bé Song Hỷ để tạo tuyến vendor trên phố Hồ Văn Huê.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('chat')}
                className="mt-4 rounded-full bg-rose px-4 py-2 text-xs font-semibold text-white transition hover:bg-ink"
              >
                Bắt đầu trò chuyện
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink/50">
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
                    className="vendor-highlighted group flex w-full items-center gap-3 rounded-2xl border border-ink/8 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-rose/50 hover:shadow-card"
                  >
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink font-serif text-sm font-bold text-canvas shadow-sm">
                      {index + 1}
                    </div>
                    <img src={vendor.image} alt={vendor.name} className="h-12 w-12 shrink-0 rounded-xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">{meta.icon}</span>
                        <p className="truncate text-xs font-semibold text-ink">{vendor.name}</p>
                      </div>
                      <p className="mt-0.5 text-[10px] text-ink/55">
                        {meta.label} · {vendor.priceRange}
                      </p>
                      <div className="mt-0.5 flex items-center gap-1">
                        <span className="text-[10px] text-gold">★</span>
                        <span className="text-[10px] font-medium text-ink">{vendor.rating}</span>
                        <span className="text-[10px] text-ink/40">({vendor.reviews})</span>
                      </div>
                    </div>
                  </button>
                );
              })}
              <div className="rounded-2xl bg-sage-mist/60 p-3 text-center">
                <p className="text-xs text-ink/70">
                  🗺️ Đi theo route trên bản đồ để ghé từng vendor theo thứ tự.
                </p>
              </div>
            </div>
          )}
        </div>
      ) : activeTab === 'history' ? (
        <div className="no-scrollbar flex-1 overflow-y-auto bg-canvas/60 p-4">
          {!user ? (
            <div className="flex h-full flex-col items-center justify-center pb-8 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-sage-mist">
                <Heart strokeWidth={1.5} className="h-5 w-5 fill-current text-sage" />
              </div>
              <p className="font-serif text-sm font-medium text-ink">Đăng nhập để xem lịch sử</p>
              <p className="mt-1.5 max-w-[220px] text-xs leading-relaxed text-ink/60">
                Lịch sử trò chuyện sẽ được lưu cho mỗi tài khoản đã đăng nhập.
              </p>
            </div>
          ) : isLoadingSessions ? (
            <div className="flex h-full flex-col items-center justify-center pb-8 text-center">
              <p className="font-serif text-sm font-medium text-ink">Đang tải lịch sử...</p>
            </div>
          ) : chatSessions.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center pb-8 text-center">
              <p className="font-serif text-sm font-medium text-ink">Chưa có phiên trò chuyện nào</p>
              <p className="mt-1.5 max-w-[220px] text-xs leading-relaxed text-ink/60">
                Các phiên trò chuyện của bạn sẽ xuất hiện ở đây sau khi tư vấn cùng Bé Song Hỷ.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink/50">
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
                  className="w-full rounded-2xl border border-ink/8 bg-white p-3 text-left shadow-sm transition hover:border-rose/50 hover:shadow-card"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-xs font-semibold text-ink">{session.title}</span>
                    <span className="shrink-0 text-[10px] text-ink/40">
                      {new Date(session.lastMessageAt).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-[11px] text-ink/55">
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
