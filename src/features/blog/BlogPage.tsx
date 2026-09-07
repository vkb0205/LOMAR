import { useMemo, useState } from 'react';
import { BlogComposer } from './components/BlogComposer';
import { BlogDiscoverySidebar } from './components/BlogDiscoverySidebar';
import { BlogNavigation } from './components/BlogNavigation';
import { BlogPostCard } from './components/BlogPostCard';
import { useBlogFeed } from './hooks/useBlogFeed';
import { Spinner } from '../../shared/ui/Spinner';

export default function Blog() {
  const feed = useBlogFeed();
  const [searchQuery, setSearchQuery] = useState('');
  const visiblePosts = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase('vi');
    if (!query) return feed.posts;

    return feed.posts.filter((post) =>
      [post.name, post.content, post.tags]
        .join(' ')
        .toLocaleLowerCase('vi')
        .includes(query)
    );
  }, [feed.posts, searchQuery]);

  return (
    <div className="flex flex-1 flex-col items-center bg-canvas px-4 py-8 md:px-6">
      <div className="flex w-full max-w-[1440px] flex-col gap-6 pt-16 lg:flex-row lg:pt-20">
        <BlogNavigation />

        <main className="mx-auto flex w-full max-w-[650px] flex-1 flex-col gap-6 pb-16">
          <BlogComposer
            isAuthenticated={Boolean(feed.user)}
            composer={feed.composer}
            posting={feed.posting}
            actionError={feed.actionError}
            onComposerChange={feed.setComposer}
            onSubmit={feed.handleCreatePost}
          />

          <div className="flex flex-col gap-6">
            {feed.loading ? (
              <div className="flex w-full justify-center py-24">
                <Spinner className="h-8 w-8" />
              </div>
            ) : (
              visiblePosts.length > 0 ? (
                visiblePosts.map((post) => (
                  <BlogPostCard
                    key={post.id}
                    post={post}
                    isAuthenticated={Boolean(feed.user)}
                    likePending={feed.busyLikeId === post.id}
                    commentOpen={feed.openComment === post.id}
                    commentDraft={feed.commentDraft}
                    commenting={feed.commenting}
                    onToggleLike={feed.handleToggleLike}
                    onToggleComment={feed.toggleComment}
                    onCommentDraftChange={feed.setCommentDraft}
                    onAddComment={feed.handleAddComment}
                  />
                ))
              ) : (
                <div className="rounded-bezel bg-ink/5 p-1.5 ring-1 ring-ink/5 shadow-tile">
                  <div className="rounded-bezel-inner bg-white px-6 py-12 text-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]">
                    <p className="text-sm font-bold text-ink">Không tìm thấy bài viết phù hợp</p>
                    <p className="mt-2 text-xs leading-relaxed text-ink/60">
                      Thử dùng từ khóa khác để tìm bài viết bạn cần.
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        </main>

        <BlogDiscoverySidebar searchQuery={searchQuery} onSearchQueryChange={setSearchQuery} />
      </div>
    </div>
  );
}
