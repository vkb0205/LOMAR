import React, { useEffect, useState, useCallback } from 'react';
import { Trash2, ShieldCheck } from 'lucide-react';
import {
  fetchProfiles,
  updateProfileRole,
  deleteProfile,
  AccountRole,
} from '../services/adminService';
import { Database } from '../../../shared/types/database';
import { useAuth } from '../../auth/hooks/useAuth';
import {
  PanelHeader,
  AdminCard,
  LoadingBlock,
  EmptyBlock,
  AdminActionButton,
  SearchInput,
  ConfirmDialog,
  formatDate,
  shortId,
} from '../components/ui';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

const ROLE_OPTIONS: { value: AccountRole; label: string }[] = [
  { value: 'customer', label: 'Khách hàng' },
  { value: 'vendor', label: 'Nhà cung cấp' },
  { value: 'admin', label: 'Quản trị' },
];

export default function UsersPanel() {
  const { user: currentUser } = useAuth();
  const [rows, setRows] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<ProfileRow | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (term?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProfiles(term);
      setRows(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không tải được danh sách');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSearch = (v: string) => {
    setSearch(v);
  };

  useEffect(() => {
    const t = setTimeout(() => load(search), 300);
    return () => clearTimeout(t);
  }, [search, load]);

  const changeRole = async (row: ProfileRow, role: AccountRole) => {
    setBusyId(row.id);
    try {
      await updateProfileRole(row.id, role);
      setRows((prev) =>
        prev.map((r) => (r.id === row.id ? { ...r, role } : r))
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
      await deleteProfile(toDelete.id);
      setRows((prev) => prev.filter((r) => r.id !== toDelete.id));
      setToDelete(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Xóa thất bại');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <PanelHeader
        title="Quản lý người dùng"
        description="Tìm kiếm, phân quyền và xóa tài khoản"
        right={
          <SearchInput
            value={search}
            onChange={handleSearch}
            placeholder="Tên, username, email..."
          />
        }
      />

      {error && (
        <div className="mb-4 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-4 py-2">
          {error}
        </div>
      )}

      <AdminCard className="overflow-hidden">
        {loading ? (
          <LoadingBlock />
        ) : rows.length === 0 ? (
          <EmptyBlock label="Không tìm thấy người dùng" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wider text-[#1B2C40]/40 border-b border-gray-100">
                  <th className="px-4 py-3 font-bold">Người dùng</th>
                  <th className="px-4 py-3 font-bold">Email</th>
                  <th className="px-4 py-3 font-bold">Quyền</th>
                  <th className="px-4 py-3 font-bold">Ngày tạo</th>
                  <th className="px-4 py-3 font-bold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const isSelf = currentUser?.id === row.id;
                  return (
                    <tr
                      key={row.id}
                      className="border-b border-gray-50 hover:bg-rose-50/20 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#1B2C40] text-white flex items-center justify-center text-xs font-bold overflow-hidden shrink-0">
                            {row.avatar_url ? (
                              <img
                                src={row.avatar_url}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              (row.full_name || row.username || '?')
                                .charAt(0)
                                .toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-[#1B2C40] truncate">
                              {row.full_name || row.username || 'Chưa đặt tên'}
                              {isSelf && (
                                <span className="ml-1.5 text-[9px] text-[#F2BFC8] font-bold uppercase">
                                  (bạn)
                                </span>
                              )}
                            </p>
                            <p className="text-[10px] text-[#1B2C40]/40 font-mono">
                              {shortId(row.id)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[#1B2C40]/70">
                        {row.email || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={row.role}
                          disabled={busyId === row.id || isSelf}
                          onChange={(e) =>
                            changeRole(row, e.target.value as AccountRole)
                          }
                          className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-[#1B2C40] outline-none focus:border-[#F2BFC8] bg-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {ROLE_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-[#1B2C40]/60 text-xs">
                        {formatDate(row.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {row.role === 'admin' && (
                            <span className="text-indigo-500" title="Quản trị viên">
                              <ShieldCheck className="w-4 h-4" />
                            </span>
                          )}
                          <AdminActionButton
                            variant="danger"
                            disabled={busyId === row.id || isSelf}
                            onClick={() => setToDelete(row)}
                            title={isSelf ? 'Không thể xóa chính mình' : 'Xóa'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </AdminActionButton>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      <ConfirmDialog
        open={!!toDelete}
        title="Xóa người dùng?"
        message={`Bạn sắp xóa tài khoản "${
          toDelete?.full_name || toDelete?.username || toDelete?.email || ''
        }". Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
