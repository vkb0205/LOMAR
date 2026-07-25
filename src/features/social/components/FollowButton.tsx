import { useEffect, useState } from 'react';
import { UserPlus, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../shared/config/routes';
import { useAuth } from '../../auth/hooks/useAuth';
import {
  FolloweeType,
  getFollowerCount,
  isFollowing,
  toggleFollow,
} from '../services/followsService';

interface FollowButtonProps {
  /** What is being followed. */
  type: FolloweeType;
  /** The target's id (profile id or vendor id). */
  targetId: string;
  /** Show the live follower count next to the button. Default true. */
  showCount?: boolean;
  /** Visual size. 'sm' suits inline feed rows; 'md' suits detail headers. */
  size?: 'sm' | 'md';
  /** Extra classes for the wrapper. */
  className?: string;
}

/**
 * Follow / Unfollow control backed by the `follows` table via src/lib/follows.
 *
 * Behavior:
 *   - Logged-out users are routed to /login on click (no follow attempt).
 *   - Users cannot follow themselves (button hidden for own profile).
 *   - Optimistic toggle with revert-on-error.
 *   - Live follower count (optional) kept in sync with the optimistic state.
 */
export default function FollowButton({
  type,
  targetId,
  showCount = true,
  size = 'md',
  className = '',
}: FollowButtonProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [following, setFollowing] = useState(false);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);

  // Hide the control entirely when a user would be following themselves.
  const isSelf = type === 'user' && user?.id === targetId;

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      const [followState, followerCount] = await Promise.all([
        isFollowing(user?.id, type, targetId),
        showCount ? getFollowerCount(type, targetId) : Promise.resolve(0),
      ]);
      if (!active) return;
      setFollowing(followState);
      setCount(followerCount);
      setLoading(false);
    }
    load();
    return () => {
      active = false;
    };
  }, [user?.id, type, targetId, showCount]);

  if (isSelf) return null;

  const handleClick = async () => {
    if (!user) {
      navigate(ROUTES.login);
      return;
    }
    if (pending) return;

    // Optimistic update.
    const nextFollowing = !following;
    setFollowing(nextFollowing);
    setCount(c => Math.max(0, c + (nextFollowing ? 1 : -1)));
    setPending(true);

    const result = await toggleFollow(user.id, type, targetId, following);

    setPending(false);
    if (result.error) {
      // Revert on failure.
      setFollowing(following);
      setCount(c => Math.max(0, c + (nextFollowing ? -1 : 1)));
    } else {
      setFollowing(result.following);
    }
  };

  const sizeClasses =
    size === 'sm'
      ? 'px-3 py-1.5 text-[10px] gap-1.5'
      : 'px-5 py-2.5 sm:px-6 sm:py-3 text-xs gap-2';
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';

  const base =
    'flex items-center rounded-full font-bold uppercase tracking-widest transition-colors shadow-sm disabled:opacity-60';
  const activeStyle = following
    ? 'bg-white text-[#F2BFC8] border border-[#F2BFC8] hover:bg-rose-50'
    : 'bg-[#F2BFC8] text-white hover:bg-rose-400';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading || pending}
        aria-pressed={following}
        aria-label={following ? 'Bỏ theo dõi' : 'Theo dõi'}
        className={`${base} ${sizeClasses} ${activeStyle}`}
      >
        {following ? (
          <UserCheck className={iconSize} />
        ) : (
          <UserPlus className={iconSize} />
        )}
        {following ? 'ĐANG THEO DÕI' : 'THEO DÕI'}
      </button>
      {showCount && (
        <span className="text-xs font-bold text-[#1B2C40]/60">
          {count} người theo dõi
        </span>
      )}
    </div>
  );
}
