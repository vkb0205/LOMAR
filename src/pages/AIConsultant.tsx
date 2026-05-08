import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, MapPin, Star } from 'lucide-react';
import { mockVendors } from '../data/mockData';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestedVendorId?: string;
}

export default function AIConsultant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Chào bạn! Mình là AI Consultant của Phố Hạnh Phúc. Bạn đang tìm Váy Cưới, Dịch Vụ Khám Sức Khỏe hay Studio Chụp Ảnh?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Derived state to find the latest recommended vendor
  const latestSuggestedVendorId = [...messages].reverse().find(m => m.suggestedVendorId)?.suggestedVendorId;
  const suggestedVendor = mockVendors.find(v => v.id === latestSuggestedVendorId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Mock AI response logic
    setTimeout(() => {
      let aiResponse = 'Rất tuyệt vời! Phố Hạnh Phúc có rất nhiều dịch vụ phù hợp với yêu cầu của bạn.';
      let suggestedVendorId = undefined;

      const lowerInput = userMessage.content.toLowerCase();
      
      if (lowerInput.includes('váy') || lowerInput.includes('cưới')) {
        aiResponse = 'Nếu bạn đang tìm váy cưới, mình đặc biệt gợi ý Bella Bridal Studio. Họ đang có bộ sưu tập mới nhất rất đẹp và phù hợp!';
        suggestedVendorId = 'v2';
      } else if (lowerInput.includes('sức khỏe') || lowerInput.includes('khám')) {
        aiResponse = 'Sức khỏe tiền hôn nhân rất quan trọng. Bạn có thể tham khảo Trung Tâm Khám Sức Khỏe Tiền Hôn Nhân ngay trên phố Hồ Văn Huê nhé.';
        suggestedVendorId = 'v6';
      } else if (lowerInput.includes('chụp ảnh') || lowerInput.includes('studio')) {
        aiResponse = 'Dream Wedding Photography là một lựa chọn tuyệt vời cho những bộ ảnh phong cách Hàn Quốc lãng mạn.';
        suggestedVendorId = 'v3';
      }

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: aiResponse,
        suggestedVendorId
      }]);
      setIsTyping(false);
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
            {suggestedVendor ? (
              <motion.div
                key={suggestedVendor.id}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{ type: 'spring', bounce: 0.4 }}
                className="w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
              >
                <div className="h-48 relative bg-gray-200">
                  <img src={suggestedVendor.image} alt={suggestedVendor.name} className="w-full h-full object-cover" />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-rose-600 shadow-sm flex items-center">
                    <Sparkles className="w-3 h-3 mr-1" /> AI Suggest
                  </div>
                </div>
                <div className="p-6">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{suggestedVendor.category}</span>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1 mb-2">{suggestedVendor.name}</h3>
                  <div className="flex items-center text-sm text-gray-600 mb-4 space-x-4">
                    <span className="flex items-center text-amber-500 font-medium">
                      <Star className="w-4 h-4 fill-current mr-1" />
                      {suggestedVendor.rating}
                    </span>
                    <span className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                      Hồ Văn Huê
                    </span>
                    <span className="font-bold text-gray-900">{suggestedVendor.priceTier}</span>
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
