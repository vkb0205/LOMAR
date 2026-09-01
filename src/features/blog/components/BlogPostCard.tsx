import { Bookmark, Heart, MessageCircle, MoreHorizontal, Send, Share2 } from 'lucide-react';
import { motion } from 'motion/react';
import FollowButton from '../../social/components/FollowButton';
import { BlogPost } from '../types';
import { EASE } from '../../../shared/ui/motion';

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
    <motion.article
      initial={{ opacity: 0, y: 32, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.7, ease: EASE }}
      className="flex flex-col rounded-bezel bg-ink/5 p-1.5 ring-1 ring-ink/5 shadow-tile transition-shadow duration-700 hover:shadow-card"
    >
      <div className="flex flex-col gap-4 rounded-bezel-inner bg-white p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-rose-mist shadow-card">
            <img src={post.avatar} alt="Avatar" className="h-full w-full object-cover" />
          </div>
          <div className="flex flex-col">
            <h4 className="text-[15px] font-bold leading-tight text-ink">{post.name}</h4>
            <span className="text-[11px] font-medium text-ink/50">{post.time}</span>
          </div>
          {post.authorId && (
            <div className="ml-auto">
              <FollowButton type="user" targetId={post.authorId} size="sm" showCount={false} />
            </div>
          )}
          <button className={`text-ink/40 transition-colors duration-500 hover:text-ink ${post.authorId ? '' : 'ml-auto '}`}>
            <MoreHorizontal strokeWidth={1.5} className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-1 whitespace-pre-line text-[13px] font-medium leading-relaxed text-ink">
          {post.content}
        </p>
        <p className="font-sans text-[13px] font-medium text-rose-deep">{post.tags}</p>

        <div className="mt-2 flex items-center gap-7 text-xs font-medium text-ink/60">
          <button
            onClick={() => onToggleLike(post)}
            disabled={!isAuthenticated || likePending}
            className={`group/like flex items-center gap-2 transition-all duration-500 ease-fluid disabled:cursor-not-allowed ${
              post.likedByMe ? 'text-rose-deep' : 'hover:text-rose-deep'
            }`}
          >
            <Heart
              strokeWidth={1.5}
              className={`h-4 w-4 transition-transform duration-500 ease-fluid group-hover/like:scale-110 ${
                post.likedByMe ? 'fill-current' : ''
              }`}
            />{' '}
            {post.likes}
          </button>
          <button
            onClick={() => onToggleComment(post.id)}
            className="flex items-center gap-2 transition-colors duration-500 hover:text-rose-deep"
          >
            <MessageCircle strokeWidth={1.5} className="h-4 w-4" /> {post.comments}
          </button>
          <button className="flex items-center gap-2 transition-colors duration-500 hover:text-rose-deep">
            <Share2 strokeWidth={1.5} className="h-4 w-4" /> {post.shares}
          </button>
          <button className="ml-auto transition-colors duration-500 hover:text-rose-deep">
            <Bookmark strokeWidth={1.5} className="h-4 w-4" />
          </button>
        </div>

        {commentOpen && (
          <div className="mt-1 flex items-center gap-2 rounded-full bg-canvas p-1.5 pl-4 pr-2 ring-1 ring-ink/10">
            <input
              type="text"
              value={commentDraft}
              onChange={(event) => onCommentDraftChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') onAddComment(post.id);
              }}
              disabled={!isAuthenticated || commenting}
              placeholder={isAuthenticated ? 'Viết bình luận...' : 'Đăng nhập để bình luận...'}
              className="flex-1 border-none bg-transparent text-xs text-ink outline-none placeholder:text-ink/40 disabled:opacity-60"
            />
            <button
              onClick={() => onAddComment(post.id)}
              disabled={!isAuthenticated || commenting || !commentDraft.trim()}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose text-white transition-colors duration-500 ease-fluid hover:bg-ink disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send strokeWidth={1.5} className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </motion.article>
  );
}
