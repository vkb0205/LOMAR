import React, { useState, useEffect, useRef } from 'react';
import { Send, Heart, ChevronRight, ChevronDown, Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Database } from '../types/database';
import { useAppContext } from '../context/AppContext';
import maleMannequin from '../img/male_mannequin.jpeg';
import femaleMannequin from '../img/female_mannequin.jpeg';

type ChatMessageRow = Database['public']['Tables']['chat_messages']['Row'];
type ServiceRow = Database['public']['Tables']['services']['Row'];
type VendorRow = Database['public']['Tables']['vendors']['Row'];

const MOCK_USER_ID = 'user_1';
const MOCK_THREAD_ID = '00000000-0000-0000-0000-000000000000';

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1519225495810-7512c696505a?auto=format&fit=crop&q=80&w=1000';
const CUSTOMIZE_TEMP_PREVIEW_KEY = 'lomar_customize_temp_preview';

export default function Customize() {
  const { customizedServices, saveCustomizedService } = useAppContext();
  const [activeTab, setActiveTab] = useState('');
  const [activePropertyIndex, setActivePropertyIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedMannequin, setSelectedMannequin] = useState<'female' | 'male'>('female');

  // Chat state
  const [messages, setMessages] = useState<{ text: string, isUser: boolean }[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [generatedPreviewUrl, setGeneratedPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);

  // State lưu trữ TẤT CẢ dữ liệu từ Supabase (v2: services, service_images)
  const [allServices, setAllServices] = useState<ServiceRow[]>([]);
  const [allVendors, setAllVendors] = useState<Record<string, VendorRow>>({});
  const [allImages, setAllImages] = useState<Record<string, string[]>>({});

  const [tabs, setTabs] = useState<string[]>([]);

  // State: Lưu ID của service đang được chọn cho từng Tab
  const [activeProductIds, setActiveProductIds] = useState<Record<string, string>>({});
  const [selectedThumb, setSelectedThumb] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLiveData() {
      try {
        const { data: serviceData } = await supabase.from('services').select('*');
        const { data: imageData } = await supabase.from('service_images').select('*');
        const { data: vendorData } = await supabase.from('vendors').select('*');

        if (serviceData && serviceData.length > 0) {
          const typedServices = serviceData as ServiceRow[];
          setAllServices(typedServices);

          // Chỉ hiển thị các danh mục cho phép tùy chỉnh
          const allowedCategories = ['Váy Cưới', 'Vest', 'Venue'];
          const uniqueCategories = [...new Set(typedServices.map(s => s.category).filter(Boolean))] as string[];
          const displayTabs = uniqueCategories.filter(cat => allowedCategories.includes(cat));
          if (displayTabs.length > 0) {
            setTabs(displayTabs);
          } else {
            setTabs(allowedCategories);
          }

          // Tạo vendor map
          if (vendorData) {
            const vMap: Record<string, VendorRow> = {};
            vendorData.forEach((v: any) => vMap[v.id] = v);
            setAllVendors(vMap);
          }

          // Phân loại hình ảnh cho từng service
          const imgMap: Record<string, string[]> = {};
          typedServices.forEach(s => {
            const sImgs = (imageData as any[])?.filter((img: any) => img.service_id === s.id)
              .sort((a: any, b: any) => (b.is_main ? 1 : 0) - (a.is_main ? 1 : 0))
              .map((img: any) => img.image_url || '')
              .filter(url => !!url) || [];
            imgMap[s.id] = sImgs.length > 0 ? sImgs : (s.thumbnail_url ? [s.thumbnail_url] : []);
          });
          setAllImages(imgMap);

          // Gán mặc định hoặc lấy từ customizedServices đã lưu
          const initialActiveIds: Record<string, string> = {};

          const activeCats = displayTabs.length > 0 ? displayTabs : allowedCategories;
          activeCats.forEach(cat => {
            const saved = customizedServices[cat];
            if (saved) {
              initialActiveIds[cat] = saved.productId;
            } else {
              const firstService = typedServices.find(s => s.category?.toLowerCase() === cat.toLowerCase());
              if (firstService) initialActiveIds[cat] = firstService.id;
            }
          });
          setActiveProductIds(initialActiveIds);

          if (activeCats.length > 0) {
            setActiveTab(activeCats[0]);
          }
        }
      } catch (error) {
        console.error('Lỗi khi fetch data:', error);
      }
    }
    fetchLiveData();
  }, []);

  // Tự động kiểm tra và sửa activeProductIds nếu ID không tồn tại
  useEffect(() => {
    if (activeTab && allServices.length > 0) {
      const currentId = activeProductIds[activeTab];
      const exists = allServices.some(s => s.id === currentId);
      if (!exists) {
        const fallbackSvc = allServices.find(s => s.category?.toLowerCase() === activeTab?.toLowerCase());
        if (fallbackSvc) {
          setActiveProductIds(prev => ({ ...prev, [activeTab]: fallbackSvc.id }));
        }
      }
    }
  }, [activeTab, allServices, activeProductIds]);

  // Lấy dữ liệu của service HIỆN TẠI đang được chọn
  const activeProductId = activeProductIds[activeTab];
  const activeService = allServices.find(s => s.id === activeProductId);
  const vendorInfo = activeService?.vendor_id ? allVendors[activeService.vendor_id] : null;

  // Customization in v2 uses AI generation (ai_design_projects/generations), not option-based
  const currentProperties: any[] = [];

  // Sync customization state to AppContext
  useEffect(() => {
    if (!activeProductId || !activeService) return;

    const currentService = {
      category: activeTab,
      productId: activeProductId,
      productName: activeService.name || '',
      basePrice: Number(activeService.base_price || 0),
      totalPrice: Number(activeService.base_price || 0),
      imageUrl: allImages[activeProductId]?.[0] || PLACEHOLDER_IMAGE,
      vendorName: vendorInfo?.name || 'Bé Song Hỷ',
      selectedOptions: []
    };

    const prevSaved = customizedServices[activeTab];
    const isDifferent = !prevSaved || prevSaved.productId !== activeProductId;

    if (isDifferent) {
      saveCustomizedService(activeTab, currentService);
    }
  }, [activeTab, activeProductId, activeService, allImages, vendorInfo, customizedServices, saveCustomizedService]);

  const getTempPreviewKey = (tab = activeTab, productId = activeProductId, mannequin = selectedMannequin) => {
    return [tab, productId, mannequin].filter(Boolean).join('__');
  };

  const readTempPreviewMap = () => {
    if (typeof window === 'undefined') return {} as Record<string, string>;
    try {
      return JSON.parse(window.localStorage.getItem(CUSTOMIZE_TEMP_PREVIEW_KEY) || '{}') as Record<string, string>;
    } catch {
      return {} as Record<string, string>;
    }
  };

  const saveTempPreview = (imageUrl: string) => {
    if (typeof window === 'undefined') return;
    try {
      const tempPreviewMap = readTempPreviewMap();
      const tempKey = getTempPreviewKey();
      if (!tempKey) return;
      window.localStorage.setItem(CUSTOMIZE_TEMP_PREVIEW_KEY, JSON.stringify({
        ...tempPreviewMap, [tempKey]: imageUrl
      }));
    } catch (error) {
      console.error('Lỗi khi lưu ảnh tạm:', error);
    }
  };

  useEffect(() => {
    const tempKey = getTempPreviewKey();
    if (!tempKey) { setGeneratedPreviewUrl(null); return; }
    const tempPreviewUrl = readTempPreviewMap()[tempKey] || null;
    setGeneratedPreviewUrl(tempPreviewUrl);
  }, [activeTab, activeProductId, selectedMannequin]);

  // Handle thay đổi service (Dropdown)
  const handleProductChange = (newProductId: string) => {
    setActiveProductIds(prev => ({ ...prev, [activeTab]: newProductId }));
    setSelectedThumb(null);
    setActivePropertyIndex(0);
  };

  // Fetch chat history from Supabase
  useEffect(() => {
    async function fetchChat() {
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', MOCK_USER_ID)
        .order('created_at', { ascending: true });

      if (data && data.length > 0) {
        setMessages((data as ChatMessageRow[]).map(m => ({ text: m.content || '', isUser: m.role === 'user' })));
      }
    }
    fetchChat();
  }, []);

  // Update chat greeting when tab changes
  useEffect(() => {
    if (activeTab) {
      setMessages([
        { text: `Mẫu ${activeTab.toLowerCase()} trong mơ của bạn như thế nào nhỉ ?`, isUser: false },
        { text: `Hãy tự thiết kế ${activeTab.toLowerCase()} của bạn bằng các công cụ bên trái nha! Bé Song sẽ gợi ý lựa chọn phù hợp cho bạn nè!`, isUser: false }
      ]);
      setActivePropertyIndex(0);
      setSelectedThumb(null);
    }
  }, [activeTab]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const insertChatMessage = async (role: string, content: string) => {
    await supabase.from('chat_messages').insert({
      user_id: MOCK_USER_ID,
      role,
      content,
      thread_id: MOCK_THREAD_ID
    } as any);
  };

  const getTryOnCategory = (categoryName: string) => {
    const normalized = categoryName.toLowerCase();
    if (normalized.includes('vest')) return 'tops';
    if (normalized.includes('váy') || normalized.includes('vay') || normalized.includes('dress')) return 'dress';
    return 'clothes';
  };

  const buildGenerationPrompt = (customPrompt: string) => {
    return [
      `Create a premium wedding customization preview for category: ${activeTab}.`,
      activeService?.name ? `Base product: ${activeService.name}.` : '',
      vendorInfo?.name ? `Vendor: ${vendorInfo.name}.` : '',
      customPrompt ? `User request: ${customPrompt}.` : '',
      'Style: elegant, realistic, romantic, luxury Vietnamese wedding aesthetic, high quality image preview.'
    ].filter(Boolean).join(' ');
  };

  const _urlToBlob = async (url: string, label: string): Promise<Blob> => {
    const isExternal = url.startsWith('http') || url.startsWith('data:');
    let resolvedUrl: string;
    if (isExternal) {
      if (url.startsWith('data:')) {
        resolvedUrl = url;
      } else {
        const vtonBackendUrl = (import.meta.env.VITE_VTON_BACKEND_URL || '').replace(/\/+$/, '');
        const isProduction = vtonBackendUrl && !vtonBackendUrl.includes('localhost') && !vtonBackendUrl.includes('127.0.0.1');
        const proxyBaseUrl = isProduction ? vtonBackendUrl : '/api/vton';
        resolvedUrl = `${proxyBaseUrl}/proxy-image?url=${encodeURIComponent(url)}`;
      }
    } else {
      resolvedUrl = new URL(url, window.location.origin).href;
    }
    const resp = await fetch(resolvedUrl);
    if (!resp.ok) throw new Error(`Cannot fetch ${label} image (${resp.status} ${resp.statusText}): ${resolvedUrl}`);
    return resp.blob();
  };

  const handleGeneratePreview = async () => {
    const customPrompt = inputValue.trim();
    const prompt = buildGenerationPrompt(customPrompt);
    const userText = customPrompt || 'Tạo ảnh xem trước từ các tùy chọn hiện tại.';

    const vtonBackendUrl = (import.meta.env.VITE_VTON_BACKEND_URL || '').replace(/\/+$/, '');
    const configuredEndpoint = import.meta.env.VITE_VERTEX_AI_ENDPOINT || '/test-try-on-upload';
    const isProduction = vtonBackendUrl && !vtonBackendUrl.includes('localhost') && !vtonBackendUrl.includes('127.0.0.1');

    if (!vtonBackendUrl) {
      setMessages(prev => [...prev, { text: 'Bé Song chưa thể tạo ảnh thử đồ. Backend chưa được cấu hình.', isUser: false }]);
      return;
    }

    let endpoint: string;
    if (isProduction) {
      const endpointPath = configuredEndpoint.startsWith('/') ? configuredEndpoint : `/${configuredEndpoint}`;
      endpoint = `${vtonBackendUrl}${endpointPath}`;
    } else {
      endpoint = configuredEndpoint.startsWith('/test-') ? `/api/vton${configuredEndpoint}` : configuredEndpoint;
    }

    if (!endpoint) {
      setMessages(prev => [...prev, { text: 'Bé Song chưa thể tạo ảnh thử đồ. Thiếu cấu hình endpoint.', isUser: false }]);
      return;
    }

    if (!activeService || !currentMainImage) {
      setMessages(prev => [...prev, { text: 'Bé Song cần bạn chọn một sản phẩm trước khi tạo ảnh thử đồ nha!', isUser: false }]);
      return;
    }

    setMessages(prev => [...prev, { text: userText, isUser: true }]);
    setInputValue('');
    setIsGenerating(true);

    await insertChatMessage('user', userText);

    let bodyBlob: Blob;
    let garmentBlob: Blob;

    try {
      [bodyBlob, garmentBlob] = await Promise.all([
        _urlToBlob(mannequinImage, 'mannequin'),
        _urlToBlob(currentMainImage, 'garment'),
      ]);
    } catch (imageError) {
      const imgErrMsg = imageError instanceof Error ? imageError.message : 'Unknown image error';
      console.error('Lỗi khi tải ảnh:', imgErrMsg);
      const userMsg = `Bé Song không thể tải ảnh: ${imgErrMsg}`;
      setMessages(prev => [...prev, { text: userMsg, isUser: false }]);
      await insertChatMessage('assistant', userMsg);
      setIsGenerating(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('body_image', bodyBlob, 'body.png');
      formData.append('garment_image', garmentBlob, 'garment.png');
      formData.append('category', getTryOnCategory(activeTab));
      formData.append('prompt', prompt);

      const response = await fetch(endpoint, { method: 'POST', body: formData });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`VTON backend error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      const imageUrl = data.imageUrl || data.image_url || data.output?.imageUrl || data.output?.image_url;

      if (!imageUrl) throw new Error(`VTON response did not include an image URL: ${JSON.stringify(data)}`);

      setGeneratedPreviewUrl(imageUrl);
      saveTempPreview(imageUrl);
      const aiText = data.message || 'Bé Song đã tạo ảnh thử đồ trên mannequin từ mẫu bạn chọn.';
      setMessages(prev => [...prev, { text: aiText, isUser: false }]);
      await insertChatMessage('assistant', aiText);
    } catch (vtonError) {
      console.error('Lỗi khi gọi VTON backend:', vtonError);
      const vtonErrMsg = vtonError instanceof Error ? vtonError.message : 'Unknown error';
      const fallbackText = `Bé Song chưa thể tạo ảnh thử đồ. Chi tiết: ${vtonErrMsg}`;
      setMessages(prev => [...prev, { text: fallbackText, isUser: false }]);
      await insertChatMessage('assistant', fallbackText);
    } finally {
      setIsGenerating(false);
    }
  };

  // Tính giá = base_price
  let currentPrice = Number(activeService?.base_price || 0);

  const handleSaveDesign = async () => {
    if (!activeService) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('ai_design_projects')
        .insert({
          user_id: MOCK_USER_ID,
          category: activeTab,
          service_id: activeService.id,
          title: activeService.name || 'Untitled design',
          status: 'draft'
        } as any);

      if (error) throw error;
      alert('Lưu thiết kế thành công!');
    } catch (error) {
      console.error('Lỗi khi lưu thiết kế:', error);
      alert('Đã xảy ra lỗi khi lưu thiết kế. Vui lòng thử lại!');
    } finally {
      setIsSaving(false);
    }
  };

  // Quản lý hình ảnh hiển thị
  const serviceImages = activeProductId ? allImages[activeProductId] : [];
  const baseImage = serviceImages?.[0] || PLACEHOLDER_IMAGE;
  const currentMainImage = selectedThumb || baseImage;
  const mannequinImage = selectedMannequin === 'male' ? maleMannequin : femaleMannequin;
  const previewImage = generatedPreviewUrl || mannequinImage;

  return (
    <div className="w-full flex flex-col font-sans pb-10 mt-6 px-4 bg-[#FFFFFF] min-h-screen">
      <div className="max-w-[1200px] w-full mx-auto mb-6 flex justify-center overflow-x-auto no-scrollbar py-2">
        <div className="flex bg-white rounded-full shadow-sm p-1 border border-rose-100">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-3 rounded-full text-xs font-bold tracking-wider transition-all whitespace-nowrap uppercase ${activeTab === tab ? 'bg-[#ffe9c9] text-[#1B2C40] shadow-inner' : 'bg-transparent text-[#1B2C40] hover:text-[#ddb983]'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'Venue' ? (
        <div className="w-full flex flex-col items-center justify-center py-24 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-[#FAF6EE] border border-rose-100 mb-8">
            <span className="text-4xl">🏛️</span>
          </div>
          <h2 className="text-4xl font-serif font-bold text-[#1B2C40] mb-4 tracking-wide">SẮP RA MẮT</h2>
          <p className="text-sm text-gray-500 font-medium max-w-md leading-relaxed">
            Tính năng tùy chỉnh Venue đang được phát triển.
            Bé Song sẽ sớm ra mắt trong thời gian tới!
          </p>
          <div className="mt-10 flex gap-3">
            <div className="w-3 h-3 rounded-full bg-[#ffdb9f] animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-3 h-3 rounded-full bg-[#ffdb9f] animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-3 h-3 rounded-full bg-[#ffdb9f] animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      ) : (
      <div className="max-w-[1400px] w-full mx-auto flex flex-col lg:flex-row gap-6 lg:gap-8 lg:h-[800px] items-start">

        {/* Left Sidebar */}
        <aside className="lg:w-[320px] flex-shrink-0 flex flex-col gap-3 overflow-y-auto no-scrollbar pb-4 h-full">

          {/* BỘ CHỌN SERVICE - CUSTOM VISUAL DROPDOWN */}
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl border border-rose-100 p-4 shadow-sm mb-2 relative z-20">
            <label className="block text-[10px] font-bold text-[#ddb983] mb-3 uppercase tracking-widest">
              Chọn Mẫu {activeTab}
            </label>

            <div className="relative">
              <button
                onClick={() => setIsProductDropdownOpen(!isProductDropdownOpen)}
                className="w-full bg-white border border-rose-100 text-[#1B2C40] rounded-2xl p-3 text-sm font-serif flex items-center justify-between hover:border-[#ffdb9f] transition-colors shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-16 rounded-lg overflow-hidden border border-rose-50 shadow-sm shrink-0 bg-gray-50">
                    <img
                      src={allImages[activeProductId]?.[0] || PLACEHOLDER_IMAGE}
                      alt=""
                      className="w-full h-full object-cover object-top"
                      onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE }}
                    />
                  </div>
                  <div className="flex flex-col items-start text-left">
                    <span className="font-bold line-clamp-2 text-[15px]">{activeService?.name || 'Chọn sản phẩm'}</span>
                    <span className="text-[10px] text-gray-500 font-sans font-medium uppercase mt-1 tracking-wider">Mẫu hiện tại</span>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-[#ffdb9f] transition-transform ${isProductDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isProductDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setIsProductDropdownOpen(false)}></div>
                  <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white rounded-2xl shadow-xl border border-rose-50 overflow-hidden z-30 animate-in fade-in zoom-in duration-200">
                    <div className="max-h-[350px] overflow-y-auto no-scrollbar p-2 space-y-1">
                      {allServices.filter(s => s.category?.toLowerCase() === activeTab?.toLowerCase()).length === 0 ? (
                        <div className="text-center p-6 text-xs text-gray-500 font-sans">
                          Không tìm thấy sản phẩm nào cho danh mục này.
                        </div>
                      ) : (
                        allServices.filter(s => s.category?.toLowerCase() === activeTab?.toLowerCase()).map(s => (
                          <button
                            key={s.id}
                            onClick={() => { handleProductChange(s.id); setIsProductDropdownOpen(false); }}
                            className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all ${activeProductId === s.id ? 'bg-rose-50 border border-rose-100' : 'hover:bg-rose-50/50 border border-transparent'}`}
                          >
                            <div className="w-12 h-16 rounded-lg overflow-hidden border border-white shadow-sm flex-shrink-0 bg-gray-50">
                              <img
                                src={allImages[s.id]?.[0] || PLACEHOLDER_IMAGE}
                                alt=""
                                className="w-full h-full object-cover object-top"
                                onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE }}
                              />
                            </div>
                            <div className="flex flex-col items-start text-left pr-2">
                              <span className={`text-sm font-bold line-clamp-2 leading-tight ${activeProductId === s.id ? 'text-[#ddb983]' : 'text-[#1B2C40]'}`}>
                                {s.name}
                              </span>
                              <span className="text-[11px] text-gray-500 font-medium mt-1">
                                {Number(s.base_price || 0).toLocaleString('vi-VN')} VND
                              </span>
                            </div>
                            {activeProductId === s.id && (
                              <div className="ml-auto w-2 h-2 rounded-full bg-[#ffdb9f] shrink-0"></div>
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Customization options removed in v2 — replaced by AI generation */}
          <div className="relative z-10 space-y-3">
            <div className="text-center p-6 text-sm text-gray-500 bg-white/50 rounded-3xl border border-rose-100">
              Tùy chỉnh AI — Hãy nhập mô tả hoặc yêu cầu trong chat bên phải để Bé Song tạo thiết kế.
            </div>
          </div>
        </aside>

        {/* Center Canvas */}
        <div className="flex-1 bg-white/70 backdrop-blur-md rounded-[32px] shadow-sm border border-rose-100 overflow-hidden flex flex-col p-6 min-h-[500px] lg:min-h-0 h-full">
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-serif font-bold text-[#1B2C40]">
                {activeService?.name || activeTab}
              </h1>
              {vendorInfo && (
                <p className="text-xs text-[#ddb983] font-bold uppercase tracking-widest mt-1">
                  Bởi {vendorInfo.name}
                </p>
              )}
            </div>
            <div className="flex bg-white rounded-full shadow-sm p-1 border border-rose-100 self-start">
              <button
                type="button"
                onClick={() => setSelectedMannequin('female')}
                className={`px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${selectedMannequin === 'female' ? 'bg-[#ffe9c9] text-[#1B2C40] shadow-inner' : 'text-[#1B2C40] hover:text-[#ddb983]'}`}
              >
                Nữ
              </button>
              <button
                type="button"
                onClick={() => setSelectedMannequin('male')}
                className={`px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${selectedMannequin === 'male' ? 'bg-[#ffe9c9] text-[#1B2C40] shadow-inner' : 'text-[#1B2C40] hover:text-[#ddb983]'}`}
              >
                Nam
              </button>
            </div>
          </div>

          <div className="flex-1 rounded-[24px] overflow-hidden bg-white relative flex flex-col mb-6 p-3">
            <div className="flex-1 min-h-[360px] relative overflow-hidden bg-[#FAF6EE] rounded-2xl border border-rose-50">
              <img
                src={previewImage}
                alt="AI Preview"
                className="absolute inset-0 w-full h-full object-cover rounded-2xl transition-opacity duration-500"
                style={{ objectPosition: 'top center' }}
                onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE }}
              />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-full text-[10px] font-bold text-[#ddb983] uppercase tracking-widest shadow-sm flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                {generatedPreviewUrl ? 'Xem trước AI' : `Người mẫu ${selectedMannequin === 'female' ? 'Nữ' : 'Nam'}`}
              </div>
              {isGenerating && (
                <div className="absolute inset-0 bg-white/65 backdrop-blur-sm flex flex-col items-center justify-center text-[#1B2C40]">
                  <Loader2 className="w-8 h-8 text-[#ffdb9f] animate-spin mb-3" />
                  <span className="text-xs font-bold uppercase tracking-widest">Đang tạo ảnh bằng Vertex AI...</span>
                </div>
              )}
            </div>

            <div className="bg-[#FAF6EE] rounded-2xl p-4 border border-rose-50 shadow-sm mt-1">
              <label className="block text-[10px] font-bold text-[#ddb983] mb-3 uppercase tracking-widest">
                Prompt thiết kế / yêu cầu AI
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleGeneratePreview(); }}
                  placeholder="Nhập ý tưởng của bạn hoặc chọn các tùy chọn bên trái rồi bấm Tạo ảnh..."
                  className="flex-1 min-h-[92px] bg-white border border-rose-100 rounded-2xl py-3 px-4 text-xs font-medium focus:ring-1 focus:ring-[#ffdb9f] focus:outline-none shadow-sm text-[#1B2C40] placeholder:text-gray-400 resize-none"
                />
                <button
                  onClick={handleGeneratePreview}
                  disabled={isGenerating || !activeService}
                  className="sm:w-[150px] py-3.5 bg-[#ffe9c9] text-[#1B2C40] rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-[#ffdb9f] transition-colors shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Tạo ảnh
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar (Pricing & Chat) */}
        <aside className="lg:w-[350px] flex flex-col gap-6 h-full min-h-0">
          <div className="bg-white/70 backdrop-blur-md rounded-[32px] shadow-sm border border-rose-100 p-8 flex flex-col items-center">
            <span className="font-serif text-[#1B2C40] font-bold text-lg mb-2 uppercase tracking-widest">Dự Toán Chi Phí</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-[#ddb983] mb-6 tracking-tight">
              {currentPrice.toLocaleString('vi-VN')} <span className="text-xl">VND</span>
            </h2>

            <div className="flex w-full gap-3 mb-3">
              <button
                onClick={handleSaveDesign}
                disabled={isSaving}
                className="flex-1 py-3.5 border border-[#ffdb9f] text-[#ddb983] rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-[#FAF6EE] transition-colors text-center whitespace-nowrap bg-white shadow-sm disabled:opacity-50"
              >
                {isSaving ? 'ĐANG LƯU...' : 'LƯU THIẾT KẾ'}
              </button>
              <button className="w-[44px] shrink-0 border border-rose-200 text-[#ddb983] rounded-full flex items-center justify-center hover:bg-[#FAF6EE] bg-white shadow-sm">
                <Heart className="w-4 h-4 fill-current opacity-80" />
              </button>
            </div>
            <button className="w-full py-3.5 bg-[#ffe9c9] text-[#1B2C40] rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-[#ffdb9f] transition-colors shadow-md">
              ĐẶT LỊCH THỬ
            </button>
          </div>

          <div className="bg-white/70 backdrop-blur-md rounded-[32px] shadow-sm border border-[#ffdb9f]/30 p-6 flex-1 flex flex-col relative overflow-hidden h-[325px]">
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto no-scrollbar space-y-4 mb-4 relative z-10 flex flex-col pr-2">
              {messages.map((msg, i) => (
                <div key={i} className={`text-xs p-4 rounded-[20px] max-w-[85%] shadow-sm leading-relaxed font-medium ${msg.isUser
                  ? 'bg-[#FAF6EE] text-[#1B2C40] rounded-tr-sm self-end ml-auto border border-[#ffdb9f]/30'
                  : 'bg-white text-[#1B2C40] rounded-tl-sm self-start mr-auto border border-[#ffdb9f]/30'}`}
                >
                  {msg.text}
                </div>
              ))}
            </div>
            <div className="relative z-10 w-full mt-auto pt-4 pb-2 bg-white/50 backdrop-blur-md border-t border-[#ffdb9f]/30">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGeneratePreview()}
                placeholder="Nhập yêu cầu của bạn..."
                className="w-full bg-white border border-[#ffdb9f]/30 rounded-full py-3.5 px-6 pr-14 text-xs font-medium focus:ring-1 focus:ring-[#ffdb9f] focus:outline-none shadow-sm text-[#1B2C40] placeholder:text-gray-400"
              />
              <button
                onClick={handleGeneratePreview}
                disabled={isGenerating || !activeService}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#ffe9c9] text-[#1B2C40] rounded-full flex items-center justify-center hover:bg-[#ffdb9f] shadow-sm transition-transform active:scale-95 animate-in zoom-in duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </div>
          </div>
        </aside>
      </div>
      )}
    </div>
  );
}
