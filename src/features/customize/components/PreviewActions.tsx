import { Heart } from 'lucide-react';

interface PreviewActionsProps {
  currentPrice: number;
  isSaving: boolean;
  onSaveDesign: () => void;
}

export function PreviewActions({ currentPrice, isSaving, onSaveDesign }: PreviewActionsProps) {
  return (
    <div className="bg-white/70 backdrop-blur-md rounded-[32px] shadow-sm border border-rose-100 p-8 flex flex-col items-center">
      <span className="font-serif text-[#1B2C40] font-bold text-lg mb-2 uppercase tracking-widest">Dự Toán Chi Phí</span>
      <h2 className="text-3xl lg:text-4xl font-bold text-[#ddb983] mb-6 tracking-tight">
        {currentPrice.toLocaleString('vi-VN')} <span className="text-xl">VND</span>
      </h2>

      <div className="flex w-full gap-3 mb-3">
        <button
          onClick={onSaveDesign}
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
  );
}
