import React, { useEffect, useState, useCallback } from 'react';
import { Trash2, EyeOff, Eye, Flag, FileText, MessageSquare } from 'lucide-react';
import {
  fetchPosts,
  updatePostStatus,
  deletePost,
  fetchComments,
  updateCommentStatus,
  deleteComment,
  fetchProfileNames,
} from '../services/adminService';
import { Database } from '../../../shared/types/database';
import {
  PanelHeader,
  AdminCard,
  LoadingBlock,
  EmptyBlock,
  StatusBadge,
  AdminActionButton,
  ConfirmDialog,
  formatDate,
} from '../components/ui';

type PostRow = Database['public']['Tables']['posts']['Row'];
type CommentRow = Database['public']['Tables']['post_comments']['Row'];

type Tab = 'posts' | 'comments';
type DeleteTarget =
  | { kind: 'post'; id: string; label: string }
  | { kind: 'comment'; id: string; label: string }
  | null;

export default function ModerationPanel() {
  const [tab, setTab] = useState<Tab>('posts');
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [names, setNames] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<DeleteTarget>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [p, c] = await Promise.all([
        fetchPosts(),
        fetchComments(),
      ]);
      setPosts(p);
      setComments(c);
      const ids = [
        ...p.map((x) => x.user_id),
        ...c.map((x) => x.user_id),
      ];
      setNames(await fetchProfileNames(ids));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không tải được nội dung');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const author = (userId: string) => names.get(userId) || userId.slice(0, 8);

  const setPStatus = async (row: PostRow, status: 'published' | 'hidden') => {
    setBusyId(row.id);
    try {
      await updatePostStatus(row.id, status);
      setPosts((prev) =>
        prev.map((r) => (r.id === row.id ? { ...r, status } : r))
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Cập nhật thất bại');
    } finally {
      setBusyId(null);
    }
  };

  const setCStatus = async (
    row: CommentRow,
    status: 'published' | 'hidden' | 'flagged'
  ) => {
    setBusyId(row.id);
    try {
      await updateCommentStatus(row.id, status);
      setComments((prev) =>
        prev.map((r) => (r.id === row.id ? { ...r, status } : r))
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Cập nhật thất bại');
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setBusyId(toDelete.id);
    try {
      if (toDelete.kind === 'post') {
        await deletePost(toDelete.id);
        setPosts((prev) => prev.filter((r) => r.id !== toDelete.id));
      } else if (toDelete.kind === 'comment') {
        await deleteComment(toDelete.id);
        setComments((prev) => prev.filter((r) => r.id !== toDelete.id));
      }
      setToDelete(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Xóa thất bại');
    } finally {
      setBusyId(null);
    }
  };

  const TABS: { key: Tab; label: string; icon: React.ComponentType<{ className?: string }>; count: number }[] = [
    { key: 'posts', label: 'Bài viết', icon: FileText, count: posts.length },
    { key: 'comments', label: 'Bình luận', icon: MessageSquare, count: comments.length },
  ];

  return (
    <div>
      <PanelHeader
        title="Kiểm duyệt nội dung"
        description="Ẩn, gắn cờ hoặc gỡ bài viết và bình luận"
      />

      <div className="flex gap-2 mb-5 flex-wrap">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                tab === t.key
                  ? 'bg-[#1B2C40] text-white'
                  : 'bg-white text-[#1B2C40]/60 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label} ({t.count})
            </button>
          );
        })}
      </div>

      {error && (
        <div className="mb-4 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-4 py-2">
          {error}
        </div>
      )}

      <AdminCard className="overflow-hidden">
        {loading ? (
          <LoadingBlock />
        ) : tab === 'posts' ? (
          posts.length === 0 ? (
            <EmptyBlock label="Chưa có bài viết" />
          ) : (
            <div className="divide-y divide-gray-50">
              {posts.map((row) => (
                <div key={row.id} className="p-4 hover:bg-rose-50/20 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <StatusBadge status={row.status} />
                        <span className="text-[11px] text-[#1B2C40]/50">
                          {author(row.user_id)} · {formatDate(row.created_at)}
                        </span>
                      </div>
                      <p className="font-semibold text-[#1B2C40] truncate">
                        {row.title || '(Không tiêu đề)'}
                      </p>
                      <p className="text-xs text-[#1B2C40]/60 line-clamp-2 mt-0.5">
                        {row.content}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {row.status === 'hidden' ? (
                        <AdminActionButton
                          variant="primary"
                          disabled={busyId === row.id}
                          onClick={() => setPStatus(row, 'published')}
                          title="Hiện lại"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </AdminActionButton>
                      ) : (
                        <AdminActionButton
                          variant="neutral"
                          disabled={busyId === row.id}
                          onClick={() => setPStatus(row, 'hidden')}
                          title="Ẩn"
                        >
                          <EyeOff className="w-3.5 h-3.5" />
                        </AdminActionButton>
                      )}
                      <AdminActionButton
                        variant="danger"
                        disabled={busyId === row.id}
                        onClick={() =>
                          setToDelete({
                            kind: 'post',
                            id: row.id,
                            label: row.title || '(Không tiêu đề)',
                          })
                        }
                        title="Xóa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </AdminActionButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          comments.length === 0 ? (
            <EmptyBlock label="Chưa có bình luận" />
          ) : (
            <div className="divide-y divide-gray-50">
              {comments.map((row) => (
                <div key={row.id} className="p-4 hover:bg-rose-50/20 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <StatusBadge status={row.status} />
                        <span className="text-[11px] text-[#1B2C40]/50">
                          {author(row.user_id)} · {formatDate(row.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-[#1B2C40]/80">{row.content}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {row.status !== 'flagged' && (
                        <AdminActionButton
                          variant="neutral"
                          disabled={busyId === row.id}
                          onClick={() => setCStatus(row, 'flagged')}
                          title="Gắn cờ"
                        >
                          <Flag className="w-3.5 h-3.5" />
                        </AdminActionButton>
                      )}
                      {row.status === 'hidden' ? (
                        <AdminActionButton
                          variant="primary"
                          disabled={busyId === row.id}
                          onClick={() => setCStatus(row, 'published')}
                          title="Hiện lại"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </AdminActionButton>
                      ) : (
                        <AdminActionButton
                          variant="neutral"
                          disabled={busyId === row.id}
                          onClick={() => setCStatus(row, 'hidden')}
                          title="Ẩn"
                        >
                          <EyeOff className="w-3.5 h-3.5" />
                        </AdminActionButton>
                      )}
                      <AdminActionButton
                        variant="danger"
                        disabled={busyId === row.id}
                        onClick={() =>
                          setToDelete({
                            kind: 'comment',
                            id: row.id,
                            label: 'bình luận này',
                          })
                        }
                        title="Xóa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </AdminActionButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </AdminCard>

      <ConfirmDialog
        open={!!toDelete}
        title="Xóa nội dung?"
        message={`Bạn sắp xóa ${toDelete?.label ?? ''}. Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
