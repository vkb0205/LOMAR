import type { LucideIcon } from 'lucide-react';
import { Activity, Camera, Layers, MapPin } from 'lucide-react';

export const DASHBOARD_STATION_IDS = ['T01', 'T02', 'T03', 'T04'] as const;

export type DashboardStationId = (typeof DASHBOARD_STATION_IDS)[number];

export interface DashboardStation {
  id: DashboardStationId;
  name: string;
  category: string;
  description: string;
  icon: LucideIcon;
  color: string;
  bgGradient: string;
  badgeBg: string;
  ctaText: string;
  ctaLink: string;
}

export const DASHBOARD_STATIONS: DashboardStation[] = [
  {
    id: 'T01',
    name: 'Sức Khỏe',
    category: 'Khám Sức Khỏe',
    description: 'Chăm sóc sức khỏe tiền hôn nhân là viên gạch đầu tiên xây dựng tổ ấm vững bền.',
    icon: Activity,
    color: 'text-emerald-500',
    bgGradient: 'from-emerald-50 to-teal-50/30',
    badgeBg: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
    ctaText: 'Xem Gói Dịch Vụ',
    ctaLink: '/services',
  },
  {
    id: 'T02',
    name: 'Tình Yêu',
    category: 'Studio',
    description: 'Lưu giữ những thước phim, khung hình kỷ niệm ngọt ngào trước thềm lễ cưới.',
    icon: Camera,
    color: 'text-rose-500',
    bgGradient: 'from-rose-50 to-pink-50/30',
    badgeBg: 'bg-rose-50 text-rose-600 border border-rose-100',
    ctaText: 'Bắt Đầu Thiết Kế',
    ctaLink: '/ai-consultant',
  },
  {
    id: 'T03',
    name: 'Sắc Đẹp',
    category: 'Váy Cưới / Vest',
    description: 'Khoác lên mình bộ trang phục may đo độc bản, lộng lẫy và hoàn hảo nhất.',
    icon: Layers,
    color: 'text-purple-500',
    bgGradient: 'from-purple-50 to-indigo-50/30',
    badgeBg: 'bg-purple-50 text-purple-600 border border-purple-100',
    ctaText: 'Tự Tay Thiết Kế',
    ctaLink: '/ai-consultant',
  },
  {
    id: 'T04',
    name: 'Hạnh Phúc',
    category: 'Venue',
    description: 'Tìm kiếm không gian sảnh tiệc ấm cúng, sang trọng cho ngày trọng đại nhất.',
    icon: MapPin,
    color: 'text-amber-500',
    bgGradient: 'from-amber-50 to-orange-50/30',
    badgeBg: 'bg-amber-50 text-amber-600 border border-amber-100',
    ctaText: 'Thiết Kế Sảnh Tiệc',
    ctaLink: '/ai-consultant',
  },
];

export const HEALTH_CHECK_TASK_ID: DashboardStationId = 'T01';
