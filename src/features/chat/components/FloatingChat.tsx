import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, X, Heart, Sparkles } from 'lucide-react';
import { supabase } from '../../../shared/api/supabaseClient';
import { Database } from '../../../shared/types/database';
import { useAuth } from '../../auth/hooks/useAuth';
import {
  CONSULT_NETWORK_FALLBACK_MESSAGE,
  requestConsultReply,
} from '../../ai-consultant/services/aiConsultantService';
import InteractiveMascot from './InteractiveMascot';

type ChatMessageRow = Database['public']['Tables']['chat_messages']['Row'];

const MOCK_THREAD_ID = '00000000-0000-0000-0000-000000000000';

const DEFAULT_GREETING =
  'Chào bạn! Mình là Bé Song Hỷ. Mình có thể giúp gì cho ngày trọng đại của bạn không?';

export default function FloatingChat() {
  const { user } = useAuth();
  // User-owned chat rows are keyed by the authenticated Supabase UUID (auth.uid()).
  const userId = user?.id ?? null;
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [messages, setMessages] = useState<{ text: string, isUser: boolean }[]>([]);
  const [inputValue, setInputValue] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const mascotRef = useRef<HTMLDivElement>(null);

  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    async function fetchChat() {
      // Load persisted history for signed-in users. Anonymous users still get
      // the live AI consultant; only persistence is skipped.
      if (!userId) {
        setMessages([{ text: DEFAULT_GREETING, isUser: false }]);
        return;
      }
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });
      if (data && data.length > 0) {
        setMessages((data as ChatMessageRow[]).map(m => ({
          text: m.content || '',
          isUser: m.role === 'user'
        })));
      } else {
        setMessages([{ text: DEFAULT_GREETING, isUser: false }]);
      }
    }
    void fetchChat();
  }, [userId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const insertChatMessage = async (role: string, content: string) => {
    if (!userId) return;
    // Persistence is best-effort. A database failure must not prevent the
    // floating chat from reaching the configured AI provider.
    try {
      // Item 13: typed insert payload instead of `as any`. The explicit
      // <Insert> generic is required for this @supabase/supabase-js version
      // (see src/shared/types/database.ts for the schema conformance notes).
      const payload: Database['public']['Tables']['chat_messages']['Insert'] = {
        thread_id: MOCK_THREAD_ID,
        user_id: userId,
        role,
        content,
      };
      const { error } = await supabase
        .from('chat_messages')
        .insert<Database['public']['Tables']['chat_messages']['Insert']>(payload);
      if (error) console.error('Floating chat persistence failed', error);
    } catch (error) {
      console.error('Floating chat persistence failed', error);
    }
  };

  const handleSendMessage = async () => {
    const userText = inputValue.trim();
    if (!userText || isTyping) return;

    setMessages(prev => [...prev, { text: userText, isUser: true }]);
    setInputValue('');
    setIsTyping(true);

    await insertChatMessage('user', userText);

    try {
      const botText = (await requestConsultReply(userText)).trim() || CONSULT_NETWORK_FALLBACK_MESSAGE;
      setMessages(prev => [...prev, { text: botText, isUser: false }]);
      await insertChatMessage('assistant', botText);
    } catch (error) {
      console.error('Floating chat request failed', error);
      setMessages(prev => [
        ...prev,
        { text: CONSULT_NETWORK_FALLBACK_MESSAGE, isUser: false },
      ]);
      await insertChatMessage('assistant', CONSULT_NETWORK_FALLBACK_MESSAGE);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 cursor-pointer flex items-center gap-2 bg-white rounded-full shadow-lg border border-[#ffdb9f]/30 p-1.5 pr-4 hover:shadow-xl transition-all group"
          >
            <div className="relative w-10 h-10" ref={mascotRef}>
              <InteractiveMascot isHovered={isHovered} isOpen={isOpen} />
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-xs text-[#1B2C40] uppercase tracking-wider">Bé Song Hỷ</span>
              <span className="text-[9px] text-[#ddb983] font-medium flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> Trợ lý AI của bạn
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {isOpen && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[95vw] h-[520px] max-h-[85vh] bg-white rounded-[32px] shadow-2xl border border-[#ffdb9f]/30 flex flex-col overflow-hidden"
          >
            <div className="p-4 border-b border-[#ffdb9f]/20 flex items-center justify-between bg-white/80 backdrop-blur-sm shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10" ref={mascotRef}>
                  <InteractiveMascot isHovered={false} isOpen={true} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm text-[#1B2C40]">Bé Song Hỷ</h3>
                  <p className="text-[9px] text-[#ddb983] flex items-center gap-1">
                    <Heart className="w-2 h-2 fill-current" /> Đồng hành cùng bạn
                  </p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-rose-50 flex items-center justify-center text-rose-300 hover:text-rose-500 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAF6EE]/50">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                  {!msg.isUser && (
                    <div className="w-8 h-8 rounded-full bg-[#ffe9c9] flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                      <Sparkles className="w-4 h-4 text-[#ddb983]" />
                    </div>
                  )}
                  <div className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed font-medium ${msg.isUser
                    ? 'bg-[#ffe9c9] text-[#1B2C40] rounded-br-sm'
                    : 'bg-white text-[#1B2C40] rounded-bl-sm border border-[#ffdb9f]/20 shadow-sm'
                    }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="w-8 h-8 rounded-full bg-[#ffe9c9] flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                    <Sparkles className="w-4 h-4 text-[#ddb983]" />
                  </div>
                  <div className="bg-white text-[#1B2C40] rounded-2xl rounded-bl-sm border border-[#ffdb9f]/20 shadow-sm p-3 text-xs">
                    Bé Song Hỷ đang trả lời...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-3 border-t border-[#ffdb9f]/20 bg-white shrink-0">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Nhắn tin với Bé Song..."
                  disabled={isTyping}
                  className="flex-1 bg-[#FAF6EE] rounded-full py-2.5 px-4 text-xs outline-none focus:ring-1 focus:ring-[#ffdb9f] placeholder:text-gray-400 disabled:opacity-60"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  className="w-10 h-10 bg-[#ffe9c9] text-[#1B2C40] rounded-full flex items-center justify-center hover:bg-[#ffdb9f] transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </>
  );
}
