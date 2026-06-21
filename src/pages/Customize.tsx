import React, { useState, useEffect, useRef } from 'react';
import { Send, Heart, ChevronRight, ChevronDown, Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Database } from '../types/database';
import { useAppContext } from '../context/AppContext';
import maleMannequin from '../img/male_mannequin.webp';
import femaleMannequin from '../img/female_mannequin.webp';

type ChatMessageRow = Database['public']['Tables']['chat_messages']['Row'];
type ProductRow = Database['public']['Tables']['products']['Row'];
type VendorRow = Database['public']['Tables']['vendors']['Row'];

type OptionGroup = {
  id: string;
  title: string;
  options: { id: string; name: string; price: number }[];
};

const MOCK_USER_ID = 'user_1';

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1519225495810-7512c696505a?auto=format&fit=crop&q=80&w=1000';
const CUSTOMIZE_TEMP_PREVIEW_KEY = 'lomar_customize_temp_preview';

export default function Customize() {
  const { customizedServices, saveCustomizedService } = useAppContext();
  const [activeTab, setActiveTab] = useState('');
  const [activePropertyIndex, setActivePropertyIndex] = useState(0);
  const [selections, setSelections] = useState<Record<string, Record<string, string>>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [selectedMannequin, setSelectedMannequin] = useState<'female' | 'male'>('female');

  // Chat state
  const [messages, setMessages] = useState<{ text: string, isUser: boolean }[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [generatedPreviewUrl, setGeneratedPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);

  // State lưu trữ TẤT CẢ dữ liệu từ Supabase
  const [allProducts, setAllProducts] = useState<ProductRow[]>([]);
  const [allVendors, setAllVendors] = useState<Record<string, VendorRow>>({});
  const [allImages, setAllImages] = useState<Record<string, string[]>>({});
  const [allOptions, setAllOptions] = useState<any[]>([]); // Lưu raw options data
  const [productOptionMap, setProductOptionMap] = useState<any[]>([]); // Lưu product_options

  const [tabs, setTabs] = useState<string[]>([]);

  // State cực kỳ quan trọng: Lưu ID của sản phẩm đang được chọn cho từng Tab
  const [activeProductIds, setActiveProductIds] = useState<Record<string, string>>({});
  const [selectedThumb, setSelectedThumb] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLiveData() {
      try {
        const { data: productData } = await supabase.from('products').select('*');
        const { data: imageData } = await supabase.from('product_images').select('*');
        const { data: prodOptData } = await supabase.from('product_options').select('*');
        const { data: vendorData } = await supabase.from('vendors').select('*');
        const { data: custData } = await supabase
          .from('customization_options')
          .select(`id, category, name, customization_values ( id, value_name, extra_price )`)
          .order('display_order', { ascending: true });

        if (productData && productData.length > 0) {
          const typedProducts = productData as ProductRow[];
          setAllProducts(typedProducts);
          if (prodOptData) setProductOptionMap(prodOptData);
          if (custData) setAllOptions(custData);

          // Chỉ hiển thị các danh mục cho phép tùy chỉnh
          const allowedCategories = ['Váy Cưới', 'Vest', 'Venue'];
          const uniqueCategories = [...new Set(typedProducts.map(p => p.category).filter(Boolean))] as string[];
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

          // Phân loại hình ảnh cho từng sản phẩm
          const imgMap: Record<string, string[]> = {};
          typedProducts.forEach(p => {
            const pImgs = (imageData as any[])?.filter(img => img.product_id === p.id)
              .sort((a, b) => (b.is_main ? 1 : 0) - (a.is_main ? 1 : 0))
              .map(img => img.image_url || '')
              .filter(url => !!url) || [];
            imgMap[p.id] = pImgs.length > 0 ? pImgs : (p.image_url ? [p.image_url] : []);
          });
          setAllImages(imgMap);

          // Gán mặc định hoặc lấy từ customizedServices đã lưu
          const initialActiveIds: Record<string, string> = {};
          const initialSelections: Record<string, Record<string, string>> = {};

          const activeCats = displayTabs.length > 0 ? displayTabs : allowedCategories;
          activeCats.forEach(cat => {
            const saved = customizedServices[cat];
            if (saved) {
              initialActiveIds[cat] = saved.productId;
              const sel: Record<string, string> = {};
              saved.selectedOptions.forEach(opt => {
                sel[opt.optionGroupId] = opt.valueId;
              });
              initialSelections[cat] = sel;
            } else {
              const firstProduct = typedProducts.find(p => p.category?.toLowerCase() === cat.toLowerCase());
              if (firstProduct) initialActiveIds[cat] = firstProduct.id;
            }
          });
          setActiveProductIds(initialActiveIds);
          setSelections(initialSelections);

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

  // Tự động kiểm tra và sửa activeProductIds nếu ID sản phẩm không tồn tại trong database (ví dụ do mock data cũ lưu trong localStorage)
  useEffect(() => {
    if (activeTab && allProducts.length > 0) {
      const currentId = activeProductIds[activeTab];
      const exists = allProducts.some(p => p.id === currentId);
      if (!exists) {
        const fallbackProd = allProducts.find(p => p.category?.toLowerCase() === activeTab?.toLowerCase());
        if (fallbackProd) {
          setActiveProductIds(prev => ({ ...prev, [activeTab]: fallbackProd.id }));
        }
      }
    }
  }, [activeTab, allProducts, activeProductIds]);

  // Lấy dữ liệu của sản phẩm HIỆN TẠI đang được chọn
  const activeProductId = activeProductIds[activeTab];
  const activeProduct = allProducts.find(p => p.id === activeProductId);
  const vendorInfo = activeProduct?.vendor_id ? allVendors[activeProduct.vendor_id] : null;

  // Tính toán Customization Options chỉ dành riêng cho sản phẩm hiện tại
  const currentProperties: OptionGroup[] = React.useMemo(() => {
    if (!activeProduct) return [];
    // Tìm các option_id được phép dùng cho product này
    const allowedOptionIds = productOptionMap.filter(po => po.product_id === activeProduct.id).map(po => po.option_id);

    return allOptions
      .filter(opt => allowedOptionIds.includes(opt.id))
      .map(opt => {
        const vals = (opt.customization_values || []).map((v: any) => ({
          id: v.id, name: v.value_name, price: Number(v.extra_price || 0)
        }));
        return { id: opt.id, title: opt.name || 'Tùy chọn', options: vals };
      });
  }, [activeProduct, productOptionMap, allOptions]);

  // Đồng bộ lựa chọn tự động sang AppContext khi người dùng thay đổi sản phẩm hoặc tùy chọn
  useEffect(() => {
    if (!activeProductId || !activeProduct) return;

    // Lấy thông tin options đang chọn
    const activeTabSelections = selections[activeTab] || {};
    const selectedOptionDetails: any[] = [];
    let totalPrice = Number(activeProduct.price || 0);

    currentProperties.forEach(prop => {
      const selectedValueId = activeTabSelections[prop.id];
      if (selectedValueId) {
        const optionVal = prop.options.find(o => o.id === selectedValueId);
        if (optionVal) {
          totalPrice += optionVal.price;
          selectedOptionDetails.push({
            optionGroupId: prop.id,
            optionGroupName: prop.title,
            valueId: selectedValueId,
            valueName: optionVal.name,
            price: optionVal.price
          });
        }
      }
    });

    const currentService = {
      category: activeTab,
      productId: activeProductId,
      productName: activeProduct.name || '',
      basePrice: Number(activeProduct.price || 0),
      totalPrice: totalPrice,
      imageUrl: allImages[activeProductId]?.[0] || PLACEHOLDER_IMAGE,
      vendorName: vendorInfo?.name || 'Bé Song Hỷ',
      selectedOptions: selectedOptionDetails
    };

    // Chỉ lưu nếu có thay đổi thực sự
    const prevSaved = customizedServices[activeTab];
    const isDifferent = !prevSaved ||
      prevSaved.productId !== activeProductId ||
      JSON.stringify(prevSaved.selectedOptions) !== JSON.stringify(selectedOptionDetails);

    if (isDifferent) {
      saveCustomizedService(activeTab, currentService);
    }
  }, [
    activeTab,
    activeProductId,
    selections,
    activeProduct,
    currentProperties,
    allImages,
    vendorInfo,
    customizedServices,
    saveCustomizedService
  ]);

  const getTempPreviewKey = (tab = activeTab, productId = activeProductId, mannequin = selectedMannequin) => {
    return [tab, productId, mannequin].filter(Boolean).join('__');
  };

  const readTempPreviewMap = () => {
    if (typeof window === 'undefined') return {} as Record<string, string>;

    try {
      return JSON.parse(window.localStorage.getItem(CUSTOMIZE_TEMP_PREVIEW_KEY) || '{}') as Record<string, string>;
    } catch (error) {
      console.error('Lỗi khi đọc ảnh tạm:', error);
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
        ...tempPreviewMap,
        [tempKey]: imageUrl
      }));
    } catch (error) {
      console.error('Lỗi khi lưu ảnh tạm:', error);
    }
  };

  useEffect(() => {
    const tempKey = getTempPreviewKey();
    if (!tempKey) {
      setGeneratedPreviewUrl(null);
      return;
    }

    const tempPreviewUrl = readTempPreviewMap()[tempKey] || null;
    setGeneratedPreviewUrl(tempPreviewUrl);
  }, [activeTab, activeProductId, selectedMannequin]);

  // Handle thay đổi sản phẩm (Dropdown)
  const handleProductChange = (newProductId: string) => {
    setActiveProductIds(prev => ({ ...prev, [activeTab]: newProductId }));
    setSelectedThumb(null);
    setActivePropertyIndex(0);
    // Reset selections khi đổi sản phẩm khác để tránh lỗi option
    setSelections(prev => ({ ...prev, [activeTab]: {} }));
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

  const handleOptionSelect = (propId: string, valueId: string, valueName: string) => {
    setSelections(prev => ({
      ...prev,
      [activeTab]: { ...(prev[activeTab] || {}), [propId]: valueId }
    }));
    setSelectedThumb(null);
    const botText = `Bé Song đã ghi nhận bạn chọn "${valueName}". Thật tuyệt vời!`;
    setTimeout(async () => {
      setMessages(prev => [...prev, { text: botText, isUser: false }]);
      await supabase.from('chat_messages').insert({
        user_id: MOCK_USER_ID,
        role: 'assistant',
        content: botText
      } as any);
    }, 500);
  };

  const getTryOnCategory = (categoryName: string) => {
    const normalized = categoryName.toLowerCase();

    if (normalized.includes('vest')) return 'tops';
    if (normalized.includes('váy') || normalized.includes('vay') || normalized.includes('dress')) return 'dress';

    return 'clothes';
  };

  const getImageFileFromUrl = async (url: string, filename: string) => {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Could not load ${filename} with status ${response.status}`);
    }

    const blob = await response.blob();
    const extension = blob.type.split('/')[1] || 'png';

    return new File([blob], `${filename}.${extension}`, { type: blob.type || 'image/png' });
  };

  const buildGenerationPrompt = (customPrompt: string) => {
    const activeTabSelections = selections[activeTab] || {};
    const selectedOptions = currentProperties
      .map(prop => {
        const selectedValueId = activeTabSelections[prop.id];
        const option = prop.options.find(o => o.id === selectedValueId);
        return option ? `${prop.title}: ${option.name}` : null;
      })
      .filter(Boolean)
      .join(', ');

    return [
      `Create a premium wedding customization preview for category: ${activeTab}.`,
      activeProduct?.name ? `Base product: ${activeProduct.name}.` : '',
      vendorInfo?.name ? `Vendor: ${vendorInfo.name}.` : '',
      selectedOptions ? `Selected customization options: ${selectedOptions}.` : '',
      customPrompt ? `User request: ${customPrompt}.` : '',
      'Style: elegant, realistic, romantic, luxury Vietnamese wedding aesthetic, high quality image preview.'
    ].filter(Boolean).join(' ');
  };

  const handleGeneratePreview = async () => {
    const customPrompt = inputValue.trim();
    const prompt = buildGenerationPrompt(customPrompt);
    const userText = customPrompt || 'Tạo ảnh xem trước từ các tùy chọn hiện tại.';
    const configuredEndpoint = import.meta.env.VITE_VERTEX_AI_ENDPOINT || '/api/vton/test-try-on-upload';
    const uploadEndpoint = configuredEndpoint.startsWith('/test-')
      ? `/api/vton${configuredEndpoint}`
      : configuredEndpoint;
    const endpoint = uploadEndpoint.replace('/test-try-on-upload', '/test-try-on');

    setMessages(prev => [...prev, { text: userText, isUser: true }]);
    setInputValue('');
    setIsGenerating(true);

    await supabase.from('chat_messages').insert({
      user_id: MOCK_USER_ID,
      role: 'user',
      content: userText
    } as any);

    try {
      if (!endpoint) {
        throw new Error('Missing VITE_VERTEX_AI_ENDPOINT');
      }

      if (!activeProduct || !currentMainImage) {
        throw new Error('Please choose a product before generating a try-on preview.');
      }

      const bodyUrl = new URL(mannequinImage, window.location.origin).href;
      const garmentUrl = new URL(currentMainImage, window.location.origin).href;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          body_url: bodyUrl,
          garment_url: garmentUrl,
          category: getTryOnCategory(activeTab),
          prompt
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Vertex AI VTON request failed with status ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const imageUrl = data.imageUrl || data.image_url || data.output?.imageUrl || data.output?.image_url || data.predictions?.[0]?.imageUrl || data.predictions?.[0]?.image_url;

      if (!imageUrl) {
        throw new Error(`VTON response did not include an image URL: ${JSON.stringify(data)}`);
      }

      setGeneratedPreviewUrl(imageUrl);
      saveTempPreview(imageUrl);
      const aiText = data.message || 'Bé Song đã tạo ảnh thử đồ trên mannequin từ mẫu bạn chọn.';

      setMessages(prev => [...prev, { text: aiText, isUser: false }]);
      await supabase.from('chat_messages').insert({
        user_id: MOCK_USER_ID,
        role: 'assistant',
        content: aiText
      } as any);
    } catch (error) {
      console.error('Lỗi khi gọi Google Vertex AI:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const fallbackText = `Bé Song chưa thể tạo ảnh thử đồ. Vui lòng kiểm tra backend VTON đang chạy ở cổng 3003. Chi tiết: ${errorMessage}`;
      setMessages(prev => [...prev, { text: fallbackText, isUser: false }]);
      await supabase.from('chat_messages').insert({
        user_id: MOCK_USER_ID,
        role: 'assistant',
        content: fallbackText
      } as any);
    } finally {
      setIsGenerating(false);
    }
  };

  // Tính giá động = Giá gốc sản phẩm + Giá các options
  let currentPrice = Number(activeProduct?.price || 0);
  const currentTabSelections = selections[activeTab];

  if (currentTabSelections && currentProperties.length > 0) {
    Object.entries(currentTabSelections).forEach(([propId, selectedValueId]) => {
      const propGroup = currentProperties.find(p => p.id === propId);
      if (propGroup) {
        const selectedVal = propGroup.options.find(o => o.id === selectedValueId);
        if (selectedVal) currentPrice += selectedVal.price;
      }
    });
  }

  const handleSaveDesign = async () => {
    if (!activeProduct) return;
    setIsSaving(true);
    try {
      const userId = 'U01';
      // Tạo designId ngẫu nhiên
      const designId = Math.random().toString(36).substring(2, 12);

      // 1. Insert into user_designs
      const { error: designError } = await supabase
        .from('user_designs')
        .insert({
          id: designId,
          user_id: userId,
          category: activeTab,
          total_price: currentPrice
        } as any);

      if (designError) throw designError;

      // 2. Insert selections into user_design_selections
      const activeTabSelections = selections[activeTab] || {};
      const selectionsToInsert = Object.entries(activeTabSelections).map(([optionGroupId, valueId]) => ({
        design_id: designId,
        value_id: valueId
      }));

      if (selectionsToInsert.length > 0) {
        const { error: selectionsError } = await supabase
          .from('user_design_selections')
          .insert(selectionsToInsert as any);

        if (selectionsError) throw selectionsError;
      }

      alert('Lưu thiết kế thành công!');
      // Reset selections
      setSelections(prev => ({ ...prev, [activeTab]: {} }));
    } catch (error) {
      console.error('Lỗi khi lưu thiết kế:', error);
      alert('Đã xảy ra lỗi khi lưu thiết kế. Vui lòng thử lại!');
    } finally {
      setIsSaving(false);
    }
  };

  // Quản lý hình ảnh hiển thị
  const productImages = activeProductId ? allImages[activeProductId] : [];
  const baseImage = productImages?.[0] || PLACEHOLDER_IMAGE;
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
              className={`px-8 py-3 rounded-full text-xs font-bold tracking-wider transition-all whitespace-nowrap uppercase ${activeTab === tab ? 'bg-[#F2BFC8] text-white shadow-inner' : 'bg-transparent text-[#1B2C40] hover:text-[#F2BFC8]'}`}
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
          <h2 className="text-4xl font-serif font-bold text-[#1B2C40] mb-4 tracking-wide">
            COMING SOON
          </h2>
          <p className="text-sm text-gray-500 font-medium max-w-md leading-relaxed">
            Tính năng tùy chỉnh Venue đang được phát triển.
            Bé Song sẽ sớm ra mắt trong thời gian tới!
          </p>
          <div className="mt-10 flex gap-3">
            <div className="w-3 h-3 rounded-full bg-[#F2BFC8] animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-3 h-3 rounded-full bg-[#F2BFC8] animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-3 h-3 rounded-full bg-[#F2BFC8] animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      ) : (
      <div className="max-w-[1400px] w-full mx-auto flex flex-col lg:flex-row gap-6 lg:gap-8 lg:h-[800px] items-start">

        {/* Left Sidebar */}
        <aside className="lg:w-[320px] flex-shrink-0 flex flex-col gap-3 overflow-y-auto no-scrollbar pb-4 h-full">

          {/* BỘ CHỌN SẢN PHẨM GỐC - CUSTOM VISUAL DROPDOWN */}
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl border border-rose-100 p-4 shadow-sm mb-2 relative z-20">
            <label className="block text-[10px] font-bold text-[#F2BFC8] mb-3 uppercase tracking-widest">
              Chọn Mẫu {activeTab}
            </label>

            <div className="relative">
              <button
                onClick={() => setIsProductDropdownOpen(!isProductDropdownOpen)}
                className="w-full bg-white border border-rose-100 text-[#1B2C40] rounded-2xl p-3 text-sm font-serif flex items-center justify-between hover:border-[#F2BFC8] transition-colors shadow-sm"
              >
                <div className="flex items-center gap-3">
                  {/* TĂNG KÍCH THƯỚC ẢNH VÀ ĐỔI TỶ LỆ DỌC */}
                  <div className="w-12 h-16 rounded-lg overflow-hidden border border-rose-50 shadow-sm shrink-0 bg-gray-50">
                    <img
                      src={allImages[activeProductId]?.[0] || PLACEHOLDER_IMAGE}
                      alt=""
                      className="w-full h-full object-cover object-top"
                      onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE }}
                    />
                  </div>
                  <div className="flex flex-col items-start text-left">
                    <span className="font-bold line-clamp-2 text-[15px]">{activeProduct?.name || 'Chọn sản phẩm'}</span>
                    <span className="text-[10px] text-gray-500 font-sans font-medium uppercase mt-1 tracking-wider">Mẫu hiện tại</span>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-[#F2BFC8] transition-transform ${isProductDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isProductDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setIsProductDropdownOpen(false)}></div>
                  <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white rounded-2xl shadow-xl border border-rose-50 overflow-hidden z-30 animate-in fade-in zoom-in duration-200">
                    <div className="max-h-[350px] overflow-y-auto no-scrollbar p-2 space-y-1">
                      {allProducts.filter(p => p.category?.toLowerCase() === activeTab?.toLowerCase()).length === 0 ? (
                        <div className="text-center p-6 text-xs text-gray-500 font-sans">
                          Không tìm thấy sản phẩm nào cho danh mục này.
                        </div>
                      ) : (
                        allProducts.filter(p => p.category?.toLowerCase() === activeTab?.toLowerCase()).map(p => (
                          <button
                            key={p.id}
                            onClick={() => {
                              handleProductChange(p.id);
                              setIsProductDropdownOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all ${activeProductId === p.id
                              ? 'bg-rose-50 border border-rose-100'
                              : 'hover:bg-rose-50/50 border border-transparent'
                              }`}
                          >
                            {/* TĂNG KÍCH THƯỚC ẢNH TRONG LIST */}
                            <div className="w-12 h-16 rounded-lg overflow-hidden border border-white shadow-sm flex-shrink-0 bg-gray-50">
                              <img
                                src={allImages[p.id]?.[0] || PLACEHOLDER_IMAGE}
                                alt=""
                                className="w-full h-full object-cover object-top"
                                onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE }}
                              />
                            </div>
                            <div className="flex flex-col items-start text-left pr-2">
                              <span className={`text-sm font-bold line-clamp-2 leading-tight ${activeProductId === p.id ? 'text-[#F2BFC8]' : 'text-[#1B2C40]'}`}>
                                {p.name}
                              </span>
                              <span className="text-[11px] text-gray-500 font-medium mt-1">
                                {Number(p.price || 0).toLocaleString('vi-VN')} VND
                              </span>
                            </div>
                            {activeProductId === p.id && (
                              <div className="ml-auto w-2 h-2 rounded-full bg-[#F2BFC8] shrink-0"></div>
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

          {/* DANH SÁCH TÙY CHỈNH CỦA SẢN PHẨM */}
          <div className="relative z-10 space-y-3">
            {currentProperties.length === 0 ? (
              <div className="text-center p-6 text-sm text-gray-500 bg-white/50 rounded-3xl border border-rose-100">
                Mẫu này không hỗ trợ tùy chỉnh.
              </div>
            ) : (
              currentProperties.map((prop, idx) => (
                <div key={prop.id} className="flex flex-col bg-white/50 rounded-3xl border border-rose-100 overflow-hidden shadow-sm transition-all">
                  <button
                    onClick={() => setActivePropertyIndex(idx)}
                    className={`w-full flex items-center justify-between px-6 py-4 font-serif text-lg transition-colors ${activePropertyIndex === idx ? 'bg-white text-[#F2BFC8]' : 'bg-transparent text-[#1B2C40] hover:bg-white'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${activePropertyIndex === idx ? 'border-[#F2BFC8]' : 'border-rose-200 text-rose-300'}`}>
                        {selections[activeTab]?.[prop.id] ? <div className="w-4 h-4 rounded-full bg-[#F2BFC8]"></div> : <span className="w-4 h-4 rounded-full border border-current"></span>}
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="font-bold">{prop.title}</span>
                        {selections[activeTab]?.[prop.id] && (
                          <span className="text-[10px] text-gray-500 font-sans font-medium uppercase tracking-widest">
                            {prop.options.find(o => o.id === selections[activeTab][prop.id])?.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-[#F2BFC8] transition-transform ${activePropertyIndex === idx ? 'rotate-90' : ''}`} />
                  </button>

                  {activePropertyIndex === idx && (
                    <div className="flex flex-wrap gap-2 px-6 pb-6 pt-2 bg-white">
                      {prop.options.map(opt => {
                        const isSelected = selections[activeTab]?.[prop.id] === opt.id;
                        return (
                          <button
                            key={opt.id}
                            onClick={() => handleOptionSelect(prop.id, opt.id, opt.name)}
                            className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${isSelected ? 'bg-[#F2BFC8] text-white border-[#F2BFC8] shadow-sm' : 'bg-rose-50 text-[#1B2C40] border-transparent hover:border-[#F2BFC8]'}`}
                          >
                            {opt.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Center Canvas */}
        <div className="flex-1 bg-white/70 backdrop-blur-md rounded-[32px] shadow-sm border border-rose-100 overflow-hidden flex flex-col p-6 min-h-[500px] lg:min-h-0 h-full">
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-serif font-bold text-[#1B2C40]">
                {activeProduct?.name || activeTab}
              </h1>
              {vendorInfo && (
                <p className="text-xs text-[#F2BFC8] font-bold uppercase tracking-widest mt-1">
                  Bởi {vendorInfo.name}
                </p>
              )}
            </div>

            <div className="flex bg-white rounded-full shadow-sm p-1 border border-rose-100 self-start">
              <button
                type="button"
                onClick={() => setSelectedMannequin('female')}
                className={`px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${selectedMannequin === 'female' ? 'bg-[#F2BFC8] text-white shadow-inner' : 'text-[#1B2C40] hover:text-[#F2BFC8]'}`}
              >
                Female
              </button>
              <button
                type="button"
                onClick={() => setSelectedMannequin('male')}
                className={`px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${selectedMannequin === 'male' ? 'bg-[#F2BFC8] text-white shadow-inner' : 'text-[#1B2C40] hover:text-[#F2BFC8]'}`}
              >
                Male
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
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-full text-[10px] font-bold text-[#F2BFC8] uppercase tracking-widest shadow-sm flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                {generatedPreviewUrl ? 'AI Preview' : `${selectedMannequin} Mannequin`}
              </div>
              {isGenerating && (
                <div className="absolute inset-0 bg-white/65 backdrop-blur-sm flex flex-col items-center justify-center text-[#1B2C40]">
                  <Loader2 className="w-8 h-8 text-[#F2BFC8] animate-spin mb-3" />
                  <span className="text-xs font-bold uppercase tracking-widest">Đang tạo ảnh bằng Vertex AI...</span>
                </div>
              )}
            </div>

            <div className="bg-[#FAF6EE] rounded-2xl p-4 border border-rose-50 shadow-sm mt-1">
              <label className="block text-[10px] font-bold text-[#F2BFC8] mb-3 uppercase tracking-widest">
                Prompt thiết kế / yêu cầu AI
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleGeneratePreview();
                  }}
                  placeholder="Nhập ý tưởng của bạn hoặc chọn các tùy chọn bên trái rồi bấm Generate..."
                  className="flex-1 min-h-[92px] bg-white border border-rose-100 rounded-2xl py-3 px-4 text-xs font-medium focus:ring-1 focus:ring-[#F2BFC8] focus:outline-none shadow-sm text-[#1B2C40] placeholder:text-gray-400 resize-none"
                />
                <button
                  onClick={handleGeneratePreview}
                  disabled={isGenerating || !activeProduct}
                  className="sm:w-[150px] py-3.5 bg-[#F2BFC8] text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-rose-400 transition-colors shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Generate
                </button>
              </div>
            </div>
          </div>
 
        </div>

        {/* Right Sidebar (Pricing & Chat) */}
        <aside className="lg:w-[350px] flex flex-col gap-6 h-full min-h-0">
          <div className="bg-white/70 backdrop-blur-md rounded-[32px] shadow-sm border border-rose-100 p-8 flex flex-col items-center">
            <span className="font-serif text-[#1B2C40] font-bold text-lg mb-2 uppercase tracking-widest">Dự Toán Chi Phí</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-[#F2BFC8] mb-6 tracking-tight">
              {currentPrice.toLocaleString('vi-VN')} <span className="text-xl">VND</span>
            </h2>

            <div className="flex w-full gap-3 mb-3">
              <button
                onClick={handleSaveDesign}
                disabled={isSaving}
                className="flex-1 py-3.5 border border-[#F2BFC8] text-[#F2BFC8] rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-[#FAF6EE] transition-colors text-center whitespace-nowrap bg-white shadow-sm disabled:opacity-50"
              >
                {isSaving ? 'ĐANG LƯU...' : 'LƯU THIẾT KẾ'}
              </button>
              <button className="w-[44px] shrink-0 border border-rose-200 text-[#F2BFC8] rounded-full flex items-center justify-center hover:bg-[#FAF6EE] bg-white shadow-sm">
                <Heart className="w-4 h-4 fill-current opacity-80" />
              </button>
            </div>
            <button className="w-full py-3.5 bg-[#F2BFC8] text-white rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-rose-400 transition-colors shadow-md">
              ĐẶT LỊCH THỬ
            </button>
          </div>

          <div className="bg-white/70 backdrop-blur-md rounded-[32px] shadow-sm border border-rose-100 p-6 flex-1 flex flex-col relative overflow-hidden h-[325px]">
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto no-scrollbar space-y-4 mb-4 relative z-10 flex flex-col pr-2"
            >
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`text-xs p-4 rounded-[20px] max-w-[85%] shadow-sm leading-relaxed font-medium ${msg.isUser
                    ? 'bg-[#FAF6EE] text-[#1B2C40] rounded-tr-sm self-end ml-auto border border-rose-100'
                    : 'bg-white text-[#1B2C40] rounded-tl-sm self-start mr-auto border border-rose-100'
                    }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>

            <div className="relative z-10 w-full mt-auto pt-4 pb-2 bg-white/50 backdrop-blur-md border-t border-rose-50/50">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGeneratePreview()}
                placeholder="Nhập yêu cầu của bạn..."
                className="w-full bg-white border border-rose-100 rounded-full py-3.5 px-6 pr-14 text-xs font-medium focus:ring-1 focus:ring-[#F2BFC8] focus:outline-none shadow-sm text-[#1B2C40] placeholder:text-gray-400"
              />
              <button
                onClick={handleGeneratePreview}
                disabled={isGenerating || !activeProduct}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#F2BFC8] text-white rounded-full flex items-center justify-center hover:bg-rose-400 shadow-sm transition-transform active:scale-95 animate-in zoom-in duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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