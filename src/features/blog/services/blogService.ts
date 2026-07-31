import { supabase } from '../../../shared/api/supabaseClient';
import { Database } from '../../../shared/types/database';
import { DEFAULT_BLOG_AVATAR } from '../constants';
import { BlogPost } from '../types';

type PostRow = Database['public']['Tables']['posts']['Row'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type PostLikeRow = Database['public']['Tables']['post_likes']['Row'];
type PostCommentRow = Database['public']['Tables']['post_comments']['Row'];
type PostTagRow = Database['public']['Tables']['post_tags']['Row'];
type TagRow = Database['public']['Tables']['tags']['Row'];

async function fetchProfiles(userIds: string[]) {
  const profiles = new Map<string, Pick<ProfileRow, 'username' | 'avatar_url'>>();
  if (userIds.length === 0) return profiles;

  const { data } = await supabase
    .from('profiles')
    .select('id, username, avatar_url')
    .in('id', userIds);

  for (const profile of (data || []) as ProfileRow[]) {
    profiles.set(profile.id, {
      username: profile.username,
      avatar_url: profile.avatar_url,
    });
  }
  return profiles;
}

async function fetchCountByPost<T extends { post_id: string }>(
  table: 'post_likes' | 'post_comments',
  postIds: string[],
) {
  const counts = new Map<string, number>();
  if (postIds.length === 0) return counts;

  const { data } = await supabase.from(table).select('post_id').in('post_id', postIds);
  for (const row of (data || []) as T[]) {
    counts.set(row.post_id, (counts.get(row.post_id) || 0) + 1);
  }
  return counts;
}

async function fetchTagsByPost(postIds: string[]) {
  const tagIdsByPost = new Map<string, string[]>();
  const allTagIds = new Set<string>();

  if (postIds.length > 0) {
    const { data } = await supabase
      .from('post_tags')
      .select('post_id, tag_id')
      .in('post_id', postIds);

    for (const relation of (data || []) as Pick<PostTagRow, 'post_id' | 'tag_id'>[]) {
      const tagIds = tagIdsByPost.get(relation.post_id) || [];
      tagIds.push(relation.tag_id);
      tagIdsByPost.set(relation.post_id, tagIds);
      allTagIds.add(relation.tag_id);
    }
  }

  const tags = new Map<string, string>();
  if (allTagIds.size > 0) {
    const { data } = await supabase
      .from('tags')
      .select('id, name')
      .in('id', Array.from(allTagIds));

    for (const tag of (data || []) as Pick<TagRow, 'id' | 'name'>[]) {
      tags.set(tag.id, tag.name);
    }
  }

  return { tagIdsByPost, tags };
}

function formatPostTime(createdAt: string | null) {
  const postDate = new Date(createdAt || new Date());
  const diffInHours = Math.floor((Date.now() - postDate.getTime()) / (1000 * 60 * 60));
  return diffInHours < 24
    ? `${diffInHours || 1} giờ`
    : `${Math.floor(diffInHours / 24)} ngày`;
}

export async function fetchBlogPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data || data.length === 0) return [];

  const posts = data as PostRow[];
  const postIds = posts.map((post) => post.id);
  const userIds = Array.from(
    new Set(posts.map((post) => post.user_id).filter((id): id is string => Boolean(id))),
  );

  // Keep these reads batched so the feed does not issue queries per post.
  const [profiles, likes, comments, tagData] = await Promise.all([
    fetchProfiles(userIds),
    fetchCountByPost<Pick<PostLikeRow, 'post_id'>>('post_likes', postIds),
    fetchCountByPost<Pick<PostCommentRow, 'post_id'>>('post_comments', postIds),
    fetchTagsByPost(postIds),
  ]);

  return posts.map((post) => {
    const profile = post.user_id ? profiles.get(post.user_id) : undefined;
    const tags = (tagData.tagIdsByPost.get(post.id) || [])
      .map((tagId) => tagData.tags.get(tagId))
      .filter((name): name is string => Boolean(name))
      .map((name) => `#${name}`)
      .join(' ');

    return {
      id: post.id,
      authorId: post.user_id ?? null,
      name: profile?.username || 'Anonymous',
      time: formatPostTime(post.created_at),
      content: post.content || '',
      tags,
      likes: likes.get(post.id) || 0,
      comments: comments.get(post.id) || 0,
      shares: 0,
      avatar: profile?.avatar_url || DEFAULT_BLOG_AVATAR,
      likedByMe: false,
    };
  });
}
