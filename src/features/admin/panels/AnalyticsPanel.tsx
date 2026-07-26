import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Clock3,
  Eye,
  Gauge,
  MousePointerClick,
  RefreshCw,
  Route,
  Users,
} from 'lucide-react';
import {
  BehaviourKey,
  fetchWebsiteAnalytics,
  WebsiteAnalytics,
} from '../../analytics/services/analyticsService';
import {
  AdminActionButton,
  AdminCard,
  FilterSelect,
  LoadingBlock,
  PanelHeader,
} from '../components/ui';

const PERIOD_OPTIONS = [
  { value: '7', label: '7 ngày qua' },
  { value: '30', label: '30 ngày qua' },
  { value: '90', label: '90 ngày qua' },
];

const BEHAVIOUR_RULES: Record<
  BehaviourKey,
  { label: string; description: string; color: string }
> = {
  high_intent: {
    label: 'Ý định cao',
    description: 'Đã xem Tùy chỉnh, AI Consultant hoặc trang nhà cung cấp.',
    color: 'bg-emerald-500',
  },
  engaged: {
    label: 'Tương tác tốt',
    description: 'Ít nhất 3 lượt xem hoặc tổng thời gian từ 60 giây.',
    color: 'bg-blue-500',
  },
  quick_exit: {
    label: 'Thoát nhanh',
    description: 'Chỉ xem 1 trang và tương tác dưới 10 giây.',
    color: 'bg-rose-500',
  },
  casual: {
    label: 'Xem thông thường',
    description: 'Không thỏa các luật có độ ưu tiên cao hơn.',
    color: 'bg-amber-400',
  },
};

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)} giây`;
  const minutes = Math.floor(seconds / 60);
  const rest = Math.round(seconds % 60);
  return `${minutes} phút ${rest.toString().padStart(2, '0')} giây`;
}

function DailyChart({ data }: { data: WebsiteAnalytics['daily'] }) {
  const max = Math.max(1, ...data.map((item) => item.views));
  const points = data
    .map((item, index) => {
      const x = data.length <= 1 ? 50 : (index / (data.length - 1)) * 100;
      const y = 36 - (item.views / max) * 32;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="h-44 w-full">
      {data.length === 0 ? (
        <div className="h-full flex items-center justify-center text-xs text-[#1B2C40]/40">
          Chưa có dữ liệu truy cập
        </div>
      ) : (
        <>
          <svg
            viewBox="0 0 100 40"
            preserveAspectRatio="none"
            className="w-full h-36 overflow-visible"
            role="img"
            aria-label="Lượt xem theo ngày"
          >
            <defs>
              <linearGradient id="analyticsArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F2BFC8" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#F2BFC8" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon
              points={`0,40 ${points} 100,40`}
              fill="url(#analyticsArea)"
            />
            <polyline
              points={points}
              fill="none"
              stroke="#1B2C40"
              strokeWidth="1.25"
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="flex justify-between text-[10px] text-[#1B2C40]/45">
            <span>{new Date(data[0].day).toLocaleDateString('vi-VN')}</span>
            <span>{new Date(data[data.length - 1].day).toLocaleDateString('vi-VN')}</span>
          </div>
        </>
      )}
    </div>
  );
}

export default function AnalyticsPanel() {
  const [days, setDays] = useState(30);
  const [analytics, setAnalytics] = useState<WebsiteAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setAnalytics(await fetchWebsiteAnalytics(days));
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : 'Không tải được dữ liệu truy cập.'
      );
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    void load();
  }, [load]);

  const behaviourCounts = useMemo(() => {
    const counts = new Map<BehaviourKey, number>();
    for (const item of analytics?.behaviours ?? []) {
      counts.set(item.behaviour, item.sessions);
    }
    return counts;
  }, [analytics]);

  return (
    <div>
      <PanelHeader
        title="Lượt truy cập website"
        description="Theo dõi hiệu suất từng trang và phân nhóm hành vi dựa trên luật."
        right={
          <>
            <FilterSelect
              value={String(days)}
              onChange={(value) => setDays(Number(value))}
              options={PERIOD_OPTIONS}
            />
            <AdminActionButton onClick={() => void load()} disabled={loading}>
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Làm mới
            </AdminActionButton>
          </>
        }
      />

      {loading && !analytics ? (
        <LoadingBlock label="Đang tổng hợp dữ liệu truy cập..." />
      ) : error ? (
        <AdminCard className="p-6">
          <p className="text-sm font-semibold text-rose-600">
            Không tải được analytics
          </p>
          <p className="text-xs text-[#1B2C40]/60 mt-1">{error}</p>
          <p className="text-xs text-[#1B2C40]/50 mt-3">
            Hãy chạy supabase/legacy/add_website_analytics.sql trên Supabase.
          </p>
        </AdminCard>
      ) : analytics ? (
        <>
          <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
            {[
              {
                label: 'Lượt xem',
                value: analytics.summary.views.toLocaleString('vi-VN'),
                icon: Eye,
              },
              {
                label: 'Khách truy cập',
                value: analytics.summary.uniqueVisitors.toLocaleString('vi-VN'),
                icon: Users,
              },
              {
                label: 'Phiên truy cập',
                value: analytics.summary.sessions.toLocaleString('vi-VN'),
                icon: Route,
              },
              {
                label: 'Thời gian TB',
                value: formatDuration(analytics.summary.avgDurationSeconds),
                icon: Clock3,
              },
              {
                label: 'Tỷ lệ thoát nhanh',
                value: `${analytics.summary.bounceRate.toLocaleString('vi-VN')}%`,
                icon: Gauge,
              },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <AdminCard key={stat.label} className="p-4">
                  <div className="flex items-center gap-2 text-[#1B2C40]/50">
                    <Icon className="w-4 h-4" />
                    <p className="text-[10px] font-bold uppercase tracking-wider">
                      {stat.label}
                    </p>
                  </div>
                  <p className="mt-2 text-xl font-serif font-bold text-[#1B2C40]">
                    {stat.value}
                  </p>
                </AdminCard>
              );
            })}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 mt-4">
            <AdminCard className="p-5 xl:col-span-3">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-4 h-4 text-[#F2BFC8]" />
                <h2 className="font-serif font-bold text-[#1B2C40]">
                  Xu hướng lượt xem
                </h2>
              </div>
              <DailyChart data={analytics.daily} />
            </AdminCard>

            <AdminCard className="p-5 xl:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <MousePointerClick className="w-4 h-4 text-[#F2BFC8]" />
                <h2 className="font-serif font-bold text-[#1B2C40]">
                  Rule-based behaviour
                </h2>
              </div>
              <div className="space-y-4">
                {(Object.keys(BEHAVIOUR_RULES) as BehaviourKey[]).map((key) => {
                  const rule = BEHAVIOUR_RULES[key];
                  const count = behaviourCounts.get(key) ?? 0;
                  const percent =
                    analytics.summary.sessions > 0
                      ? (count / analytics.summary.sessions) * 100
                      : 0;
                  return (
                    <div key={key}>
                      <div className="flex justify-between gap-3 text-xs">
                        <div>
                          <span className="font-bold text-[#1B2C40]">
                            {rule.label}
                          </span>
                          <p className="text-[10px] leading-relaxed text-[#1B2C40]/50 mt-0.5">
                            {rule.description}
                          </p>
                        </div>
                        <span className="font-bold text-[#1B2C40] whitespace-nowrap">
                          {count.toLocaleString('vi-VN')} ({percent.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${rule.color}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-[#1B2C40]/40 border-t border-gray-100 mt-4 pt-3">
                Ưu tiên luật: Ý định cao → Tương tác tốt → Thoát nhanh → Xem thông thường.
                Mỗi phiên chỉ thuộc một nhóm.
              </p>
            </AdminCard>
          </div>

          <AdminCard className="mt-4 overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-serif font-bold text-[#1B2C40]">
                Lượng truy cập theo từng trang
              </h2>
              <p className="text-xs text-[#1B2C40]/50 mt-1">
                Sắp xếp theo tổng lượt xem trong khoảng thời gian đã chọn.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] uppercase tracking-wider text-[#1B2C40]/45 border-b border-gray-100">
                    <th className="px-5 py-3">Trang</th>
                    <th className="px-4 py-3 text-right">Lượt xem</th>
                    <th className="px-4 py-3 text-right">Khách</th>
                    <th className="px-4 py-3 text-right">Thời gian TB</th>
                    <th className="px-5 py-3 text-right">Cuộn TB</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.pages.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-5 py-12 text-center text-xs text-[#1B2C40]/40"
                      >
                        Chưa có lượt truy cập trong khoảng thời gian này.
                      </td>
                    </tr>
                  ) : (
                    analytics.pages.map((page) => (
                      <tr
                        key={page.page_path}
                        className="border-b border-gray-50 last:border-0 text-sm"
                      >
                        <td className="px-5 py-3">
                          <p className="font-semibold text-[#1B2C40]">
                            {page.page_title || page.page_path}
                          </p>
                          <p className="text-[10px] text-[#1B2C40]/45 mt-0.5">
                            {page.page_path}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-[#1B2C40]">
                          {page.views.toLocaleString('vi-VN')}
                        </td>
                        <td className="px-4 py-3 text-right text-[#1B2C40]/70">
                          {page.unique_visitors.toLocaleString('vi-VN')}
                        </td>
                        <td className="px-4 py-3 text-right text-[#1B2C40]/70 whitespace-nowrap">
                          {formatDuration(page.avg_duration_seconds)}
                        </td>
                        <td className="px-5 py-3 text-right text-[#1B2C40]/70">
                          {page.avg_scroll_percent}%
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </AdminCard>
        </>
      ) : null}
    </div>
  );
}
