import React, { useEffect, useState, useCallback } from 'react';
import { Calendar, Wallet } from 'lucide-react';
import {
  fetchServiceRequests,
  updateServiceRequestStatus,
  fetchProfileNames,
} from '../../../lib/admin';
import { Database } from '../../../types/database';
import {
  PanelHeader,
  AdminCard,
  LoadingBlock,
  EmptyBlock,
  StatusBadge,
  FilterSelect,
  formatDate,
} from '../ui';

type ServiceRequestRow = Database['public']['Tables']['service_requests']['Row'];
type LeadStatus =
  | 'new'
  | 'contacted'
  | 'quoted'
  | 'booked'
  | 'cancelled'
  | 'closed';

const STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: 'new', label: 'Mới' },
  { value: 'contacted', label: 'Đã liên hệ' },
  { value: 'quoted', label: 'Đã báo giá' },
  { value: 'booked', label: 'Đã đặt' },
  { value: 'cancelled', label: 'Đã hủy' },
  { value: 'closed', label: 'Đã đóng' },
];

export default function LeadsPanel() {
  const [rows, setRows] = useState<ServiceRequestRow[]>([]);
  const [names, setNames] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchServiceRequests();
      setRows(data);
      setNames(await fetchProfileNames(data.map((r) => r.user_id)));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không tải được yêu cầu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const changeStatus = async (row: ServiceRequestRow, status: LeadStatus) => {
    setBusyId(row.id);
    try {
      await updateServiceRequestStatus(row.id, status);
      setRows((prev) =>
        prev.map((r) => (r.id === row.id ? { ...r, status } : r))
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Cập nhật thất bại');
    } finally {
      setBusyId(null);
    }
  };

  const author = (userId: string) => names.get(userId) || userId.slice(0, 8);
  const visible =
    filter === 'all' ? rows : rows.filter((r) => r.status === filter);

  const budget = (row: ServiceRequestRow) => {
    if (row.budget_min == null && row.budget_max == null) return null;
    const min = row.budget_min?.toLocaleString('vi-VN');
    const max = row.budget_max?.toLocaleString('vi-VN');
    if (min && max) return `${min} – ${max}₫`;
    return `${min || max}₫`;
  };

  return (
    <div>
      <PanelHeader
        title="Yêu cầu dịch vụ"
        description="Theo dõi và cập nhật trạng thái các yêu cầu từ khách hàng"
        right={
          <FilterSelect
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'all', label: 'Tất cả trạng thái' },
              ...STATUS_OPTIONS,
            ]}
          />
        }
      />

      {error && (
        <div className="mb-4 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-4 py-2">
          {error}
        </div>
      )}

      {loading ? (
        <AdminCard>
          <LoadingBlock />
        </AdminCard>
      ) : visible.length === 0 ? (
        <AdminCard>
          <EmptyBlock label="Không có yêu cầu nào" />
        </AdminCard>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {visible.map((row) => (
            <AdminCard key={row.id} className="p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="font-semibold text-[#1B2C40]">
                    {author(row.user_id)}
                  </p>
                  <p className="text-[11px] text-[#1B2C40]/50">
                    {formatDate(row.created_at)}
                  </p>
                </div>
                <StatusBadge status={row.status} />
              </div>

              {row.message && (
                <p className="text-sm text-[#1B2C40]/70 mb-3 line-clamp-3">
                  {row.message}
                </p>
              )}

              <div className="flex flex-wrap gap-3 text-xs text-[#1B2C40]/60 mb-4">
                {row.event_date && (
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(row.event_date)}
                  </span>
                )}
                {budget(row) && (
                  <span className="inline-flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5" />
                    {budget(row)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#1B2C40]/40">
                  Trạng thái
                </label>
                <select
                  value={row.status}
                  disabled={busyId === row.id}
                  onChange={(e) =>
                    changeStatus(row, e.target.value as LeadStatus)
                  }
                  className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-[#1B2C40] outline-none focus:border-[#F2BFC8] bg-white cursor-pointer disabled:opacity-50"
                >
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </AdminCard>
          ))}
        </div>
      )}
    </div>
  );
}
