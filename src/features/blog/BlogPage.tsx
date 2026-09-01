import { BlogComposer } from './components/BlogComposer';
import { BlogDiscoverySidebar } from './components/BlogDiscoverySidebar';
import { BlogNavigation } from './components/BlogNavigation';
import { BlogPostCard } from './components/BlogPostCard';
import { useBlogFeed } from './hooks/useBlogFeed';
import { Spinner } from '../../shared/ui/Spinner';

export default function Blog() {
  const feed = useBlogFeed();

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
              feed.posts.map((post) => (
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
            )}
          </div>
        </main>

        <BlogDiscoverySidebar />
      </div>
    </div>
  );
}
