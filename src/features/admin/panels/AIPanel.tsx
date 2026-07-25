import React, { useEffect, useState, useCallback } from 'react';
import { Sparkles, ImageOff } from 'lucide-react';
import { fetchGenerations, fetchProfileNames } from '../services/adminService';
import { Database } from '../../../shared/types/database';
import {
  PanelHeader,
  AdminCard,
  LoadingBlock,
  EmptyBlock,
  StatusBadge,
  FilterSelect,
  formatDate,
} from '../components/ui';

type GenerationRow = Database['public']['Tables']['ai_design_generations']['Row'];

export default function AIPanel() {
  const [rows, setRows] = useState<GenerationRow[]>([]);
  const [names, setNames] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchGenerations();
      setRows(data);
      setNames(await fetchProfileNames(data.map((r) => r.user_id)));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không tải được dữ liệu AI');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const author = (userId: string) => names.get(userId) || userId.slice(0, 8);
  const visible =
    filter === 'all' ? rows : rows.filter((r) => r.status === filter);

  return (
    <div>
      <PanelHeader
        title="Giám sát AI"
        description="Theo dõi các lượt tạo hình ảnh AI, chi phí và lỗi (chỉ đọc)"
        right={
          <FilterSelect
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'all', label: 'Tất cả' },
              { value: 'queued', label: 'Đang chờ' },
              { value: 'running', label: 'Đang chạy' },
              { value: 'succeeded', label: 'Thành công' },
              { value: 'failed', label: 'Thất bại' },
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
          <EmptyBlock label="Không có lượt tạo AI nào" />
        </AdminCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map((row) => (
            <AdminCard key={row.id} className="overflow-hidden">
              <div className="aspect-video bg-gray-100 flex items-center justify-center overflow-hidden">
                {row.output_image_url ? (
                  <img
                    src={row.output_image_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center text-[#1B2C40]/30">
                    <ImageOff className="w-8 h-8 mb-1" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      Không có ảnh
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <StatusBadge status={row.status} />
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#1B2C40]/40">
                    <Sparkles className="w-3 h-3 text-[#F2BFC8]" />
                    {row.model_name}
                  </span>
                </div>
                <p className="text-xs text-[#1B2C40]/70 line-clamp-2 mb-2">
                  {row.prompt}
                </p>
                {row.error_message && (
                  <p className="text-[11px] text-rose-600 bg-rose-50 rounded-lg px-2 py-1 mb-2 line-clamp-2">
                    {row.error_message}
                  </p>
                )}
                <div className="flex items-center justify-between text-[10px] text-[#1B2C40]/40 font-medium">
                  <span>{author(row.user_id)}</span>
                  <span>{formatDate(row.created_at)}</span>
                </div>
                {row.cost_estimate != null && (
                  <p className="text-[10px] text-[#1B2C40]/40 mt-1">
                    Chi phí ước tính: {row.cost_estimate}
                  </p>
                )}
              </div>
            </AdminCard>
          ))}
        </div>
      )}
    </div>
  );
}
