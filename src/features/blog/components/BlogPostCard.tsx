import { Bookmark, Heart, MessageCircle, MoreHorizontal, Send, Share2 } from 'lucide-react';
import FollowButton from '../../social/components/FollowButton';
import { BlogPost } from '../types';

interface BlogPostCardProps {
  post: BlogPost;
  isAuthenticated: boolean;
  likePending: boolean;
  commentOpen: boolean;
  commentDraft: string;
  commenting: boolean;
  onToggleLike: (post: BlogPost) => void;
  onToggleComment: (postId: string) => void;
  onCommentDraftChange: (value: string) => void;
  onAddComment: (postId: string) => void;
}

export function BlogPostCard({
  post,
  isAuthenticated,
  likePending,
  commentOpen,
  commentDraft,
  commenting,
  onToggleLike,
  onToggleComment,
  onCommentDraftChange,
  onAddComment,
}: BlogPostCardProps) {
  return (
    <article className="bg-[#FFFFFF] rounded-[32px] p-6 shadow-sm border border-rose-50 flex flex-col gap-4">
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
        <button className={`${post.authorId ? '' : 'ml-auto '}text-[#1B2C40]/40 hover:text-[#1B2C40]`}>
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>
      <p className="text-[13px] text-[#1B2C40] leading-relaxed whitespace-pre-line font-medium mt-1">{post.content}</p>
      <p className="text-[13px] text-[#F2BFC8] font-medium font-sans">{post.tags}</p>
      <div className="flex items-center gap-8 mt-2 text-[#1B2C40]/60 font-medium text-xs">
        <button
          onClick={() => onToggleLike(post)}
          disabled={!isAuthenticated || likePending}
          className={`flex items-center gap-2 transition-colors disabled:cursor-not-allowed ${post.likedByMe ? 'text-[#F2BFC8]' : 'hover:text-[#F2BFC8]'}`}
        >
          <Heart className={`w-4 h-4 ${post.likedByMe ? 'fill-current' : ''}`} /> {post.likes}
        </button>
        <button
          onClick={() => onToggleComment(post.id)}
          className="flex items-center gap-2 hover:text-[#F2BFC8] transition-colors"
        >
          <MessageCircle className="w-4 h-4" /> {post.comments}
        </button>
        <button className="flex items-center gap-2 hover:text-[#F2BFC8] transition-colors">
          <Share2 className="w-4 h-4" /> {post.shares}
        </button>
        <button className="ml-auto hover:text-[#F2BFC8] transition-colors"><Bookmark className="w-4 h-4" /></button>
      </div>
      {commentOpen && (
        <div className="flex items-center gap-2 mt-1 bg-white border border-rose-100 rounded-full p-1.5 pl-4 pr-2">
          <input
            type="text"
            value={commentDraft}
            onChange={(event) => onCommentDraftChange(event.target.value)}
            onKeyDown={(event) => { if (event.key === 'Enter') onAddComment(post.id); }}
            disabled={!isAuthenticated || commenting}
            placeholder={isAuthenticated ? 'Viết bình luận...' : 'Đăng nhập để bình luận...'}
            className="flex-1 bg-transparent border-none outline-none text-xs text-[#1B2C40] placeholder:text-[#1B2C40]/40 disabled:opacity-60"
          />
          <button
            onClick={() => onAddComment(post.id)}
            disabled={!isAuthenticated || commenting || !commentDraft.trim()}
            className="w-7 h-7 rounded-full bg-[#F2BFC8] text-white flex items-center justify-center hover:bg-[#1B2C40] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </article>
  );
}
