import { getJson } from '../../../shared/api/backendClient';
import { resolveDataEndpoint } from '../../../shared/api/backendConfig';
import { BlogPost } from '../types';

/**
 * The feed is assembled by `GET /api/v1/posts`, which performs the author,
 * tag, like and comment joins server-side and returns the `BlogPost` shape
 * this module previously built by hand (FR-007). The endpoint is public; when
 * a session exists, `likedByMe` is resolved for that caller.
 */
export async function fetchBlogPosts(): Promise<BlogPost[]> {
  const { posts } = await getJson<{ posts: BlogPost[] }>(
    resolveDataEndpoint('/api/v1/posts')
  );
  return posts;
}
