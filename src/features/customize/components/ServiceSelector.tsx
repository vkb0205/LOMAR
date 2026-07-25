import React from 'react';
import { ChevronDown } from 'lucide-react';
import { PLACEHOLDER_IMAGE } from '../services/customizeCatalogService';
import { ServiceRow } from '../types';
import { isServiceInCategory } from '../utils/category';

interface ServiceSelectorProps {
  activeTab: string;
  activeProductId: string;
  activeService?: ServiceRow;
  allImages: Record<string, string[]>;
  allServices: ServiceRow[];
  isOpen: boolean;
  onChange: (productId: string) => void;
  onOpenChange: (isOpen: boolean) => void;
}

export function ServiceSelector({
  activeTab,
  activeProductId,
  activeService,
  allImages,
  allServices,
  isOpen,
  onChange,
  onOpenChange,
}: ServiceSelectorProps) {
  const servicesInTab = allServices.filter(service => isServiceInCategory(service, activeTab));

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-3xl border border-rose-100 p-4 shadow-sm mb-2 relative z-20">
      <label className="block text-[10px] font-bold text-[#ddb983] mb-3 uppercase tracking-widest">
        Chọn Mẫu {activeTab}
      </label>

      <div className="relative">
        <button
          onClick={() => onOpenChange(!isOpen)}
          className="w-full bg-white border border-rose-100 text-[#1B2C40] rounded-2xl p-3 text-sm font-serif flex items-center justify-between hover:border-[#ffdb9f] transition-colors shadow-sm"
        >
          <div className="flex items-center gap-3">
            <ProductThumbnail src={allImages[activeProductId]?.[0] || PLACEHOLDER_IMAGE} />
            <div className="flex flex-col items-start text-left">
              <span className="font-bold line-clamp-2 text-[15px]">{activeService?.name || 'Chọn sản phẩm'}</span>
              <span className="text-[10px] text-gray-500 font-sans font-medium uppercase mt-1 tracking-wider">Mẫu hiện tại</span>
            </div>
          </div>
          <ChevronDown className={`w-4 h-4 text-[#ffdb9f] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => onOpenChange(false)} />
            <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white rounded-2xl shadow-xl border border-rose-50 overflow-hidden z-30 animate-in fade-in zoom-in duration-200">
              <div className="max-h-[350px] overflow-y-auto no-scrollbar p-2 space-y-1">
                {servicesInTab.length === 0 ? (
                  <div className="text-center p-6 text-xs text-gray-500 font-sans">
                    Không tìm thấy sản phẩm nào cho danh mục này.
                  </div>
                ) : (
                  servicesInTab.map(service => (
                    <button
                      key={service.id}
                      onClick={() => {
                        onChange(service.id);
                        onOpenChange(false);
                      }}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all ${activeProductId === service.id ? 'bg-rose-50 border border-rose-100' : 'hover:bg-rose-50/50 border border-transparent'}`}
                    >
                      <ProductThumbnail src={allImages[service.id]?.[0] || PLACEHOLDER_IMAGE} />
                      <div className="flex flex-col items-start text-left pr-2">
                        <span className={`text-sm font-bold line-clamp-2 leading-tight ${activeProductId === service.id ? 'text-[#ddb983]' : 'text-[#1B2C40]'}`}>
                          {service.name}
                        </span>
                        <span className="text-[11px] text-gray-500 font-medium mt-1">
                          {Number(service.base_price || 0).toLocaleString('vi-VN')} VND
                        </span>
                      </div>
                      {activeProductId === service.id && (
                        <div className="ml-auto w-2 h-2 rounded-full bg-[#ffdb9f] shrink-0" />
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
  );
}

function ProductThumbnail({ src }: { src: string }) {
  return (
    <div className="w-12 h-16 rounded-lg overflow-hidden border border-rose-50 shadow-sm shrink-0 bg-gray-50">
      <img
        src={src}
        alt=""
        className="w-full h-full object-cover object-top"
        onError={(event) => { event.currentTarget.src = PLACEHOLDER_IMAGE; }}
      />
    </div>
  );
}
