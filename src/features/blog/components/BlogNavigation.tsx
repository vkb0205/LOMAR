import { Bookmark, Clock, Flame, Folder, Hash, Heart } from 'lucide-react';

const navigationItems = [
  { icon: Flame, text: 'Sắp Xếp Theo', active: true },
  { icon: Clock, text: 'Mới Nhất' },
  { icon: Heart, text: 'Phổ Biến' },
  { icon: Folder, text: 'Danh Mục' },
  { icon: Hash, text: 'Chủ Đề' },
  { icon: Bookmark, text: 'Lưu Bài Viết' },
];

export function BlogNavigation() {
  return (
    <aside className="w-full lg:w-[320px] flex flex-col gap-6 shrink-0 h-fit lg:sticky lg:top-28">
      <div className="bg-[#FFFFFF] rounded-[24px] lg:rounded-[32px] p-4 lg:p-6 shadow-sm border border-rose-50 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible no-scrollbar pb-3 lg:pb-6">
        {navigationItems.map((item) => (
          <button
            key={item.text}
            className={`flex items-center gap-2 lg:gap-4 px-4 py-2.5 lg:py-3 rounded-full lg:rounded-[20px] transition-colors font-semibold text-xs uppercase tracking-wider whitespace-nowrap ${item.active ? 'bg-[#FFFFFF] text-[#F2BFC8] shadow-sm border border-rose-100 lg:border-none' : 'text-[#1B2C40] hover:bg-[#FFFFFF] hover:text-[#F2BFC8]'}`}
          >
            <item.icon
              className={`w-4 h-4 lg:w-5 lg:h-5 ${item.active ? 'text-[#F2BFC8]' : 'text-rose-200'}`}
              strokeWidth={item.active ? 2.5 : 2}
            />
            {item.text}
          </button>
        ))}
      </div>
      <div className="hidden lg:flex bg-[#FFFFFF] rounded-[32px] p-6 shadow-sm border border-rose-50 text-center flex-col relative overflow-hidden">
        <h2 className="font-serif text-4xl font-bold text-[#1B2C40] mb-1 relative z-10 tracking-wider">BLOG</h2>
        <p className="text-sm text-[#F2BFC8] italic mb-4 font-serif relative z-10 flex items-center justify-center gap-2">
          Cảm hứng cho hành trình hạnh phúc <Heart className="w-3 h-3 fill-current" />
        </p>
        <p className="text-[11px] text-[#1B2C40] mb-6 leading-relaxed relative z-10 px-2 opacity-80">
          Những chia sẻ, kinh nghiệm và cảm hứng từ Phố Hạnh Phúc Hồ Văn Huê để giúp bạn chuẩn bị cho ngày trọng đại một cách hoàn hảo nhất.
        </p>
      </div>
    </aside>
  );
}
