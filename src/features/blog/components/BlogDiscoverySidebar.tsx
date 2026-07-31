import { Search } from 'lucide-react';

const trendingPosts = [
  {
    title: 'Checklist chuẩn bị cưới\ncho các cặp đôi',
    views: '1.8K',
    img: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=100',
  },
  {
    title: 'Những lưu ý quan trọng khi\nchọn ngày cưới đẹp',
    views: '1.5K',
    img: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=100',
  },
  {
    title: 'Nhẫn cưới – Bí quyết chọn\nnhẫn phù hợp',
    views: '1.2K',
    img: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&q=80&w=100',
  },
];

const popularTopics = [
  'Ảnh & Phim Cưới',
  'Áo Cưới',
  'Sảnh Tiệc',
  'Trang Trí',
  'Kinh Nghiệm Cưới',
  'Xu Hướng',
  'Phong Thủy Cưới Hỏi',
  'Thiệp Cưới',
];

export function BlogDiscoverySidebar() {
  return (
    <aside className="hidden xl:flex w-[280px] flex-col gap-6 shrink-0 h-fit sticky top-28">
      <div className="bg-white rounded-full flex items-center px-4 py-3 shadow-sm border border-rose-50">
        <Search className="w-4 h-4 text-rose-300 mr-2" />
        <input
          type="text"
          placeholder="Tìm kiếm bài viết..."
          className="flex-1 bg-transparent border-none outline-none text-xs text-[#1B2C40] placeholder:text-[#1B2C40]/40"
        />
      </div>
      <div className="bg-[#FFFFFF] rounded-[32px] p-6 shadow-sm border border-rose-50 flex flex-col gap-4">
        <h3 className="font-bold text-[#1B2C40] text-xs uppercase tracking-widest border-b border-rose-100 pb-3">TOP BÀI VIẾT THỊNH HÀNH</h3>
        <div className="flex flex-col gap-4 mt-2">
          {trendingPosts.map((post) => (
            <div key={post.title} className="flex gap-3 items-center group cursor-pointer">
              <img src={post.img} alt="thumb" className="w-12 h-12 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform" />
              <div className="flex flex-col">
                <h4 className="text-[11px] font-bold text-[#1B2C40] leading-tight group-hover:text-[#F2BFC8] transition-colors">{post.title}</h4>
                <span className="text-[10px] text-[#1B2C40]/50 mt-1">{post.views} lượt xem</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-[#FFFFFF] rounded-[32px] p-6 shadow-sm border border-rose-50 flex flex-col gap-4">
        <h3 className="font-bold text-[#1B2C40] text-xs uppercase tracking-widest border-b border-rose-100 pb-3">CHỦ ĐỀ ĐƯỢC QUAN TÂM</h3>
        <div className="flex flex-wrap gap-2 mt-2">
          {popularTopics.map((topic) => (
            <span
              key={topic}
              className="px-4 py-2 rounded-full border border-rose-200 text-[#F2BFC8] text-[10px] font-bold tracking-wider hover:bg-[#FFFFFF] cursor-pointer transition-colors shadow-sm bg-white whitespace-nowrap"
            >
              {topic}
            </span>
          ))}
        </div>
      </div>
    </aside>
  );
}
