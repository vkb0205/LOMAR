import { FormEvent, useEffect, useRef, useState } from 'react';
import { Clock3, MessageCircle, Send, X } from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';
import { chatSteps, getNextStep, type MapChatMessage, type QuickReply } from '../data/hoVanHueChatFlow';
import { categoryMeta, getVendorById, vendors } from '../data/hoVanHueVendors';
import { fetchChatSessions, fetchSessionMessages, type ChatSession } from '../services/chatMessageRepository';

interface ChatPanelProps {
  highlightedIds: string[];
  onHighlight: (ids: string[]) => void;
  onSelectVendor: (id: string | null) => void;
  onClose: () => void;
}

export function ChatPanel({ highlightedIds, onHighlight, onSelectVendor, onClose }: ChatPanelProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<MapChatMessage[]>([]);
  const [currentStep, setCurrentStep] = useState('welcome');
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>(chatSteps.welcome.quickReplies ?? []);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'vendors' | 'history'>('chat');
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => addAssistantMessage('welcome'), 450);
    return () => window.clearTimeout(timeout);
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
    if (!user && activeTab === 'history') {
      setActiveTab('chat');
    }
  }, [user, activeTab]);

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
    <div className="flex h-full flex-col bg-[#faf6f0]">
      <div className="border-b border-[#ede5d8] px-5 pb-4 pt-5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-[#c9906a] to-[#a8714f] text-lg shadow-sm">
              🌸
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#faf6f0] bg-[#8aab8a]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#2d2520]">Wedding AI Consultant</p>
            <p className="text-xs font-medium text-[#8aab8a]">● Online · Hồ Văn Huê Expert</p>
          </div>
          <div className="ml-auto flex items-center gap-1 rounded-full bg-[#f2ebe0] px-3 py-1.5 text-xs text-[#7a6e68]">
            <span>📍</span>
            <span className="font-medium">
              {highlightedIds.length} <span className="hidden lg:inline">pinned</span>
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Ẩn chat"
            title="Ẩn chat"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[#ede5d8] text-[#7a6e68] transition hover:border-[#c9906a] hover:text-[#c9906a] lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 flex gap-1 rounded-xl bg-[#f2ebe0] p-1">
          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition ${
              activeTab === 'chat' ? 'bg-white text-[#2d2520] shadow-sm' : 'text-[#7a6e68] hover:text-[#2d2520]'
            }`}
          >
            💬 Chat
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('vendors')}
            className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition ${
              activeTab === 'vendors' ? 'bg-white text-[#2d2520] shadow-sm' : 'text-[#7a6e68] hover:text-[#2d2520]'
            }`}
          >
            ✨ Lựa chọn của tôi {highlightedIds.length > 0 && `(${highlightedIds.length})`}
          </button>
          {user && (
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition ${
                activeTab === 'history' ? 'bg-white text-[#2d2520] shadow-sm' : 'text-[#7a6e68] hover:text-[#2d2520]'
              }`}
            >
              <Clock3 className="mr-1 inline h-3 w-3" /> Lịch sử {chatSessions.length > 0 && `(${chatSessions.length})`}
            </button>
          )}
        </div>
      </div>

      {activeTab === 'chat' ? (
        <>
          <div className="scroll-smooth flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map(message => (
              <div key={message.id} className={`chat-message flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.role === 'assistant' && (
                  <div className="mr-2 mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#c9906a] to-[#a8714f] text-sm shadow-sm">
                    🌸
                  </div>
                )}
                <div className="max-w-[82%]">
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      message.role === 'user'
                        ? 'rounded-tr-sm bg-[#c9906a] text-white'
                        : 'rounded-tl-sm border border-[#ede5d8] bg-white text-[#2d2520] shadow-sm'
                    }`}
                  >
                    {message.content.split('\n').map((line, index) => (
                      <span key={`${message.id}-${index}`}>
                        {line}
                        {index < message.content.split('\n').length - 1 && <br />}
                      </span>
                    ))}
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
                            className="flex items-center gap-1.5 rounded-full border border-[#ede5d8] bg-white px-2.5 py-1 text-xs text-[#2d2520] shadow-sm transition hover:border-[#c9906a] hover:bg-[#fdf5ef]"
                          >
                            <span className="grid h-4 w-4 place-items-center rounded-full text-[10px]" style={{ background: meta.bg }}>
                              {meta.icon}
                            </span>
                            <span className="font-medium">#{index + 1} {vendor.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <p className="mt-1 px-1 text-[10px] text-[#b0a8a0]">
                    {message.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="chat-message flex justify-start">
                <div className="mr-2 mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#c9906a] to-[#a8714f] text-sm shadow-sm">
                  🌸
                </div>
                <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-[#ede5d8] bg-white px-4 py-3 shadow-sm">
                  <div className="typing-dot h-1.5 w-1.5 rounded-full bg-[#c9906a]" />
                  <div className="typing-dot h-1.5 w-1.5 rounded-full bg-[#c9906a]" />
                  <div className="typing-dot h-1.5 w-1.5 rounded-full bg-[#c9906a]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {quickReplies.length > 0 && !isTyping && (
            <div className="flex flex-wrap gap-2 px-4 pb-3">
              {quickReplies.map(reply => (
                <button
                  key={reply.value}
                  type="button"
                  onClick={() => handleSend(reply.value)}
                  className="rounded-full border border-[#c9906a] bg-white px-3.5 py-2 text-xs font-medium text-[#c9906a] shadow-sm transition hover:bg-[#c9906a] hover:text-white hover:shadow-md"
                >
                  {reply.label}
                </button>
              ))}
            </div>
          )}

          <div className="px-4 pb-4">
            <form
              onSubmit={(event: FormEvent) => {
                event.preventDefault();
                handleSend(inputValue);
              }}
              className="flex items-center gap-2 rounded-2xl border border-[#ede5d8] bg-white px-4 py-2.5 shadow-sm transition focus-within:border-[#c9906a] focus-within:shadow-md"
            >
              <input
                ref={inputRef}
                value={inputValue}
                onChange={event => setInputValue(event.target.value)}
                placeholder="Nhập yêu cầu hoặc chọn gợi ý..."
                className="min-w-0 flex-1 bg-transparent text-sm text-[#2d2520] outline-none placeholder:text-[#b0a8a0]"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#c9906a] text-white transition hover:bg-[#a8714f] disabled:cursor-not-allowed disabled:bg-[#e8c4a8]"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </>
      ) : activeTab === 'vendors' ? (
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {highlightedVendors.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center pb-8 text-center">
              <div className="mb-3 text-4xl">🗺️</div>
              <p className="font-serif text-sm font-medium text-[#2d2520]">Chưa có lựa chọn</p>
              <p className="mt-1.5 max-w-[210px] text-xs text-[#7a6e68]">
                Trò chuyện với AI Consultant để tạo itinerary vendor trên Hồ Văn Huê.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('chat')}
                className="mt-4 rounded-full bg-[#c9906a] px-4 py-2 text-xs font-medium text-white transition hover:bg-[#a8714f]"
              >
                Bắt đầu chat
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="px-1 text-xs font-medium uppercase tracking-wider text-[#7a6e68]">
                Itinerary đã chọn · {highlightedVendors.length} vendor
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
                    className="vendor-highlighted group flex w-full items-center gap-3 rounded-2xl border border-[#ede5d8] bg-white p-3 text-left transition hover:border-[#c9906a] hover:shadow-md"
                  >
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#c9906a] text-base font-bold text-white shadow-sm">
                      {index + 1}
                    </div>
                    <img src={vendor.image} alt={vendor.name} className="h-12 w-12 shrink-0 rounded-xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">{meta.icon}</span>
                        <p className="truncate text-xs font-semibold text-[#2d2520]">{vendor.name}</p>
                      </div>
                      <p className="mt-0.5 text-[10px] text-[#7a6e68]">{meta.label} · {vendor.priceRange}</p>
                      <div className="mt-0.5 flex items-center gap-1">
                        <span className="text-[10px] text-[#d4a76a]">★</span>
                        <span className="text-[10px] font-medium text-[#2d2520]">{vendor.rating}</span>
                        <span className="text-[10px] text-[#b0a8a0]">({vendor.reviews})</span>
                      </div>
                    </div>
                    <span className="text-[#c9906a] opacity-0 transition group-hover:opacity-100">›</span>
                  </button>
                );
              })}
              <div className="rounded-2xl bg-[#f2ebe0] p-3 text-center">
                <p className="text-xs text-[#7a6e68]">🗺️ Đi theo route trên bản đồ để ghé từng vendor theo thứ tự.</p>
              </div>
            </div>
          )}
          </div>
        ) : activeTab === 'history' ? (
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {!user ? (
            <div className="flex h-full flex-col items-center justify-center pb-8 text-center">
              <div className="mb-3 text-4xl">🔐</div>
              <p className="font-serif text-sm font-medium text-[#2d2520]">Đăng nhập để xem lịch sử</p>
              <p className="mt-1.5 max-w-[220px] text-xs text-[#7a6e68]">
                Lịch sử chat sẽ được lưu trữ cho mỗi tài khoản đã đăng nhập.
              </p>
            </div>
          ) : isLoadingSessions ? (
            <div className="flex h-full flex-col items-center justify-center pb-8 text-center">
              <div className="mb-3 text-4xl">⏳</div>
              <p className="font-serif text-sm font-medium text-[#2d2520]">Đang tải lịch sử...</p>
            </div>
          ) : chatSessions.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center pb-8 text-center">
              <div className="mb-3 text-4xl">🕘</div>
              <p className="font-serif text-sm font-medium text-[#2d2520]">Chưa có phiên chat nào</p>
              <p className="mt-1.5 max-w-[220px] text-xs text-[#7a6e68]">
                Các phiên chat của bạn sẽ xuất hiện ở đây sau khi trò chuyện với AI Consultant.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="px-1 text-xs font-medium uppercase tracking-wider text-[#7a6e68]">Phiên chat đã lưu</p>
              {chatSessions.map(session => (
                <button key={session.id} type="button" onClick={() => {
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
                }} className="group w-full rounded-2xl border border-[#ede5d8] bg-white p-3 text-left shadow-sm transition hover:border-[#c9906a] hover:shadow-md">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[#2d2520]">{session.title}</span>
                    <span className="text-[10px] text-[#b0a8a0]">{new Date(session.lastMessageAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="mt-1 text-[10px] text-[#7a6e68]">{session.messageCount} tin nhắn · {session.preview}</p>
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
