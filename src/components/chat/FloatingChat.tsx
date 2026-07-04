import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, X, Heart, Sparkles } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types/database';
import InteractiveMascot from './InteractiveMascot';

type ChatMessageRow = Database['public']['Tables']['chat_messages']['Row'];

const MOCK_USER_ID = 'user_1';
const MOCK_THREAD_ID = '00000000-0000-0000-0000-000000000000';

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [messages, setMessages] = useState<{ text: string, isUser: boolean }[]>([]);
  const [inputValue, setInputValue] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const mascotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchChat() {
      const { data } = await supabase.from('chat_messages').select('*').order('created_at', { ascending: true });
      if (data && data.length > 0) {
        setMessages((data as ChatMessageRow[]).map(m => ({
          text: m.content || '',
          isUser: m.role === 'user'
        })));
      } else {
        setMessages([
          { text: "Chào bạn! Mình là Bé Song Hỷ. Mình có thể giúp gì cho ngày trọng đại của bạn không?", isUser: false }
        ]);
      }
    }
    fetchChat();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const insertChatMessage = async (role: string, content: string) => {
    await supabase.from('chat_messages').insert({
      thread_id: MOCK_THREAD_ID,
      user_id: MOCK_USER_ID,
      role,
      content
    } as any);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    const userText = inputValue;
    setMessages(prev => [...prev, { text: userText, isUser: true }]);
    setInputValue('');

    await insertChatMessage('user', userText);

    setTimeout(async () => {
      const botText = "Cảm ơn bạn đã nhắn tin cho Bé Song Hỷ nhé! Mình đang tìm kiếm thông tin tốt nhất cho bạn đây...";
      setMessages(prev => [...prev, { text: botText, isUser: false }]);
      await insertChatMessage('assistant', botText);
    }, 1000);
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
                  <div className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed font-medium ${
                    msg.isUser
                      ? 'bg-[#ffe9c9] text-[#1B2C40] rounded-br-sm'
                      : 'bg-white text-[#1B2C40] rounded-bl-sm border border-[#ffdb9f]/20 shadow-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
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
                  className="flex-1 bg-[#FAF6EE] rounded-full py-2.5 px-4 text-xs outline-none focus:ring-1 focus:ring-[#ffdb9f] placeholder:text-gray-400"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
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
