import React, { useState, useEffect, useRef } from 'react';
import { Send, Heart, ArrowRight, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Database } from '../types/database';

type ChatMessageRow = Database['public']['Tables']['chat_messages']['Row'];
type ProductRow = Database['public']['Tables']['products']['Row'];
type VendorRow = Database['public']['Tables']['vendors']['Row'];

const customizationOptions: Record<string, { title: string, options: string[] }[]> = {
  'Váy Cưới': [
    { title: 'Kiểu Váy', options: ['A-Line', 'Ball Gown', 'Mermaid', 'Trumpet'] },
    { title: 'Đính Kết Hạt', options: ['Pha lê Swarovski', 'Ngọc trai', 'Kim sa'] },
    { title: 'Thân Trên', options: ['Cúp ngực', 'Trễ vai', 'Cổ chữ V'] },
    { title: 'Thân Trước', options: ['Trơn satin', 'Xếp ly', 'Phủ ren'] },
    { title: 'Thân Sau', options: ['Đan dây', 'Cài nút ngọc', 'Khoét sâu lưng'] }
  ],
  'Vest': [
    { title: 'Kiểu Vest', options: ['Suit 2 mảnh', 'Suit 3 mảnh', 'Tuxedo'] },
    { title: 'Dáng Vest', options: ['Slim Fit', 'Regular Fit', 'Classic'] },
    { title: 'Ve Áo Vest', options: ['Ve K (Notch)', 'Ve Nhọn', 'Ve Sam'] },
    { title: 'Nút Áo Khoác', options: ['1 Nút', '2 Nút', '6 Nút'] },
  ],
  'Venue': [
    { title: 'Cửa Hàng', options: ['Sky Dream', 'Dream Palace', 'Earth Dream'] },
    { title: 'Phong Cách', options: ['Sang trọng', 'Lãng mạn', 'Cổ điển'] },
    { title: 'Quy Mô', options: ['Dưới 200 khách', '200 - 500 khách', 'Trên 500 khách'] },
    { title: 'Ngân Sách', options: ['Phổ thông', 'Trung cấp', 'Cao cấp'] },
  ],
  'Trang Trí': [
    { title: 'Tone Màu Chủ Đạo', options: ['Hồng Pastel', 'Trắng Tinh Khôi', 'Đỏ Rực Rỡ', 'Xanh Biển'] },
    { title: 'Phong Cách', options: ['Rustic', 'Luxury', 'Minimalism', 'Vintage'] },
    { title: 'Hoa Cưới', options: ['Hoa Tươi', 'Hoa Lụa', 'Hoa Khô', 'Kết Hợp'] },
    { title: 'Sân Khấu', options: ['Màn Hình LED', 'Phông Rèm Cổ Điển', 'Khung Hoa Cổng'] },
  ],
  'Làm Đẹp': [
    { title: 'Layout Makeup', options: ['Tự nhiên (Hàn Quốc)', 'Tây Âu Sắc Sảo', 'Trong Trẻo', 'Cổ Điển'] },
    { title: 'Kiểu Tóc', options: ['Búi Cao Sang Trọng', 'Thả Xoăn Lọn To', 'Búi Thấp Đính Hoa'] },
    { title: 'Chăm Sóc Da', options: ['Phục hồi chuyên sâu', 'Trị mụn', 'Dưỡng trắng', 'Cấp ẩm'] },
  ]
};

const defaultImages: Record<string, string> = {
  'Váy Cưới': 'https://images.unsplash.com/photo-1595000072051-5afcb1eef556?auto=format&fit=crop&q=80&w=1000',
  'Vest': 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=1000',
  'Venue': 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=1000',
  'Trang Trí': 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=1000',
  'Làm Đẹp': 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&q=80&w=1000'
};

const basePrices: Record<string, number> = {
  'Váy Cưới': 8000000,
  'Vest': 5500000,
  'Venue': 45000000,
  'Trang Trí': 15000000,
  'Làm Đẹp': 3500000
};

