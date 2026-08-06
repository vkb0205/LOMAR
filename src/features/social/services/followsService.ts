import { deleteJson, getJson, postJsonTyped } from '../../../shared/api/backendClient';
import { resolveDataEndpoint } from '../../../shared/api/backendConfig';

/** Social-graph helpers routed through backend API. */
export type FolloweeType = 'user' | 'vendor';

export interface ToggleFollowResult {
  following: boolean;
  error: string | null;
}

function stateEndpoint(type: FolloweeType, targetId: string): string {
  return resolveDataEndpoint(
    `/api/v1/follows/${type}/${encodeURIComponent(targetId)}`
  );
}

export async function getFollowerCount(
  type: FolloweeType,
  targetId: string
): Promise<number> {
  try {
    const { followerCount } = await getJson<{ following: boolean; followerCount: number }>(
      stateEndpoint(type, targetId)
    );
    return followerCount;
  } catch (error) {
    console.error('getFollowerCount failed:', error);
    return 0;
  }
}

export async function isFollowing(
  _followerId: string | null | undefined,
  type: FolloweeType,
  targetId: string
): Promise<boolean> {
  if (!_followerId) return false;
  try {
    const { following } = await getJson<{ following: boolean; followerCount: number }>(
      stateEndpoint(type, targetId)
    );
    return following;
  } catch (error) {
    console.error('isFollowing failed:', error);
    return false;
  }
}

export async function follow(
  _followerId: string,
  type: FolloweeType,
  targetId: string
): Promise<ToggleFollowResult> {
  try {
    const result = await postJsonTyped<{ following: boolean; followerCount: number }>(
      resolveDataEndpoint('/api/v1/follows'),
      { body: { followeeType: type, followeeId: targetId } }
    );
    return { following: result.following, error: null };
  } catch (error) {
    return { following: false, error: error instanceof Error ? error.message : 'Follow failed' };
  }
}

export async function unfollow(
  _followerId: string,
  type: FolloweeType,
  targetId: string
): Promise<ToggleFollowResult> {
  try {
    const result = await deleteJson<{ following: boolean; followerCount: number }>(
      stateEndpoint(type, targetId)
    );
    return { following: result.following, error: null };
  } catch (error) {
    return { following: true, error: error instanceof Error ? error.message : 'Unfollow failed' };
  }
}

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

/** No direct follow-table reads remain; query state endpoint per target. */
export async function getFollowingSet(
  _followerId: string | null | undefined,
  _type: FolloweeType,
  _candidateIds: string[]
): Promise<Set<string>> {
  return new Set<string>();
}
