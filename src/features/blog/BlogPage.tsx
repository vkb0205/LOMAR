import React, { useEffect, useState } from 'react';
import { Search, Heart, MessageCircle, Share2, MoreHorizontal, Bookmark, User, Clock, Flame, Folder, Hash, ImagePlus, Smile, Send } from 'lucide-react';
import { supabase } from '../../shared/api/supabaseClient';
import { Database } from '../../shared/types/database';
import FollowButton from '../social/components/FollowButton';
import { useAuth } from '../auth/hooks/useAuth';
import { createPost, toggleLike, addComment, fetchLikedPostIds } from '../social/services/socialService';

interface BlogPost {
  id: string;
  /** Author's profile id — null for legacy/anonymous posts (no follow target). */
  authorId: string | null;
  name: string;
  time: string;
  content: string;
  tags: string;
  likes: number;
  comments: number;
  shares: number;
  avatar: string;
  /** Whether the current signed-in user has liked this post. */
  likedByMe: boolean;
}

// Typed row aliases for the batched reads below (Item 21).
type PostRow = Database['public']['Tables']['posts']['Row'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type PostLikeRow = Database['public']['Tables']['post_likes']['Row'];
type PostCommentRow = Database['public']['Tables']['post_comments']['Row'];
type PostTagRow = Database['public']['Tables']['post_tags']['Row'];
type TagRow = Database['public']['Tables']['tags']['Row'];

export default function Blog() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Write-side state (Phase 5): composer + inline commenting.
  const [composer, setComposer] = useState('');
  const [posting, setPosting] = useState(false);
  const [busyLikeId, setBusyLikeId] = useState<string | null>(null);
  const [openComment, setOpenComment] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState('');
  const [commenting, setCommenting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Create a new post, then optimistically prepend it to the feed.
  const handleCreatePost = async () => {
    if (!user || !composer.trim() || posting) return;
    setPosting(true);
    setActionError(null);
    try {
      const row = await createPost(user.id, composer.trim());
      setPosts(prev => [
        {
          id: row.id,
          authorId: user.id,
          name: user.name,
          time: '1 giờ',
          content: row.content,
          tags: '',
          likes: 0,
          comments: 0,
          shares: 0,
          avatar: user.avatarUrl || 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&q=80&w=100',
          likedByMe: false,
        },
        ...prev,
      ]);
      setComposer('');
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Không đăng được bài');
    } finally {
      setPosting(false);
    }
  };

  // Toggle a like with an optimistic UI update; revert on failure.
  const handleToggleLike = async (post: BlogPost) => {
    if (!user || busyLikeId === post.id) return;
    setBusyLikeId(post.id);
    const nextLiked = !post.likedByMe;
    setPosts(prev =>
      prev.map(p =>
        p.id === post.id
          ? { ...p, likedByMe: nextLiked, likes: p.likes + (nextLiked ? 1 : -1) }
          : p
      )
    );
    try {
      await toggleLike(user.id, post.id, post.likedByMe);
    } catch {
      // revert
      setPosts(prev =>
        prev.map(p =>
          p.id === post.id
            ? { ...p, likedByMe: post.likedByMe, likes: post.likes }
            : p
        )
      );
    } finally {
      setBusyLikeId(null);
    }
  };

  // Submit a comment and bump the local comment count.
  const handleAddComment = async (postId: string) => {
    if (!user || !commentDraft.trim() || commenting) return;
    setCommenting(true);
    setActionError(null);
    try {
      await addComment(user.id, postId, commentDraft.trim());
      setPosts(prev =>
        prev.map(p =>
          p.id === postId ? { ...p, comments: p.comments + 1 } : p
        )
      );
      setCommentDraft('');
      setOpenComment(null);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Không gửi được bình luận');
    } finally {
      setCommenting(false);
    }
  };

  // Resolve which of the loaded posts the current user has liked.
  useEffect(() => {
    if (!user || posts.length === 0) return;
    let active = true;
    (async () => {
      const liked = await fetchLikedPostIds(user.id, posts.map(p => p.id));
      if (!active || liked.size === 0) return;
      setPosts(prev => prev.map(p => (liked.has(p.id) ? { ...p, likedByMe: true } : p)));
    })();
    return () => {
      active = false;
    };
    // Re-run when the signed-in user changes or the number of posts changes
    // (i.e. after the initial feed load). Intentionally not depending on the
    // full posts array to avoid a refetch loop from the setPosts above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, posts.length]);

  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true);
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false });

        if (postsError || !postsData || postsData.length === 0) {
          setPosts([]);
          return;
        }

        // Item 21: replace the per-post N+1 reads (profiles, post_likes,
        // post_comments, post_tags, tags) with 6 batched queries total.
        const postRows = postsData as PostRow[];
        const postIds = postRows.map(p => p.id);
        const userIds = Array.from(
          new Set(postRows.map(p => p.user_id).filter((id): id is string => Boolean(id)))
        );

        // (2) profiles — batched by user_id (guard empty array).
        const profileMap = new Map<string, { username: string | null; avatar_url: string | null }>();
        if (userIds.length > 0) {
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, username, avatar_url')
            .in('id', userIds);
          if (profilesData) {
            for (const p of profilesData as ProfileRow[]) {
              profileMap.set(p.id, { username: p.username, avatar_url: p.avatar_url });
            }
          }
        }

        // (3) post_likes — batched by post_id; count per post in memory.
        const likesMap = new Map<string, number>();
        if (postIds.length > 0) {
          const { data: likesData } = await supabase
            .from('post_likes')
            .select('post_id')
            .in('post_id', postIds);
          if (likesData) {
            for (const l of likesData as Pick<PostLikeRow, 'post_id'>[]) {
              likesMap.set(l.post_id, (likesMap.get(l.post_id) || 0) + 1);
            }
          }
        }

        // (4) post_comments — batched by post_id; count per post in memory.
        const commentsMap = new Map<string, number>();
        if (postIds.length > 0) {
          const { data: commentsData } = await supabase
            .from('post_comments')
            .select('post_id')
            .in('post_id', postIds);
          if (commentsData) {
            for (const c of commentsData as Pick<PostCommentRow, 'post_id'>[]) {
              commentsMap.set(c.post_id, (commentsMap.get(c.post_id) || 0) + 1);
            }
          }
        }

        // (5) post_tags — batched by post_id; collect tag_ids per post.
        const postTagsMap = new Map<string, string[]>();
        const allTagIds = new Set<string>();
        if (postIds.length > 0) {
          const { data: postTagsData } = await supabase
            .from('post_tags')
            .select('post_id, tag_id')
            .in('post_id', postIds);
          if (postTagsData) {
            for (const pt of postTagsData as Pick<PostTagRow, 'post_id' | 'tag_id'>[]) {
              const arr = postTagsMap.get(pt.post_id) || [];
              arr.push(pt.tag_id);
              postTagsMap.set(pt.post_id, arr);
              allTagIds.add(pt.tag_id);
            }
          }
        }

        // (6) tags — batched by tag_id (guard empty array).
        const tagMap = new Map<string, string>();
        if (allTagIds.size > 0) {
          const { data: tagsData } = await supabase
            .from('tags')
            .select('id, name')
            .in('id', Array.from(allTagIds));
          if (tagsData) {
            for (const t of tagsData as Pick<TagRow, 'id' | 'name'>[]) {
              tagMap.set(t.id, t.name);
            }
          }
        }

        const defaultAvatar = 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&q=80&w=100';
        const formattedPosts: BlogPost[] = postRows.map(post => {
          const profile = post.user_id ? profileMap.get(post.user_id) : undefined;
          const authorName = profile?.username || 'Anonymous';
          const authorAvatar = profile?.avatar_url || defaultAvatar;
          const tagIds = postTagsMap.get(post.id) || [];
          const tagsString = tagIds
            .map(tid => tagMap.get(tid))
            .filter((name): name is string => Boolean(name))
            .map(name => `#${name}`)
            .join(' ');

          const postDate = new Date(post.created_at || new Date());
          const now = new Date();
          const diffInHours = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60));
          const timeStr = diffInHours < 24 ? `${diffInHours || 1} giờ` : `${Math.floor(diffInHours / 24)} ngày`;

          return {
            id: post.id,
            authorId: post.user_id ?? null,
            name: authorName,
            time: timeStr,
            content: post.content || '',
            tags: tagsString,
            likes: likesMap.get(post.id) || 0,
            comments: commentsMap.get(post.id) || 0,
            shares: 0,
            avatar: authorAvatar,
            likedByMe: false,
          };
        });

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
    <div className="w-full flex-1 p-4 md:p-6 font-sans flex flex-col items-center bg-[#FFFFFF]">
      <div className="max-w-[1440px] w-full flex flex-col lg:flex-row gap-6">
        <aside className="w-full lg:w-[320px] flex flex-col gap-6 shrink-0 h-fit lg:sticky lg:top-28">
          <div className="bg-[#FFFFFF] rounded-[24px] lg:rounded-[32px] p-4 lg:p-6 shadow-sm border border-rose-50 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible no-scrollbar pb-3 lg:pb-6">
            {[
              { icon: Flame, text: 'Sắp Xếp Theo', active: true },
              { icon: Clock, text: 'Mới Nhất' },
              { icon: Heart, text: 'Phổ Biến' },
              { icon: Folder, text: 'Danh Mục' },
              { icon: Hash, text: 'Chủ Đề' },
              { icon: Bookmark, text: 'Lưu Bài Viết' },
            ].map((item, i) => (
              <button key={i} className={`flex items-center gap-2 lg:gap-4 px-4 py-2.5 lg:py-3 rounded-full lg:rounded-[20px] transition-colors font-semibold text-xs uppercase tracking-wider whitespace-nowrap ${item.active ? 'bg-[#FFFFFF] text-[#F2BFC8] shadow-sm border border-rose-100 lg:border-none' : 'text-[#1B2C40] hover:bg-[#FFFFFF] hover:text-[#F2BFC8]'}`}>
                <item.icon className={`w-4 h-4 lg:w-5 lg:h-5 ${item.active ? 'text-[#F2BFC8]' : 'text-rose-200'}`} strokeWidth={item.active ? 2.5 : 2} />
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

        <main className="flex-1 flex flex-col gap-6 max-w-[650px] mx-auto w-full pb-10">
          <div className="bg-[#FFFFFF] rounded-[32px] pt-4 px-6 pb-0 shadow-sm border border-rose-50 flex flex-col">
            <div className="flex items-center gap-3 mb-4 bg-white border border-rose-100 rounded-full p-2 pl-4 pr-3 shadow-sm">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-white">
                <img src="https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&q=80&w=100" alt="avatar" className="w-full h-full rounded-full object-cover" />
              </div>
              <input
                type="text"
                value={composer}
                onChange={(e) => setComposer(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleCreatePost(); }}
                disabled={!user || posting}
                placeholder={user ? 'Bạn đang nghĩ gì?' : 'Đăng nhập để chia sẻ...'}
                className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-[#1B2C40]/40 text-[#1B2C40] font-medium disabled:opacity-60"
              />
              <div className="flex text-[#F2BFC8] gap-1 shrink-0 items-center">
                <button className="w-8 h-8 rounded-full hover:bg-rose-50 flex items-center justify-center transition-colors"><ImagePlus className="w-5 h-5" /></button>
                <button className="w-8 h-8 rounded-full hover:bg-rose-50 flex items-center justify-center transition-colors font-bold text-[10px]">GIF</button>
                <button className="w-8 h-8 rounded-full hover:bg-rose-50 flex items-center justify-center transition-colors"><Smile className="w-5 h-5" /></button>
                <button
                  onClick={handleCreatePost}
                  disabled={!user || posting || !composer.trim()}
                  title="Đăng bài"
                  className="w-8 h-8 rounded-full bg-[#F2BFC8] text-white flex items-center justify-center transition-colors hover:bg-[#1B2C40] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
            {actionError && (
              <p className="text-[11px] text-rose-600 mb-2 px-1">{actionError}</p>
            )}
            <div className="flex items-center gap-2 justify-between">
              {['Dành cho bạn', 'Đang theo dõi', 'Gần đây', 'Phổ biến'].map((tab, i) => (
                <button key={i} className={`flex-1 py-4 text-xs font-bold transition-all relative uppercase tracking-wider ${i === 0 ? 'text-[#F2BFC8]' : 'text-[#1B2C40]/60 hover:text-[#1B2C40]'}`}>
                  {tab}
                  {i === 0 && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#F2BFC8] rounded-t-full"></div>}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {loading ? (
              <div className="w-full py-20 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F2BFC8]"></div>
              </div>
            ) : posts.map((post) => (
              <div key={post.id} className="bg-[#FFFFFF] rounded-[32px] p-6 shadow-sm border border-rose-50 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full shadow-sm flex shrink-0 overflow-hidden bg-rose-100">
                    <img src={post.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col">
                    <h4 className="font-bold text-[#1B2C40] text-[15px] leading-tight">{post.name}</h4>
                    <span className="text-[11px] text-[#1B2C40]/50 font-medium">{post.time}</span>
                  </div>
                  {post.authorId && (
                    <div className="ml-auto">
                      <FollowButton type="user" targetId={post.authorId} size="sm" showCount={false} />
                    </div>
                  )}
                  <button className={`${post.authorId ? '' : 'ml-auto '}text-[#1B2C40]/40 hover:text-[#1B2C40]`}><MoreHorizontal className="w-5 h-5" /></button>
                </div>
                <p className="text-[13px] text-[#1B2C40] leading-relaxed whitespace-pre-line font-medium mt-1">{post.content}</p>
                <p className="text-[13px] text-[#F2BFC8] font-medium font-sans">{post.tags}</p>
                <div className="flex items-center gap-8 mt-2 text-[#1B2C40]/60 font-medium text-xs">
                  <button
                    onClick={() => handleToggleLike(post)}
                    disabled={!user || busyLikeId === post.id}
                    className={`flex items-center gap-2 transition-colors disabled:cursor-not-allowed ${post.likedByMe ? 'text-[#F2BFC8]' : 'hover:text-[#F2BFC8]'}`}
                  >
                    <Heart className={`w-4 h-4 ${post.likedByMe ? 'fill-current' : ''}`} /> {post.likes}
                  </button>
                  <button
                    onClick={() => {
                      setOpenComment(openComment === post.id ? null : post.id);
                      setCommentDraft('');
                    }}
                    className="flex items-center gap-2 hover:text-[#F2BFC8] transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" /> {post.comments}
                  </button>
                  <button className="flex items-center gap-2 hover:text-[#F2BFC8] transition-colors"><Share2 className="w-4 h-4" /> {post.shares}</button>
                  <button className="ml-auto hover:text-[#F2BFC8] transition-colors"><Bookmark className="w-4 h-4" /></button>
                </div>
                {openComment === post.id && (
                  <div className="flex items-center gap-2 mt-1 bg-white border border-rose-100 rounded-full p-1.5 pl-4 pr-2">
                    <input
                      type="text"
                      value={commentDraft}
                      onChange={(e) => setCommentDraft(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(post.id); }}
                      disabled={!user || commenting}
                      placeholder={user ? 'Viết bình luận...' : 'Đăng nhập để bình luận...'}
                      className="flex-1 bg-transparent border-none outline-none text-xs text-[#1B2C40] placeholder:text-[#1B2C40]/40 disabled:opacity-60"
                    />
                    <button
                      onClick={() => handleAddComment(post.id)}
                      disabled={!user || commenting || !commentDraft.trim()}
                      className="w-7 h-7 rounded-full bg-[#F2BFC8] text-white flex items-center justify-center hover:bg-[#1B2C40] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </main>

        <aside className="hidden xl:flex w-[280px] flex-col gap-6 shrink-0 h-fit sticky top-28">
          <div className="bg-white rounded-full flex items-center px-4 py-3 shadow-sm border border-rose-50">
            <Search className="w-4 h-4 text-rose-300 mr-2" />
            <input type="text" placeholder="Tìm kiếm bài viết..." className="flex-1 bg-transparent border-none outline-none text-xs text-[#1B2C40] placeholder:text-[#1B2C40]/40" />
          </div>
          <div className="bg-[#FFFFFF] rounded-[32px] p-6 shadow-sm border border-rose-50 flex flex-col gap-4">
            <h3 className="font-bold text-[#1B2C40] text-xs uppercase tracking-widest border-b border-rose-100 pb-3">TOP BÀI VIẾT THỊNH HÀNH</h3>
            <div className="flex flex-col gap-4 mt-2">
              {[
                { title: 'Checklist chuẩn bị cưới\ncho các cặp đôi', views: '1.8K', img: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=100' },
                { title: 'Những lưu ý quan trọng khi\nchọn ngày cưới đẹp', views: '1.5K', img: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=100' },
                { title: 'Nhẫn cưới – Bí quyết chọn\nnhẫn phù hợp', views: '1.2K', img: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&q=80&w=100' }
              ].map((t, i) => (
                <div key={i} className="flex gap-3 items-center group cursor-pointer">
                  <img src={t.img} alt="thumb" className="w-12 h-12 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform" />
                  <div className="flex flex-col">
                    <h4 className="text-[11px] font-bold text-[#1B2C40] leading-tight group-hover:text-[#F2BFC8] transition-colors">{t.title}</h4>
                    <span className="text-[10px] text-[#1B2C40]/50 mt-1">{t.views} lượt xem</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-[#FFFFFF] rounded-[32px] p-6 shadow-sm border border-rose-50 flex flex-col gap-4">
            <h3 className="font-bold text-[#1B2C40] text-xs uppercase tracking-widest border-b border-rose-100 pb-3">CHỦ ĐỀ ĐƯỢC QUAN TÂM</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {['Ảnh & Phim Cưới', 'Áo Cưới', 'Sảnh Tiệc', 'Trang Trí', 'Kinh Nghiệm Cưới', 'Xu Hướng', 'Phong Thủy Cưới Hỏi', 'Thiệp Cưới'].map((tag, i) => (
                <span key={i} className="px-4 py-2 rounded-full border border-rose-200 text-[#F2BFC8] text-[10px] font-bold tracking-wider hover:bg-[#FFFFFF] cursor-pointer transition-colors shadow-sm bg-white whitespace-nowrap">{tag}</span>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
