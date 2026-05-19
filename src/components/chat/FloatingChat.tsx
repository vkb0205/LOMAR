import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, X, Heart, Sparkles } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types/database';
import InteractiveMascot from './InteractiveMascot';

type ChatMessageRow = Database['public']['Tables']['chat_messages']['Row'];

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [messages, setMessages] = useState<{ text: string, isUser: boolean }[]>([]);
  const [inputValue, setInputValue] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const mascotRef = useRef<HTMLDivElement>(null);

  // Fetch chat history
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

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    const userText = inputValue;
    setMessages(prev => [...prev, { text: userText, isUser: true }]);
    setInputValue('');
    
    await supabase.from('chat_messages').insert({ role: 'user', content: userText } as any);

    setTimeout(async () => {
      const botText = "Cảm ơn bạn đã nhắn tin cho Bé Song nhé! Mình đang tìm kiếm thông tin tốt nhất cho bạn đây...";
      setMessages(prev => [...prev, { text: botText, isUser: false }]);
      await supabase.from('chat_messages').insert({ role: 'assistant', content: botText } as any);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end pointer-events-none">
      
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-[320px] md:w-[380px] h-[500px] bg-white rounded-[32px] shadow-2xl border border-rose-100 flex flex-col overflow-hidden mb-4 pointer-events-auto"
          >
            {/* Chat Header */}
            <div className="bg-[#F494A2] p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                   <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg leading-tight uppercase tracking-wider">Bé Song Hỷ</h3>
                  <p className="text-[10px] text-white/80 font-medium tracking-widest uppercase">Trợ lý ảo thông minh</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:rotate-90 transition-transform">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar bg-[#FFFDFD]">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: msg.isUser ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-4 rounded-[22px] text-xs font-medium leading-relaxed shadow-sm border ${
                    msg.isUser 
                    ? 'bg-[#1D3557] text-white border-[#1D3557] rounded-tr-none' 
                    : 'bg-white text-[#1D3557] border-rose-100 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-rose-50">
              <div className="relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Hỏi Bé Song điều gì đó..."
                  className="w-full bg-rose-50/50 border border-rose-100 rounded-full py-3 px-5 pr-12 text-xs focus:outline-none focus:ring-1 focus:ring-[#F494A2] text-[#1D3557]"
                />
                <button 
                  onClick={handleSendMessage}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 bg-[#F494A2] text-white rounded-full flex items-center justify-center hover:bg-rose-400 shadow-md transition-colors"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mascot Launcher */}
      <div className="relative flex flex-col items-center pointer-events-auto">
        <motion.div
          ref={mascotRef}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative cursor-pointer group"
        >
          {/* Tooltip */}
          {!isOpen && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: isHovered ? 1 : 0, x: -10 }}
              className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-white px-4 py-2 rounded-2xl border border-rose-100 shadow-lg whitespace-nowrap hidden md:block"
            >
              <p className="text-[#1D3557] text-[10px] font-bold uppercase tracking-widest">Chat với Bé Song 🧚‍♀️</p>
              <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-white rotate-45 border-t border-r border-rose-100"></div>
            </motion.div>
          )}

          {/* Mascot Body (Interactive Cute Avatar) */}
          <div className="relative w-20 h-20 md:w-24 md:h-24 drop-shadow-2xl">
            <InteractiveMascot className="w-full h-full" />
            
            {/* Notification Badge */}
            {!isOpen && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#1D3557] text-white text-[8px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                1
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
