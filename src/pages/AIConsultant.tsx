import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, MapPin, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { Database } from '../types/database';

type ChatMessageRow = Database['public']['Tables']['chat_messages']['Row'];
type ProductRow = Database['public']['Tables']['products']['Row'];

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggested_product_id?: string | null;
}

const MOCK_USER_ID = 'user_1';

export default function AIConsultant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestedProduct, setSuggestedProduct] = useState<ProductRow | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch initial chat messages
  useEffect(() => {
    async function fetchMessages() {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', MOCK_USER_ID)
        .order('created_at', { ascending: true });

      if (data && data.length > 0) {
        const typedData = data as ChatMessageRow[];
        setMessages(typedData.map(m => ({
          id: m.id.toString(),
          role: m.role as 'user' | 'assistant',
          content: m.content || '',
          suggested_product_id: m.suggested_product_id
        })));
      } else {
        // Default initial message if no history
        const defaultMsg: Message = {
          id: 'default',
          role: 'assistant',
          content: 'Chào bạn! Mình là AI Consultant của Phố Hạnh Phúc. Bạn đang tìm Váy Cưới, Dịch Vụ Khám Sức Khỏe hay Studio Chụp Ảnh?'
        };
        setMessages([defaultMsg]);
      }
    }
    fetchMessages();
  }, []);

  // Effect to fetch the latest suggested product
  useEffect(() => {
    async function fetchProduct() {
      const latestSuggestedId = [...messages].reverse().find(m => m.suggested_product_id)?.suggested_product_id;
      
      if (latestSuggestedId) {
        const { data } = await supabase
          .from('products')
          .select('*')
          .eq('id', latestSuggestedId)
          .single();
          
        if (data) {
          setSuggestedProduct(data as ProductRow);
        }
      }
    }
    
    if (messages.length > 0) {
      fetchProduct();
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userContent = input;
    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: userContent };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Save user message to DB
    await supabase.from('chat_messages').insert({
      user_id: MOCK_USER_ID,
      role: 'user',
      content: userContent
    } as any);

    // Mock AI response logic
    setTimeout(async () => {
      let aiResponse = 'Rất tuyệt vời! Phố Hạnh Phúc có rất nhiều dịch vụ và sản phẩm phù hợp với yêu cầu của bạn.';
      let suggestedProductId: string | null = null;

      const lowerInput = userContent.toLowerCase();
      
      try {
        // Simple search for products based on keywords to suggest a real product
        let queryCategory = '';
        if (lowerInput.includes('váy') || lowerInput.includes('cưới')) {
          queryCategory = 'Váy Cưới';
        } else if (lowerInput.includes('vest')) {
          queryCategory = 'Vest';
        } else if (lowerInput.includes('venue') || lowerInput.includes('nhà hàng')) {
          queryCategory = 'Venue';
        } else if (lowerInput.includes('trang trí')) {
          queryCategory = 'Trang Trí';
        }

        if (queryCategory) {
          const { data } = await supabase
            .from('products')
            .select('*')
            .eq('category', queryCategory)
            .limit(1)
            .single();

          if (data) {
            const typedProd = data as ProductRow;
            aiResponse = `Dựa vào yêu cầu của bạn, mình đề xuất sản phẩm "${typedProd.name}" đang rất được ưa chuộng hiện nay!`;
            suggestedProductId = typedProd.id;
          }
        }
      } catch (err) {
        console.error('Error fetching suggestion', err);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        suggested_product_id: suggestedProductId
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);

      // Save assistant message to DB
      await supabase.from('chat_messages').insert({
        user_id: MOCK_USER_ID,
        role: 'assistant',
        content: aiResponse,
        suggested_product_id: suggestedProductId
      } as any);

    }, 1500);
  };

  return (
    <div className="w-full flex-1 flex flex-col md:flex-row h-[calc(100vh-4rem)] p-4 md:p-6 gap-6 max-h-[900px]">
      
      {/* Left Half: AI Chat Interface */}
      <div className="w-full md:w-1/2 lg:w-3/5 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        {/* Chat Header */}
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

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-rose-600" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl p-4 text-sm ${
                  msg.role === 'user'
                    ? 'bg-rose-600 text-white rounded-tr-sm'
                    : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                }`}
              >
                {msg.content}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center ml-2 flex-shrink-0 mt-1">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
              )}
            </motion.div>
          ))}
          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center mr-2 mt-1">
                <Bot className="w-4 h-4 text-rose-600" />
              </div>
              <div className="bg-gray-100 rounded-2xl rounded-tl-sm p-4 flex items-center space-x-1 w-16 h-12">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-100 bg-white">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập yêu cầu của bạn (VD: Tìm váy cưới, Khám sức khỏe)..."
              className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="w-12 h-12 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5 ml-1" />
            </button>
          </form>
        </div>
      </div>

      {/* Right Half: Suggested For You (Dynamic) */}
      <div className="w-full md:w-1/2 lg:w-2/5 flex flex-col">
        <h2 className="text-xl font-bold text-gray-900 mb-4 px-2">Đề Xuất Dành Cho Bạn</h2>
        
        <div className="flex-1 rounded-3xl border-2 border-dashed border-gray-200 p-4 flex items-center justify-center bg-gray-50/50 overflow-hidden relative">
          <AnimatePresence mode="wait">
            {suggestedProduct ? (
              <motion.div
                key={suggestedProduct.id}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{ type: 'spring', bounce: 0.4 }}
                className="w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
              >
                <div className="h-48 relative bg-gray-200">
                  <img src={suggestedProduct.image_url || 'https://images.unsplash.com/photo-1595000072051-5afcb1eef556?auto=format&fit=crop&q=80'} alt={suggestedProduct.name || 'Product'} className="w-full h-full object-cover" />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-rose-600 shadow-sm flex items-center">
                    <Sparkles className="w-3 h-3 mr-1" /> AI Suggest
                  </div>
                </div>
                <div className="p-6">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{suggestedProduct.category}</span>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1 mb-2">{suggestedProduct.name}</h3>
                  <div className="flex items-center text-sm text-gray-600 mb-4 space-x-4">
                    <span className="flex items-center text-amber-500 font-medium">
                      <Star className="w-4 h-4 fill-current mr-1" />
                      5.0
                    </span>
                    <span className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                      Hồ Văn Huê
                    </span>
                    <span className="font-bold text-gray-900">{Number(suggestedProduct.price || 0).toLocaleString('vi-VN')} VND</span>
                  </div>
                  <button className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium transition-colors">
                    Xem chi tiết
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center text-gray-400 max-w-sm"
              >
                <Bot className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>Hãy trò chuyện với AI để nhận được những đề xuất phù hợp nhất với nhu cầu của bạn.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
    </div>
  );
}
