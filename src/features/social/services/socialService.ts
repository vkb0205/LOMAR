import { deleteJson, getJson, postJsonTyped } from '../../../shared/api/backendClient';
import { resolveDataEndpoint } from '../../../shared/api/backendConfig';
import { Database } from '../../../shared/types/database';

// ============================================================================
// Social feed write-side
// ============================================================================
// Every call now goes through the backend (`/api/v1/posts*`), which derives the
// author from the verified JWT — the `userId` arguments are retained so the
// existing call sites compile unchanged, but they are never sent to the server
// and never determine ownership (FR-004).
// ============================================================================

type PostRow = Database['public']['Tables']['posts']['Row'];
type CommentRow = Database['public']['Tables']['post_comments']['Row'];

/** Create a new published post authored by the current user. */
export async function createPost(
  _userId: string,
  content: string,
  title?: string | null
): Promise<PostRow> {
  return postJsonTyped<PostRow>(resolveDataEndpoint('/api/v1/posts'), {
    body: { content, title: title ?? null },
  });
}

/**
 * Return the set of post ids the current user has liked. The feed endpoint
 * already resolves `likedByMe` per post for the authenticated caller, so this
 * reads it back from there instead of issuing a second like-table query.
 */
export async function fetchLikedPostIds(
  _userId: string,
  postIds: string[]
): Promise<Set<string>> {
  const liked = new Set<string>();
  if (postIds.length === 0) return liked;
  try {
    const { posts } = await getJson<{ posts: { id: string; likedByMe: boolean }[] }>(
      resolveDataEndpoint('/api/v1/posts')
    );
    const wanted = new Set(postIds);
    for (const post of posts) {
      if (post.likedByMe && wanted.has(post.id)) liked.add(post.id);
    }
  } catch (error) {
    console.warn('fetchLikedPostIds failed:', error);
  }
  return liked;
}

/**
 * Set the caller's like state for a post. Returns the resulting liked state
 * (true = now liked). Both directions are idempotent server-side.
 */
export async function toggleLike(
  _userId: string,
  postId: string,
  currentlyLiked: boolean
): Promise<boolean> {
  const endpoint = resolveDataEndpoint(`/api/v1/posts/${encodeURIComponent(postId)}/likes`);
  const { liked } = currentlyLiked
    ? await deleteJson<{ liked: boolean; likeCount: number }>(endpoint)
    : await postJsonTyped<{ liked: boolean; likeCount: number }>(endpoint);
  return liked;
}

/** Add a comment to a post as the current user. */
export async function addComment(
  _userId: string,
  postId: string,
  content: string
): Promise<CommentRow> {
  return postJsonTyped<CommentRow>(
    resolveDataEndpoint(`/api/v1/posts/${encodeURIComponent(postId)}/comments`),
    { body: { content } }
  );
}
