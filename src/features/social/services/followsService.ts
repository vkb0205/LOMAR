import { supabase } from '../../../shared/api/supabaseClient';
import { Database } from '../../../shared/types/database';

/**
 * Social-graph helpers for the `follows` table (see database/add_follows.sql).
 *
 * A follow edge points from the authenticated user (`follower_id`) to either
 * another user (profile) or a vendor. The table has:
 *   - public SELECT (for counts / follow-state),
 *   - owner-scoped INSERT/DELETE keyed on auth.uid() = follower_id.
 *
 * All access here is typed against Database['public']['Tables']['follows'];
 * there are no `as any` casts.
 */

type FollowRow = Database['public']['Tables']['follows']['Row'];
type FollowInsert = Database['public']['Tables']['follows']['Insert'];

/** The kind of entity being followed. */
export type FolloweeType = 'user' | 'vendor';

/** Result of a follow/unfollow toggle. */
export interface ToggleFollowResult {
  /** Whether the current user follows the target after the operation. */
  following: boolean;
  /** Non-null when the operation failed; the UI should revert optimistic state. */
  error: string | null;
}

function targetColumn(type: FolloweeType): 'followee_user_id' | 'followee_vendor_id' {
  return type === 'user' ? 'followee_user_id' : 'followee_vendor_id';
}

/**
 * Count how many followers a target (user or vendor) has.
 * Uses a HEAD count query so no rows are transferred.
 */
export async function getFollowerCount(
  type: FolloweeType,
  targetId: string
): Promise<number> {
  const { count, error } = await supabase
    .from('follows')
    .select('id', { count: 'exact', head: true })
    .eq(targetColumn(type), targetId);

  if (error) {
    console.error('getFollowerCount failed:', error.message);
    return 0;
  }
  return count ?? 0;
}

/**
 * Whether `followerId` currently follows the given target. Returns false when
 * `followerId` is empty (logged-out) without hitting the network.
 */
export async function isFollowing(
  followerId: string | null | undefined,
  type: FolloweeType,
  targetId: string
): Promise<boolean> {
  if (!followerId) return false;

  const { data, error } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', followerId)
    .eq(targetColumn(type), targetId)
    .maybeSingle();

  if (error) {
    console.error('isFollowing failed:', error.message);
    return false;
  }
  return Boolean(data);
}

/**
 * Follow a target. Idempotent from the caller's perspective: a duplicate
 * follow (unique-index violation, code 23505) is treated as success.
 */
export async function follow(
  followerId: string,
  type: FolloweeType,
  targetId: string
): Promise<ToggleFollowResult> {
  const payload: FollowInsert = {
    follower_id: followerId,
    followee_type: type,
    followee_user_id: type === 'user' ? targetId : null,
    followee_vendor_id: type === 'vendor' ? targetId : null,
  };

  const { error } = await supabase.from('follows').insert<FollowInsert>(payload);

  if (error && error.code !== '23505') {
    console.error('follow failed:', error.message);
    return { following: false, error: error.message };
  }
  return { following: true, error: null };
}

/** Unfollow a target. A no-op delete (nothing matched) is still success. */
export async function unfollow(
  followerId: string,
  type: FolloweeType,
  targetId: string
): Promise<ToggleFollowResult> {
  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', followerId)
    .eq(targetColumn(type), targetId);

  if (error) {
    console.error('unfollow failed:', error.message);
    return { following: true, error: error.message };
  }
  return { following: false, error: null };
}

/**
 * Toggle follow state for a target based on the current `following` flag.
 * Callers typically apply an optimistic UI update, then reconcile with the
 * returned result (reverting on `error`).
 */
export async function toggleFollow(
  followerId: string,
  type: FolloweeType,
  targetId: string,
  currentlyFollowing: boolean
): Promise<ToggleFollowResult> {
  return currentlyFollowing
    ? unfollow(followerId, type, targetId)
    : follow(followerId, type, targetId);
}

/**
 * Return the set of target IDs (of the given type) that `followerId` follows,
 * restricted to `candidateIds`. Used to batch-resolve follow-state for a list
 * (e.g. post authors in the feed) with a single query.
 */
export async function getFollowingSet(
  followerId: string | null | undefined,
  type: FolloweeType,
  candidateIds: string[]
): Promise<Set<string>> {
  const result = new Set<string>();
  if (!followerId || candidateIds.length === 0) return result;

  const column = targetColumn(type);
  const { data, error } = await supabase
    .from('follows')
    .select(column)
    .eq('follower_id', followerId)
    .in(column, candidateIds);

  if (error) {
    console.error('getFollowingSet failed:', error.message);
    return result;
  }

  for (const row of (data ?? []) as Pick<FollowRow, typeof column>[]) {
    const value = row[column];
    if (value) result.add(value);
  }
  return result;
}
