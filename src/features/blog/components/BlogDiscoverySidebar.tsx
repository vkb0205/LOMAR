import { Search } from 'lucide-react';
import { motion } from 'motion/react';
import { EASE } from '../../../shared/ui/motion';

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
    <motion.aside
      initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
      className="sticky top-24 hidden h-fit w-[280px] shrink-0 flex-col gap-6 xl:flex"
    >
      {/* Search island */}
      <div className="flex items-center rounded-bezel bg-ink/5 p-1.5 ring-1 ring-ink/5 shadow-tile">
        <div className="flex w-full items-center rounded-bezel-inner bg-white px-4 py-3 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]">
          <Search strokeWidth={1.5} className="mr-2.5 h-4 w-4 shrink-0 text-sage" />
          <input
            type="text"
            placeholder="Tìm kiếm bài viết..."
            className="flex-1 border-none bg-transparent text-xs text-ink outline-none placeholder:text-ink/40"
          />
        </div>
      </div>

      <div className="flex flex-col rounded-bezel bg-ink/5 p-1.5 ring-1 ring-ink/5 shadow-tile">
        <div className="flex flex-col gap-4 rounded-bezel-inner bg-white p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]">
          <h3 className="border-b border-ink/8 pb-3 text-xs font-bold uppercase tracking-widest text-ink">
            Top bài viết thịnh hành
          </h3>
          <div className="mt-1 flex flex-col gap-4">
            {trendingPosts.map((post) => (
              <div key={post.title} className="group flex cursor-pointer items-center gap-3">
                <img
                  src={post.img}
                  alt="thumb"
                  className="h-12 w-12 rounded-xl object-cover shadow-card transition-transform duration-500 ease-fluid group-hover:scale-105"
                />
                <div className="flex flex-col">
                  <h4 className="text-[11px] font-bold leading-tight text-ink transition-colors duration-500 group-hover:text-rose-deep">
                    {post.title}
                  </h4>
                  <span className="mt-1 text-[10px] text-ink/50">{post.views} lượt xem</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col rounded-bezel bg-ink/5 p-1.5 ring-1 ring-ink/5 shadow-tile">
        <div className="flex flex-col gap-4 rounded-bezel-inner bg-white p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]">
          <h3 className="border-b border-ink/8 pb-3 text-xs font-bold uppercase tracking-widest text-ink">
            Chủ đề được quan tâm
          </h3>
          <div className="mt-1 flex flex-wrap gap-2">
            {popularTopics.map((topic) => (
              <span
                key={topic}
                className="cursor-pointer whitespace-nowrap rounded-full bg-canvas px-3.5 py-2 text-[10px] font-bold tracking-wider text-rose-deep ring-1 ring-rose/25 transition-all duration-500 ease-fluid hover:bg-rose hover:text-white hover:ring-rose"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
