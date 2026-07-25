import { supabase } from '../../../shared/api/supabaseClient';
import { Database } from '../../../shared/types/database';

// ============================================================================
// Social feed write-side
// ============================================================================
// Small, self-contained helpers for the customer-facing social feed (Blog):
// create a post, toggle a like, and add a comment. All calls go through the
// normal authenticated client and are governed by the owner-scoped RLS
// policies (users act on their own rows). Reads of published content remain
// public per existing policies.
// ============================================================================

type PostInsert = Database['public']['Tables']['posts']['Insert'];
type PostRow = Database['public']['Tables']['posts']['Row'];
type CommentInsert = Database['public']['Tables']['post_comments']['Insert'];
type CommentRow = Database['public']['Tables']['post_comments']['Row'];

/** Create a new published post authored by the current user. */
export async function createPost(
  userId: string,
  content: string,
  title?: string | null
): Promise<PostRow> {
  const payload: PostInsert = {
    user_id: userId,
    title: title ?? null,
    content,
    status: 'published',
  };
  const { data, error } = await supabase
    .from('posts')
    .insert<PostInsert>(payload)
    .select('*')
    .single();
  if (error) throw error;
  return data as PostRow;
}

/** Return the set of post ids the current user has liked (from the given ids). */
export async function fetchLikedPostIds(
  userId: string,
  postIds: string[]
): Promise<Set<string>> {
  const liked = new Set<string>();
  if (postIds.length === 0) return liked;
  const { data, error } = await supabase
    .from('post_likes')
    .select('post_id')
    .eq('user_id', userId)
    .in('post_id', postIds);
  if (error) {
    console.warn('fetchLikedPostIds failed:', error.message);
    return liked;
  }
  for (const row of (data as { post_id: string }[]) ?? []) {
    liked.add(row.post_id);
  }
  return liked;
}

/**
 * Toggle a like for the current user on a post. Returns the resulting liked
 * state (true = now liked). Uses a delete-then-insert strategy keyed on the
 * composite (post_id, user_id) primary key.
 */
export async function toggleLike(
  userId: string,
  postId: string,
  currentlyLiked: boolean
): Promise<boolean> {
  if (currentlyLiked) {
    const { error } = await supabase
      .from('post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId);
    if (error) throw error;
    return false;
  }
  const { error } = await supabase
    .from('post_likes')
    .insert<Database['public']['Tables']['post_likes']['Insert']>({
      post_id: postId,
      user_id: userId,
    });
  if (error) throw error;
  return true;
}

/** Add a comment to a post as the current user. */
export async function addComment(
  userId: string,
  postId: string,
  content: string
): Promise<CommentRow> {
  const payload: CommentInsert = {
    post_id: postId,
    user_id: userId,
    content,
    status: 'published',
  };
  const { data, error } = await supabase
    .from('post_comments')
    .insert<CommentInsert>(payload)
    .select('*')
    .single();
  if (error) throw error;
  return data as CommentRow;
}
