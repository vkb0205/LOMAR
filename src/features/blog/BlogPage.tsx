import { BlogComposer } from './components/BlogComposer';
import { BlogDiscoverySidebar } from './components/BlogDiscoverySidebar';
import { BlogNavigation } from './components/BlogNavigation';
import { BlogPostCard } from './components/BlogPostCard';
import { useBlogFeed } from './hooks/useBlogFeed';

export default function Blog() {
  const feed = useBlogFeed();

  return (
    <div className="w-full flex-1 p-4 md:p-6 font-sans flex flex-col items-center bg-[#FFFFFF]">
      <div className="max-w-[1440px] w-full flex flex-col lg:flex-row gap-6">
        <BlogNavigation />

        <main className="flex-1 flex flex-col gap-6 max-w-[650px] mx-auto w-full pb-10">
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
              <div className="w-full py-20 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F2BFC8]" />
              </div>
            ) : feed.posts.map((post) => (
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
            ))}
          </div>
        </main>

        <BlogDiscoverySidebar />
      </div>
    </div>
  );
}
