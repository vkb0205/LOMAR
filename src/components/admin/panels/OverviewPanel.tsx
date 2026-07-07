import React, { useEffect, useState } from 'react';
import {
  Users,
  Store,
  Package,
  FileText,
  Inbox,
  Sparkles,
  AlertTriangle,
  Flag,
} from 'lucide-react';
import { fetchPlatformMetrics, PlatformMetrics } from '../../../lib/admin';
import { PanelHeader, AdminCard, LoadingBlock } from '../ui';

interface StatDef {
  key: keyof PlatformMetrics;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  sub?: { key: keyof PlatformMetrics; label: string; warn?: boolean };
}

const STATS: StatDef[] = [
  {
    key: 'users',
    label: 'Người dùng',
    icon: Users,
  },
  {
    key: 'vendors',
    label: 'Nhà cung cấp',
    icon: Store,
    sub: { key: 'vendorsPending', label: 'chờ duyệt', warn: true },
  },
  {
    key: 'services',
    label: 'Dịch vụ',
    icon: Package,
  },
  {
    key: 'posts',
    label: 'Bài viết',
    icon: FileText,
    sub: { key: 'postsHidden', label: 'đã ẩn', warn: true },
  },
  {
    key: 'leads',
    label: 'Yêu cầu dịch vụ',
    icon: Inbox,
    sub: { key: 'leadsNew', label: 'mới', warn: false },
  },
  {
    key: 'generations',
    label: 'Lượt tạo AI',
    icon: Sparkles,
    sub: { key: 'generationsFailed', label: 'thất bại', warn: true },
  },
];

export default function OverviewPanel() {
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const m = await fetchPlatformMetrics();
        if (active) setMetrics(m);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Không tải được số liệu');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div>
      <PanelHeader
        title="Tổng quan hệ thống"
        description="Số liệu toàn nền tảng theo thời gian thực"
      />

      {loading ? (
        <LoadingBlock />
      ) : error ? (
        <AdminCard className="p-6 text-sm text-rose-600">{error}</AdminCard>
      ) : metrics ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {STATS.map((stat) => {
              const Icon = stat.icon;
              const value = metrics[stat.key];
              const subValue = stat.sub ? metrics[stat.sub.key] : null;
              return (
                <AdminCard key={stat.key} className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[#1B2C40]/50">
                        {stat.label}
                      </p>
                      <p className="text-3xl font-serif font-bold text-[#1B2C40] mt-2">
                        {value.toLocaleString('vi-VN')}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-[#F2BFC8]">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  {stat.sub && subValue !== null && subValue > 0 && (
                    <div
                      className={`mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold px-2 py-1 rounded-full ${
                        stat.sub.warn
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-blue-50 text-blue-700'
                      }`}
                    >
                      {stat.sub.warn && <AlertTriangle className="w-3 h-3" />}
                      {subValue.toLocaleString('vi-VN')} {stat.sub.label}
                    </div>
                  )}
                </AdminCard>
              );
            })}
          </div>

          {/* Moderation attention row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <AdminCard className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500">
                <Flag className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-serif font-bold text-[#1B2C40]">
                  {metrics.commentsFlagged.toLocaleString('vi-VN')}
                </p>
                <p className="text-xs font-bold uppercase tracking-wider text-[#1B2C40]/50">
                  Bình luận bị gắn cờ
                </p>
              </div>
            </AdminCard>
            <AdminCard className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500">
                <Flag className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-serif font-bold text-[#1B2C40]">
                  {metrics.reviewsFlagged.toLocaleString('vi-VN')}
                </p>
                <p className="text-xs font-bold uppercase tracking-wider text-[#1B2C40]/50">
                  Đánh giá bị gắn cờ
                </p>
              </div>
            </AdminCard>
          </div>
        </>
      ) : null}
    </div>
  );
}
