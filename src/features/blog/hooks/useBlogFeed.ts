import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import {
  addComment,
  createPost,
  fetchLikedPostIds,
  toggleLike,
} from '../../social/services/socialService';
import { DEFAULT_BLOG_AVATAR } from '../constants';
import { fetchBlogPosts } from '../services/blogService';
import { BlogPost } from '../types';

export function useBlogFeed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [composer, setComposer] = useState('');
  const [posting, setPosting] = useState(false);
  const [busyLikeId, setBusyLikeId] = useState<string | null>(null);
  const [openComment, setOpenComment] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState('');
  const [commenting, setCommenting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleCreatePost = async () => {
    if (!user || !composer.trim() || posting) return;
    setPosting(true);
    setActionError(null);
    try {
      const row = await createPost(user.id, composer.trim());
      setPosts((current) => [{
        id: row.id,
        authorId: user.id,
        name: user.name,
        time: '1 giờ',
        content: row.content,
        likes: 0,
        comments: 0,
        shares: 0,
        avatar: user.avatarUrl || DEFAULT_BLOG_AVATAR,
        likedByMe: false,
      }, ...current]);
      setComposer('');
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Không đăng được bài');
    } finally {
      setPosting(false);
    }
  };

  const handleToggleLike = async (post: BlogPost) => {
    if (!user || busyLikeId === post.id) return;
    setBusyLikeId(post.id);
    const nextLiked = !post.likedByMe;
    setPosts((current) => current.map((item) => (
      item.id === post.id
        ? { ...item, likedByMe: nextLiked, likes: item.likes + (nextLiked ? 1 : -1) }
        : item
    )));

    try {
      await toggleLike(user.id, post.id, post.likedByMe);
    } catch {
      setPosts((current) => current.map((item) => (
        item.id === post.id
          ? { ...item, likedByMe: post.likedByMe, likes: post.likes }
          : item
      )));
    } finally {
      setBusyLikeId(null);
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!user || !commentDraft.trim() || commenting) return;
    setCommenting(true);
    setActionError(null);
    try {
      await addComment(user.id, postId, commentDraft.trim());
      setPosts((current) => current.map((post) => (
        post.id === postId ? { ...post, comments: post.comments + 1 } : post
      )));
      setCommentDraft('');
      setOpenComment(null);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Không gửi được bình luận');
    } finally {
      setCommenting(false);
    }
  };

  const toggleComment = (postId: string) => {
    setOpenComment((current) => current === postId ? null : postId);
    setCommentDraft('');
  };

  useEffect(() => {
    if (!user || posts.length === 0) return;
    let active = true;
    fetchLikedPostIds(user.id, posts.map((post) => post.id)).then((likedPostIds) => {
      if (!active || likedPostIds.size === 0) return;
      setPosts((current) => current.map((post) => (
        likedPostIds.has(post.id) ? { ...post, likedByMe: true } : post
      )));
    });
    return () => {
      active = false;
    };
    // posts.length intentionally triggers this only when the feed membership changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, posts.length]);

  useEffect(() => {
    fetchBlogPosts()
      .then(setPosts)
      .catch((error) => {
        console.error('Error fetching blog data:', error);
        setPosts([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return {
    user,
    posts,
    loading,
    composer,
    setComposer,
    posting,
    busyLikeId,
    openComment,
    commentDraft,
    setCommentDraft,
    commenting,
    actionError,
    handleCreatePost,
    handleToggleLike,
    handleAddComment,
    toggleComment,
  };
}
