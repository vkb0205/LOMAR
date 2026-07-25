import { Building2, Flower2, Heart, HeartHandshake, Landmark, Navigation } from 'lucide-react';
import type { HomeJourneyStop, HomeMilestone, HomePillar } from './types';
import { BouquetIcon, CameraIcon, DressIcon, GiftBoxIcon, HealthIcon, MakeupIcon, RingsIcon } from './components/HomeIcons';

export const journeyStops: HomeJourneyStop[] = [
  { title: 'THỜI TRANG', icon: DressIcon, to: '/explore?category=Váy Cưới' },
  { title: 'MAKEUP &\nLÀM ĐẸP', icon: MakeupIcon, to: '/explore?category=Make Up' },
  { title: 'CHỤP ẢNH\nSTUDIO', icon: CameraIcon, to: '/explore?category=Studio' },
  { title: 'TRANG SỨC', icon: RingsIcon, to: '/explore?category=Trang Sức' },
  { title: 'QUÀ TẶNG &\nPHỤ KIỆN', icon: GiftBoxIcon, to: '/explore?category=Thiệp Cưới' },
  { title: 'QUÀ TẶNG &\nPHỤ KIỆN', icon: BouquetIcon, to: '/explore?category=Trang Trí' },
  { title: 'Y TẾ', icon: HealthIcon, to: '/explore?category=Sức Khỏe' },
];

export const storyPillars: HomePillar[] = [
  {
    title: 'NGHĨA TÌNH',
    desc: 'Gắn kết cộng đồng,\nlan tỏa những giá trị tốt đẹp\ntrong văn hóa cưới Việt.',
    img: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&q=80&w=400',
    icon: HeartHandshake,
    color: 'text-[#1e4696]',
  },
  {
    title: 'VĂN MINH',
    desc: 'Chuẩn hóa dịch vụ cưới,\nnâng tầm trải nghiệm\ncho các cặp đôi.',
    img: 'https://images.unsplash.com/photo-1542042161784-26ab9e041e89?auto=format&fit=crop&q=80&w=400',
    icon: Landmark,
    color: 'text-[#1e4696]',
  },
  {
    title: 'HIỆN ĐẠI',
    desc: 'Ứng dụng công nghệ,\ncá nhân hóa hành trình cưới\ntiện lợi và đầy cảm hứng.',
    img: 'https://images.unsplash.com/photo-1512418490979-92798cec1380?auto=format&fit=crop&q=80&w=400',
    icon: Navigation,
    color: 'text-[#3e649b]',
  },
  {
    title: 'HẠNH PHÚC',
    desc: 'Tất cả hướng đến một điều:\nviết nên những khoảnh khắc\ntrọn vẹn và đáng nhớ.',
    img: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&q=80&w=400',
    icon: Heart,
    color: 'text-[#5a96c3]',
  },
];

export const developmentMilestones: HomeMilestone[] = [
  { year: '1960+', title: 'Hình thành\nvà phát triển\nkhu vực', icon: Landmark },
  { year: '1990+', title: 'Thiên đường\náo cưới và dịch vụ\ncưới đầu tiên', icon: Flower2 },
  { year: '2010+', title: 'Nâng tầm chất lượng\ndịch vụ, đa dạng\ntrải nghiệm', icon: Building2 },
  { year: '2024+', title: 'Ra mắt hệ sinh thái\n"Phố Hạnh Phúc\nHồ Văn Huê"', icon: HeartHandshake },
];