export default function Customize() {
  const [activeTab, setActiveTab] = useState('Váy Cưới');
  const [activePropertyIndex, setActivePropertyIndex] = useState(0);
  const [selections, setSelections] = useState<Record<string, Record<string, string>>>({});

  // Chat state
  const [messages, setMessages] = useState<{ text: string, isUser: boolean }[]>([]);
  const [inputValue, setInputValue] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [dbOptions, setDbOptions] = useState<Record<string, { title: string, options: string[] }[]>>(customizationOptions);

  const [tabs, setTabs] = useState(['Váy Cưới', 'Vest', 'Venue', 'Trang Trí', 'Làm Đẹp']);
  const [liveImages, setLiveImages] = useState(defaultImages);
  const [livePrices, setLivePrices] = useState(basePrices);
  const properties = dbOptions[activeTab] || dbOptions['Váy Cưới'] || [];

  // Fetch real categories and vendors from Supabase
  useEffect(() => {
    async function fetchLiveData() {
      try {
        // 1. Fetch products to get categories, images, and prices
        const { data: productData } = await supabase.from('products').select('*');
        if (productData && productData.length > 0) {
          const typedProducts = productData as ProductRow[];
          
          // Get unique categories
          const uniqueCategories = [...new Set(typedProducts.map(p => p.category).filter(Boolean))] as string[];
          if (uniqueCategories.length > 0) {
            setTabs(uniqueCategories);
          }

          // Build dynamic images and prices map
          const newImages: Record<string, string> = { ...defaultImages };
          const newPrices: Record<string, number> = { ...basePrices };
          
          uniqueCategories.forEach(cat => {
            const firstProd = typedProducts.find(p => p.category === cat);
            if (firstProd) {
              if (firstProd.image_url) newImages[cat] = firstProd.image_url;
              if (firstProd.price) newPrices[cat] = Number(firstProd.price);
            }
          });
          
          setLiveImages(newImages);
          setLivePrices(newPrices);
        }

        // 2. Fetch real vendors for the 'Venue' section
        const { data: vendorData } = await supabase.from('vendors').select('name');
        if (vendorData) {
          const vendorNames = (vendorData as VendorRow[]).map(v => v.name).filter(Boolean) as string[];
          setDbOptions(prev => ({
            ...prev,
            'Venue': prev['Venue']?.map(group => 
              group.title === 'Cửa Hàng' 
                ? { ...group, options: vendorNames.length > 0 ? vendorNames : group.options }
                : group
            ) || []
          }));
        }
      } catch (error) {
        console.error('Error fetching live data for customization:', error);
      }
    }
    fetchLiveData();
  }, []);

  // Fetch chat history from Supabase
  useEffect(() => {
    async function fetchChat() {
      const { data } = await supabase.from('chat_messages').select('*').order('created_at', { ascending: true });
      if (data && data.length > 0) {
        setMessages((data as ChatMessageRow[]).map(m => ({ text: m.content || '', isUser: m.role === 'user' })));
      }
    }
    fetchChat();
  }, []);

  // Update chat greeting when tab changes
  useEffect(() => {
    setMessages([
      { text: `Mẫu ${activeTab.toLowerCase()} trong mơ của bạn như thế nào nhỉ ?`, isUser: false },
      { text: `Hãy tự thiết kế ${activeTab.toLowerCase()} của bạn bằng các công cụ bên trái nha! Bé Song sẽ gợi ý lựa chọn phù hợp cho bạn nè!`, isUser: false }
    ]);
    setActivePropertyIndex(0);
  }, [activeTab]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleOptionSelect = (tab: string, propTitle: string, option: string) => {
    setSelections(prev => ({
      ...prev,
      [tab]: {
        ...(prev[tab] || {}),
        [propTitle]: option
      }
    }));

    // Auto reply from bot when option selected
    if (!messages.some(m => m.text.includes(option))) {
      const botText = `Bé Song đã ghi nhận bạn chọn "${option}" cho phần ${propTitle}. Thật tuyệt vời!`;
      setTimeout(async () => {
        setMessages(prev => [...prev, { text: botText, isUser: false }]);
        await supabase.from('chat_messages').insert({ role: 'assistant', content: botText } as any);
      }, 500);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    const userText = inputValue;
    setMessages(prev => [...prev, { text: userText, isUser: true }]);
    setInputValue('');

    // Insert into DB
    await supabase.from('chat_messages').insert({ role: 'user', content: userText } as any);

    setTimeout(async () => {
      const botText = 'Bé Song đang tìm kiếm lựa chọn hoàn hảo nhất cho ý tưởng của bạn...';
      setMessages(prev => [...prev, { text: botText, isUser: false }]);
      await supabase.from('chat_messages').insert({ role: 'assistant', content: botText } as any);
    }, 1000);
  };

  // Dynamic price calculation
  const currentSelectionsCount = selections[activeTab] ? Object.keys(selections[activeTab]).length : 0;
  const currentPrice = (livePrices[activeTab] || basePrices[activeTab]) + (currentSelectionsCount * 500000);

  return (
    <div className="w-full flex flex-col font-sans mb-10 mt-6 px-4 bg-[#FEF6F7] min-h-screen">

      {/* Upper Navigation Tabs */}
      <div className="max-w-[1200px] w-full mx-auto mb-6 flex justify-center overflow-x-auto no-scrollbar py-2">
        <div className="flex bg-white rounded-full shadow-sm p-1 border border-rose-100">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-3 rounded-full text-xs font-bold tracking-wider transition-all whitespace-nowrap uppercase ${activeTab === tab
                ? 'bg-[#F494A2] text-white shadow-inner'
                : 'bg-transparent text-[#1D3557] hover:text-[#F494A2]'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-[1400px] w-full mx-auto flex flex-col lg:flex-row gap-6 lg:gap-8">

        {/* Left Sidebar (Properties & Options) */}
        <aside className="lg:w-[320px] flex-shrink-0 flex flex-col gap-3">
          {properties.map((prop, idx) => (
            <div key={prop.title} className="flex flex-col bg-white/50 rounded-3xl border border-rose-100 overflow-hidden shadow-sm transition-all">
              <button
                onClick={() => setActivePropertyIndex(idx)}
                className={`w-full flex items-center justify-between px-6 py-4 font-serif text-lg transition-colors ${activePropertyIndex === idx
                  ? 'bg-white text-[#F494A2]'
                  : 'bg-transparent text-[#1D3557] hover:bg-white'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${activePropertyIndex === idx ? 'border-[#F494A2]' : 'border-rose-200 text-rose-300'}`}>
                    {selections[activeTab]?.[prop.title] ? (
                      <div className="w-4 h-4 rounded-full bg-[#F494A2]"></div>
                    ) : (
                      <span className="w-4 h-4 rounded-full border border-current"></span>
                    )}
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="font-bold">{prop.title}</span>
                    {selections[activeTab]?.[prop.title] && (
                      <span className="text-[10px] text-gray-500 font-sans font-medium uppercase tracking-widest">{selections[activeTab][prop.title]}</span>
                    )}
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 text-[#F494A2] transition-transform ${activePropertyIndex === idx ? 'rotate-90' : ''}`} />
              </button>

              {/* Options Expansion */}
              {activePropertyIndex === idx && (
                <div className="flex flex-wrap gap-2 px-6 pb-6 pt-2 bg-white">
                  {prop.options.map(opt => {
                    const isSelected = selections[activeTab]?.[prop.title] === opt;
                    return (
                      <button
                        key={opt}
                        onClick={() => handleOptionSelect(activeTab, prop.title, opt)}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${isSelected
                          ? 'bg-[#F494A2] text-white border-[#F494A2] shadow-sm'
                          : 'bg-rose-50 text-[#1D3557] border-transparent hover:border-[#F494A2]'
                          }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </aside>

        {/* Center Canvas (Preview) */}
        <div className="flex-1 bg-white/70 backdrop-blur-md rounded-[32px] shadow-sm border border-rose-100 overflow-hidden flex flex-col p-6 min-h-[650px]">

          <div className="flex-1 rounded-[24px] overflow-hidden bg-white relative flex mb-6 p-2">

            {/* Main Preview Image */}
            <div className="flex-1 w-full h-full relative overflow-hidden bg-white rounded-2xl md:mr-4">
              <img
                src={liveImages[activeTab] || defaultImages[activeTab]}
                alt="Preview"
                className="absolute inset-0 w-full h-full object-cover rounded-2xl"
                style={{ objectPosition: 'top center' }}
              />
            </div>

            {/* Thumbnail selector column (If not Venue) */}
            {activeTab !== 'Venue' && (
              <div className="w-20 lg:w-24 flex flex-col gap-3 relative z-10 hidden md:flex overflow-y-auto no-scrollbar py-2">
                {[1, 2, 3, 4, 5].map((item, i) => (
                  <button key={item} className={`w-full aspect-square bg-white rounded-xl overflow-hidden border-2 transition-colors shadow-sm shrink-0 ${i === 0 ? 'border-[#F494A2] opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                    <img src={`${liveImages[activeTab] || defaultImages[activeTab]}&sig=${item}`} alt="thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

          </div>

          {/* Details / Capabilities row */}
          <div className="bg-[#FFFDFD] rounded-2xl p-6 shadow-sm border border-rose-50 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="md:w-1/3 border-b md:border-b-0 md:border-r border-rose-100 pb-4 md:pb-0 pr-0 md:pr-6">
              <h3 className="font-bold text-[#1D3557] text-sm mb-2 uppercase tracking-wider">GIỚI THIỆU</h3>
              <p className="text-xs text-[#1D3557]/70 leading-relaxed line-clamp-3">
                Thiết kế mang đậm dấu ấn cá nhân của bạn. Cùng Bé Song Hỷ tạo nên những giá trị độc bản cho ngày trọng đại nhất cuộc đời.
              </p>
            </div>
            <div className="flex-1 flex gap-4 lg:gap-8 justify-around px-4">
              {[
                { title: 'CHẤT LIỆU CAO CẤP' },
                { title: 'THIẾT KẾ ĐỘC QUYỀN' },
                { title: 'MAY ĐO THEO SỐ ĐO' },
                { title: 'BẢO HÀNH TRỌN ĐỜI' }
              ].map((feat, i) => (
                <div key={i} className="flex flex-col items-center text-center max-w-[80px]">
                  <div className="w-10 h-10 rounded-full border border-rose-100 flex items-center justify-center text-[#F494A2] mb-2 shrink-0 bg-white shadow-sm">
                    <Heart className="w-4 h-4 fill-current" />
                  </div>
                  <span className="text-[9px] lg:text-[10px] uppercase font-bold text-[#1D3557] tracking-widest leading-tight">{feat.title}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Sidebar (Pricing & Chat) */}
        <aside className="lg:w-[350px] flex flex-col gap-6">

          <div className="bg-white/70 backdrop-blur-md rounded-[32px] shadow-sm border border-rose-100 p-8 flex flex-col items-center">
            <span className="font-serif text-[#1D3557] font-bold text-lg mb-2 uppercase tracking-widest">Dự Toán Chi Phí</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-[#F494A2] mb-6 tracking-tight">
              {currentPrice.toLocaleString('vi-VN')} <span className="text-xl">VND</span>
            </h2>

            <div className="flex w-full gap-3 mb-3">
              <button className="flex-1 py-3.5 border border-[#F494A2] text-[#F494A2] rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-[#FFF5F5] transition-colors text-center whitespace-nowrap bg-white shadow-sm">
                LƯU THIẾT KẾ
              </button>
              <button className="w-[44px] shrink-0 border border-rose-200 text-[#F494A2] rounded-full flex items-center justify-center hover:bg-[#FFF5F5] bg-white shadow-sm">
                <Heart className="w-4 h-4 fill-current opacity-80" />
              </button>
            </div>
            <button className="w-full py-3.5 bg-[#F494A2] text-white rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-rose-400 transition-colors shadow-md">
              ĐẶT LỊCH THỬ
            </button>
          </div>

          {/* Interactive Chatbot */}
          <div className="bg-white/70 backdrop-blur-md rounded-[32px] shadow-sm border border-rose-100 p-6 flex-1 flex flex-col relative overflow-hidden">

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 mb-4 relative z-10 flex flex-col pr-2">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`text-xs p-4 rounded-[20px] max-w-[85%] shadow-sm leading-relaxed font-medium ${msg.isUser
                    ? 'bg-[#FFF5F5] text-[#1D3557] rounded-tr-sm self-end ml-auto border border-rose-100'
                    : 'bg-white text-[#1D3557] rounded-tl-sm self-start mr-auto border border-rose-100'
                    }`}
                >
                  {msg.text}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="relative z-10 w-full mt-auto pt-2 bg-white/50 backdrop-blur-md">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Nhập yêu cầu của bạn..."
                className="w-full bg-white border border-rose-100 rounded-full py-3.5 px-6 pr-14 text-xs font-medium focus:ring-1 focus:ring-[#F494A2] focus:outline-none shadow-sm text-[#1D3557] placeholder:text-gray-400"
              />
              <button
                onClick={handleSendMessage}
                className="absolute right-1.5 top-[50%] -translate-y-[35%] w-9 h-9 bg-[#F494A2] text-white rounded-full flex items-center justify-center hover:bg-rose-400 shadow-sm"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </div>

          </div>

        </aside>

      </div>

    </div>
  );
}
