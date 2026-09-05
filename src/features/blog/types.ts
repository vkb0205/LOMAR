export interface BlogPost {
  id: string;
  /** Author's profile id — null for legacy/anonymous posts (no follow target). */
  authorId: string | null;
  name: string;
  time: string;
  content: string;
  likes: number;
  comments: number;
  shares: number;
  avatar: string;
  /** Whether the current signed-in user has liked this post. */
  likedByMe: boolean;
}
