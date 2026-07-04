import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, MapPin, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { Database } from '../types/database';
import { useAppContext } from '../context/AppContext';

type ChatMessageRow = Database['public']['Tables']['chat_messages']['Row'];
type ServiceRow = Database['public']['Tables']['services']['Row'];

const MOCK_THREAD_ID = '00000000-0000-0000-0000-000000000000';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggested_service_id?: string | null;
}

export default function AIConsultant() {
  const { user } = useAppContext();
  const userId = user ? `user_${user.role}_${user.name.replace(/\s+/g, '').toLowerCase()}` : 'user_guest';
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestedService, setSuggestedService] = useState<ServiceRow | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchMessages() {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (data && data.length > 0) {
        const typedData = data as ChatMessageRow[];
        setMessages(typedData.map(m => ({
          id: m.id.toString(),
          role: m.role as 'user' | 'assistant',
          content: m.content || '',
          suggested_service_id: m.suggested_service_id
        })));
      } else {
        const defaultMsg: Message = {
          id: 'default',
          role: 'assistant',
          content: `Chào ${user ? user.name : 'bạn'}! Mình là AI Consultant của Phố Hạnh Phúc. Bạn đang tìm Váy Cưới, Dịch Vụ Khám Sức Khỏe hay Studio Chụp Ảnh?`
        };
        setMessages([defaultMsg]);
      }
    }
    fetchMessages();
  }, [userId, user]);

  useEffect(() => {
    async function fetchService() {
      const latestSuggestedId = [...messages].reverse().find(m => m.suggested_service_id)?.suggested_service_id;
      if (latestSuggestedId) {
        const { data } = await supabase
          .from('services')
          .select('*')
          .eq('id', latestSuggestedId)
          .single();
        if (data) setSuggestedService(data as ServiceRow);
      }
    }
    if (messages.length > 0) fetchService();
  }, [messages]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { scrollToBottom(); }, [messages, isTyping]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userContent = input;
    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: userContent };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    await supabase.from('chat_messages').insert({
      thread_id: MOCK_THREAD_ID,
      user_id: userId,
      role: 'user',
      content: userContent
    } as any);

    setTimeout(async () => {
      let aiResponse = 'Rất tuyệt vời! Phố Hạnh Phúc có rất nhiều dịch vụ phù hợp với yêu cầu của bạn.';
      let suggestedServiceId: string | null = null;

      const lowerInput = userContent.toLowerCase();
      try {
        let queryCategory = '';
        if (lowerInput.includes('váy') || lowerInput.includes('cưới')) queryCategory = 'Váy Cưới';
        else if (lowerInput.includes('vest')) queryCategory = 'Vest';
        else if (lowerInput.includes('venue') || lowerInput.includes('nhà hàng')) queryCategory = 'Venue';
        else if (lowerInput.includes('trang trí')) queryCategory = 'Trang Trí';

        if (queryCategory) {
          const { data } = await supabase
            .from('services')
            .select('*')
            .eq('category', queryCategory)
            .limit(1)
            .single();
          if (data) {
            const typedSvc = data as ServiceRow;
            aiResponse = `Dựa vào yêu cầu của bạn, mình đề xuất dịch vụ "${typedSvc.name}" đang rất được ưa chuộng hiện nay!`;
            suggestedServiceId = typedSvc.id;
          }
        }
      } catch (err) {
        console.error('Error fetching suggestion', err);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        suggested_service_id: suggestedServiceId
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);

      await supabase.from('chat_messages').insert({
        thread_id: MOCK_THREAD_ID,
        user_id: userId,
        role: 'assistant',
        content: aiResponse,
        suggested_service_id: suggestedServiceId
      } as any);
    }, 1500);
  };

  return (
    <div className="w-full flex-1 flex flex-col md:flex-row h-auto md:h-[calc(100vh-6rem)] p-4 md:p-6 gap-6 md:max-h-[900px]">
      <div className="w-full md:w-1/2 lg:w-3/5 h-[500px] md:h-full bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        <div className="border-b border-gray-100 p-4 px-6 flex items-center bg-gray-50/50">
          <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center mr-3">
            <Sparkles className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">Tư vấn viên AI</h2>
            <p className="text-xs text-rose-600 font-medium flex items-center">
              <span className="w-2 h-2 rounded-full bg-rose-500 mr-1 animate-pulse"></span>
              Đang trực tuyến
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-rose-600" />
                </div>
              )}
              <div className={`max-w-[75%] p-4 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-rose-500 text-white rounded-tr-sm'
                  : 'bg-gray-50 text-gray-800 rounded-tl-sm'
              }`}>
                {msg.content}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-rose-200 flex items-center justify-center ml-2 flex-shrink-0 mt-1">
                  <User className="w-4 h-4 text-rose-600" />
                </div>
              )}
            </motion.div>
          ))}
          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center mr-2 flex-shrink-0">
                <Bot className="w-4 h-4 text-rose-600" />
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl rounded-tl-sm">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="border-t border-gray-100 p-4">
          <div className="flex gap-3">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập câu hỏi của bạn..."
              className="flex-1 bg-gray-50 rounded-full px-6 py-3 text-sm outline-none focus:ring-2 focus:ring-rose-200 transition-all" />
            <button type="submit" disabled={!input.trim() || isTyping}
              className="w-12 h-12 bg-rose-500 text-white rounded-full flex items-center justify-center hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      <div className="w-full md:w-1/2 lg:w-2/5 flex flex-col gap-6 overflow-y-auto">
        {suggestedService && (
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
            <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
              <img src={suggestedService.thumbnail_url || 'https://images.unsplash.com/photo-1595000072051-5afcb1eef556?auto=format&fit=crop&q=80&w=600'}
                alt={suggestedService.name || 'Service'} className="w-full h-full object-cover" />
              <div className="absolute top-3 left-3 bg-rose-500 text-white text-[10px] font-bold uppercase px-3 py-1 rounded-full tracking-wider">
                Đề xuất
              </div>
            </div>
            <div className="p-4">
              <h4 className="font-bold text-gray-900 text-sm">{suggestedService.name}</h4>
              <p className="text-xs text-rose-600 font-bold mt-1">{Number(suggestedService.base_price).toLocaleString('vi-VN')} VND</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-4">Gợi ý nhanh</h3>
          <div className="flex flex-wrap gap-2">
            {['Tìm váy cưới', 'Tư vấn vest', 'Địa điểm tổ chức', 'Chi phí trung bình'].map((hint, i) => (
              <button key={i} onClick={() => { setInput(hint); }}
                className="px-4 py-2 bg-gray-50 rounded-full text-xs text-gray-600 font-medium hover:bg-rose-50 hover:text-rose-600 transition-colors border border-gray-100">
                {hint}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
