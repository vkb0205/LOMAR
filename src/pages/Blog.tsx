import React, { useEffect, useState } from 'react';
import { Search, Heart, MessageCircle, Share2, MoreHorizontal, Bookmark, User, Clock, Flame, Folder, Hash, ImagePlus, Smile } from 'lucide-react';
import { supabase } from '../lib/supabase';

// Định nghĩa kiểu dữ liệu cho bài viết sau khi format
interface BlogPost {
  id: string;
  name: string;
  time: string;
  content: string;
  tags: string;
  likes: number;
  comments: number;
  shares: number;
  avatar: string;
}

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true);
        // Fetch posts
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false });

        if (postsError || !postsData || postsData.length === 0) {
          setPosts([]);
          return;
        }

        // Fetch related data for each post
        const formattedPosts: BlogPost[] = await Promise.all((postsData as any[]).map(async (post: any) => {
          // Fetch user info
          let authorName = 'Anonymous';
          let authorAvatar = 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&q=80&w=100';
          if (post.user_id) {
            const { data: userData } = await supabase.from('users').select('username, avatar_url').eq('id', post.user_id).single();
            if (userData) {
              const u = userData as any;
              authorName = u.username || authorName;
              authorAvatar = u.avatar_url || authorAvatar;
            }
          }

          // Fetch likes count
          const { count: likesCount } = await supabase.from('post_likes').select('*', { count: 'exact', head: true }).eq('post_id', post.id);
          
          // Fetch comments count
          const { count: commentsCount } = await supabase.from('post_comments').select('*', { count: 'exact', head: true }).eq('post_id', post.id);

          // Fetch tags
          const { data: postTagsData } = await supabase.from('post_tags').select('tag_id').eq('post_id', post.id);
          let tagsString = '';
          if (postTagsData && postTagsData.length > 0) {
            const tagIds = (postTagsData as any[]).map(pt => pt.tag_id);
            const { data: tagsData } = await supabase.from('tags').select('name').in('id', tagIds);
            if (tagsData) {
              tagsString = (tagsData as any[]).map(t => `#${t.name}`).join(' ');
            }
          }

          // Format time (simple relative time mockup)
          const postDate = new Date(post.created_at || new Date());
          const now = new Date();
          const diffInHours = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60));
          const timeStr = diffInHours < 24 ? `${diffInHours || 1} giờ` : `${Math.floor(diffInHours / 24)} ngày`;

          return {
            id: post.id,
            name: authorName,
            time: timeStr,
            content: post.content || '',
            tags: tagsString,
            likes: likesCount || 0,
            comments: commentsCount || 0,
            shares: 0, // Not in schema, default to 0
            avatar: authorAvatar
          };
        }));

        setPosts(formattedPosts);
      } catch (error) {
        console.error('Error fetching blog data:', error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  return (
    <div className="w-full flex-1 p-4 md:p-6 font-sans flex flex-col items-center">
      
      <div className="max-w-[1440px] w-full flex flex-col lg:flex-row gap-6">
        
        {/* Left Sidebar (Nav & Highlight) */}
        <aside className="w-full lg:w-[320px] flex flex-col gap-6 shrink-0 h-fit sticky top-28">
          
          <div className="bg-[#FFFDFD] rounded-[32px] p-6 shadow-sm border border-rose-50 flex flex-col gap-2">
            {[
              { icon: Flame, text: 'Sắp Xếp Theo', active: true },
              { icon: Clock, text: 'Mới Nhất' },
              { icon: Heart, text: 'Phổ Biến' },
              { icon: Folder, text: 'Danh Mục' },
              { icon: Hash, text: 'Chủ Đề' },
              { icon: Bookmark, text: 'Lưu Bài Viết' },
            ].map((item, i) => (
              <button key={i} className={`flex items-center gap-4 px-4 py-3 rounded-[20px] transition-colors font-semibold text-xs uppercase tracking-wider ${
                item.active ? 'bg-[#FFF5F5] text-[#E57373] shadow-sm' : 'text-[#1D3557] hover:bg-[#FFF5F5] hover:text-[#E57373]'
              }`}>
                <item.icon className={`w-5 h-5 ${item.active ? 'text-[#E57373]' : 'text-rose-200'}`} strokeWidth={item.active ? 2.5 : 2} />
                {item.text}
              </button>
            ))}
          </div>

          <div className="bg-[#FFFDFD] rounded-[32px] p-6 shadow-sm border border-rose-50 text-center flex flex-col relative overflow-hidden">
             <h2 className="font-serif text-4xl font-bold text-[#1D3557] mb-1 relative z-10 tracking-wider">BLOG</h2>
             <p className="text-sm text-[#F494A2] italic mb-4 font-serif relative z-10 flex items-center justify-center gap-2">
               Cảm hứng cho hành trình hạnh phúc 
               <Heart className="w-3 h-3 fill-current" />
             </p>
             <p className="text-[11px] text-[#1D3557] mb-6 leading-relaxed relative z-10 px-2 opacity-80">
               Những chia sẻ, kinh nghiệm và cảm hứng từ Phố Hạnh Phúc Hồ Văn Huê để giúp bạn chuẩn bị cho ngày trọng đại một cách hoàn hảo nhất.
             </p>

             <div className="w-full aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden relative shadow-sm group">
                <img src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=400" alt="Highlight cover" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute bottom-3 left-3 bg-[#F494A2] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">NỔI BẬT</div>
             </div>
             
             <h3 className="font-serif font-bold text-[#1D3557] text-left mt-4 text-xl leading-tight mb-3 px-1">
               Top 5 Venue Sang Trọng Tại TP. HCM Cho Tiệc Cưới Trong Mơ
             </h3>
             <div className="flex items-center gap-4 text-[11px] text-[#1D3557]/60 px-1 font-medium pb-2">
               <span className="flex items-center"><Clock className="w-3 h-3 mr-1.5" /> 05/05/2026</span>
               <span className="flex items-center">👁 1.2K lượt xem</span>
             </div>

             <button className="mt-4 w-full py-3.5 bg-white text-[#F494A2] font-bold text-[11px] rounded-full uppercase tracking-widest hover:bg-[#FFF5F5] transition-colors border border-rose-200 shadow-sm">
               XEM THÊM BÀI VIẾT &rarr;
             </button>
          </div>
        </aside>

        {/* Center Main Feed */}
        <main className="flex-1 flex flex-col gap-6 max-w-[650px] mx-auto w-full pb-10">
           
           {/* Composer Block */}
           <div className="bg-[#FFFDFD] rounded-[32px] pt-4 px-6 pb-0 shadow-sm border border-rose-50 flex flex-col">
              <div className="flex items-center gap-3 mb-4 bg-white border border-rose-100 rounded-full p-2 pl-4 pr-3 shadow-sm">
                 <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-white">
                   <img src="https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&q=80&w=100" alt="avatar" className="w-full h-full rounded-full object-cover" />
                 </div>
                 <input 
                   type="text" 
                   placeholder="Bạn đang nghĩ gì?" 
                   className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-[#1D3557]/40 text-[#1D3557] font-medium"
                 />
                 <div className="flex text-[#F494A2] gap-1 shrink-0">
                    <button className="w-8 h-8 rounded-full hover:bg-rose-50 flex items-center justify-center transition-colors"><ImagePlus className="w-5 h-5" /></button>
                    <button className="w-8 h-8 rounded-full hover:bg-rose-50 flex items-center justify-center transition-colors font-bold text-[10px]">GIF</button>
                    <button className="w-8 h-8 rounded-full hover:bg-rose-50 flex items-center justify-center transition-colors"><Smile className="w-5 h-5" /></button>
                 </div>
              </div>
              
              <div className="flex items-center gap-2 justify-between">
                 {['Dành cho bạn', 'Đang theo dõi', 'Gần đây', 'Phổ biến'].map((tab, i) => (
                   <button key={i} className={`flex-1 py-4 text-xs font-bold transition-all relative uppercase tracking-wider ${
                     i === 0 ? 'text-[#F494A2]' : 'text-[#1D3557]/60 hover:text-[#1D3557]'
                   }`}>
                     {tab}
                     {i === 0 && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#F494A2] rounded-t-full"></div>}
                   </button>
                 ))}
              </div>
           </div>

           {/* Feed Container */}
           <div className="flex flex-col gap-6">
              {loading ? (
                <div className="w-full py-20 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F494A2]"></div>
                </div>
              ) : posts.map((post) => (
                <div key={post.id} className="bg-[#FFFDFD] rounded-[32px] p-6 shadow-sm border border-rose-50 flex flex-col gap-4">
                  {/* Header */}
                  <div className="flex items-center gap-3">
                     <div className="w-12 h-12 rounded-full shadow-sm flex shrink-0 overflow-hidden bg-rose-100">
                         <img src={post.avatar} alt="Avatar" className="w-full h-full object-cover" />
                     </div>
                     <div className="flex flex-col">
                       <h4 className="font-bold text-[#1D3557] text-[15px] leading-tight">{post.name}</h4>
                       <span className="text-[11px] text-[#1D3557]/50 font-medium">{post.time}</span>
                     </div>
                     <button className="ml-auto text-[#1D3557]/40 hover:text-[#1D3557]">
                       <MoreHorizontal className="w-5 h-5" />
                     </button>
                  </div>
                  
                  {/* Content */}
                  <p className="text-[13px] text-[#1D3557] leading-relaxed whitespace-pre-line font-medium mt-1">
                    {post.content}
                  </p>
                  <p className="text-[13px] text-[#F494A2] font-medium font-sans">
                    {post.tags}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-8 mt-2 text-[#1D3557]/60 font-medium text-xs">
                     <button className="flex items-center gap-2 hover:text-[#F494A2] transition-colors"><Heart className="w-4 h-4" /> {post.likes}</button>
                     <button className="flex items-center gap-2 hover:text-[#F494A2] transition-colors"><MessageCircle className="w-4 h-4" /> {post.comments}</button>
                     <button className="flex items-center gap-2 hover:text-[#F494A2] transition-colors"><Share2 className="w-4 h-4" /> {post.shares}</button>
                     
                     <button className="ml-auto hover:text-[#F494A2] transition-colors"><Bookmark className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
           </div>
        </main>
        
        {/* Right Sidebar (Keywords / Search) */}
        <aside className="hidden xl:flex w-[280px] flex-col gap-6 shrink-0 h-fit sticky top-28">
           <div className="bg-white rounded-full flex items-center px-4 py-3 shadow-sm border border-rose-50">
             <Search className="w-4 h-4 text-rose-300 mr-2" />
             <input type="text" placeholder="Tìm kiếm bài viết..." className="flex-1 bg-transparent border-none outline-none text-xs text-[#1D3557] placeholder:text-[#1D3557]/40" />
           </div>

           <div className="bg-[#FFFDFD] rounded-[32px] p-6 shadow-sm border border-rose-50 flex flex-col gap-4">
              <h3 className="font-bold text-[#1D3557] text-xs uppercase tracking-widest border-b border-rose-100 pb-3">
                TOP BÀI VIẾT THỊNH HÀNH
              </h3>
              <div className="flex flex-col gap-4 mt-2">
                 {[
                   {title: 'Checklist chuẩn bị cưới\ncho các cặp đôi', views: '1.8K', img: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=100'},
                   {title: 'Những lưu ý quan trọng khi\nchọn ngày cưới đẹp', views: '1.5K', img: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=100'},
                   {title: 'Nhẫn cưới – Bí quyết chọn\nnhẫn phù hợp', views: '1.2K', img: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&q=80&w=100'}
                 ].map((t, i) => (
                   <div key={i} className="flex gap-3 items-center group cursor-pointer">
                      <img src={t.img} alt="thumb" className="w-12 h-12 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform" />
                      <div className="flex flex-col">
                        <h4 className="text-[11px] font-bold text-[#1D3557] leading-tight group-hover:text-[#F494A2] transition-colors">{t.title}</h4>
                        <span className="text-[10px] text-[#1D3557]/50 mt-1">{t.views} lượt xem</span>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="bg-[#FFFDFD] rounded-[32px] p-6 shadow-sm border border-rose-50 flex flex-col gap-4">
               <h3 className="font-bold text-[#1D3557] text-xs uppercase tracking-widest border-b border-rose-100 pb-3">
                 CHỦ ĐỀ ĐƯỢC QUAN TÂM
               </h3>
               <div className="flex flex-wrap gap-2 mt-2">
                  {['Ảnh & Phim Cưới', 'Áo Cưới', 'Sảnh Tiệc', 'Trang Trí', 'Kinh Nghiệm Cưới', 'Xu Hướng', 'Phong Thủy Cưới Hỏi', 'Thiệp Cưới'].map((tag, i) => (
                    <span key={i} className="px-4 py-2 rounded-full border border-rose-200 text-[#F494A2] text-[10px] font-bold tracking-wider hover:bg-[#FFF5F5] cursor-pointer transition-colors shadow-sm bg-white whitespace-nowrap">
                      {tag}
                    </span>
                  ))}
               </div>
           </div>
        </aside>

      </div>
    </div>
  );
}
