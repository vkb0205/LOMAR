/**
 * Canonical shop locations transcribed from `address.md` / `Feedback Web.pdf`.
 *
 * `address.md` is the source for the names and addresses. The coordinates are
 * kept at seven decimal places so each marker is anchored to its own street
 * number instead of sharing one generic Hồ Văn Huê point. `aliases` keeps the
 * map location linked to catalog rows whose display name differs slightly.
 */
export interface FeedbackWebShop {
  id: string;
  name: string;
  aliases?: string[];
  category: string;
  address: string;
  lat: number;
  lng: number;
}

export const FEEDBACK_WEB_SHOPS: FeedbackWebShop[] = [
  {
    id: 'feedback-web-tuart-wedding',
    name: 'TuArt Wedding',
    category: 'Chụp ảnh',
    address: '147–149 Hồ Văn Huê',
    lat: 10.8033606,
    lng: 106.6768640,
  },
  {
    id: 'feedback-web-wins-studio',
    name: 'Win’s Studio',
    category: 'Studio',
    address: '204 Hồ Văn Huê',
    lat: 10.8008720,
    lng: 106.6757200,
  },
  {
    id: 'feedback-web-sago-wedding',
    name: 'Sago Wedding',
    category: 'Chụp ảnh',
    address: '122 Hồ Văn Huê',
    lat: 10.8044210,
    lng: 106.6774730,
  },
  {
    id: 'feedback-web-ahihi-studio',
    name: 'Ahihi Studio',
    category: 'Studio',
    address: '170 Hồ Văn Huê',
    lat: 10.8023063,
    lng: 106.6764589,
  },
  {
    id: 'feedback-web-cem-bridal-studio',
    name: 'CEM Bridal Studio',
    category: 'Váy cưới',
    address: '123 Hồ Văn Huê',
    lat: 10.8043790,
    lng: 106.6774257,
  },
  {
    id: 'feedback-web-rin-wedding',
    name: 'Rin Wedding',
    category: 'Chụp ảnh',
    address: '206 Hồ Văn Huê',
    lat: 10.8007870,
    lng: 106.6756800,
  },
  {
    id: 'feedback-web-cua-hang-ao-cuoi-1-nha',
    name: 'Cửa Hàng Áo Cưới 1 Nhà',
    category: 'Váy cưới',
    address: '111–113 Hồ Văn Huê',
    lat: 10.8048000,
    lng: 106.6776600,
  },
  {
    id: 'feedback-web-jessica-bridal',
    name: 'Jessica Bridal',
    category: 'Váy cưới',
    address: '109 Hồ Văn Huê',
    lat: 10.8049700,
    lng: 106.6777600,
  },
  {
    id: 'feedback-web-nancypham-bridal',
    name: 'NancyPham Bridal',
    aliases: ['NancyPham Wedding & Studio'],
    category: 'Váy cưới',
    address: '136 Hồ Văn Huê',
    lat: 10.8038700,
    lng: 106.6771700,
  },
  {
    id: 'feedback-web-studio-tri-nguyen',
    name: 'Studio Trí Nguyễn',
    category: 'Studio',
    address: '160 Hồ Văn Huê',
    lat: 10.8027300,
    lng: 106.6767200,
  },
  {
    id: 'feedback-web-bonjour-studio',
    name: 'Bonjour Studio',
    category: 'Studio',
    address: '150 Hồ Văn Huê',
    lat: 10.8032300,
    lng: 106.6768700,
  },
  {
    id: 'feedback-web-phat-pro-studio',
    name: 'Phat Pro Studio',
    category: 'Studio',
    address: '137 Hồ Văn Huê',
    lat: 10.8038300,
    lng: 106.6771200,
  },
  {
    id: 'feedback-web-phindump-wedding',
    name: 'Phindump Wedding',
    category: 'Chụp ảnh',
    address: '112A Hồ Văn Huê',
    lat: 10.8047600,
    lng: 106.6776400,
  },
  {
    id: 'feedback-web-2h-studio',
    name: '2H Studio',
    category: 'Studio',
    address: '85–87 Hồ Văn Huê',
    lat: 10.8059800,
    lng: 106.6783000,
  },
  {
    id: 'feedback-web-ngoi-sao',
    name: 'Chụp Hình Cưới Ngôi Sao',
    category: 'Chụp ảnh',
    address: '39 Hồ Văn Huê',
    lat: 10.8079300,
    lng: 106.6793000,
  },
  {
    id: 'feedback-web-tymie-bridal',
    name: 'TYMIE Bridal',
    category: 'Váy cưới',
    address: '117 Hồ Văn Huê',
    lat: 10.8046329,
    lng: 106.6775681,
  },
  {
    id: 'feedback-web-duc-studio',
    name: 'Đức Studio',
    category: 'Studio',
    address: '230 Hồ Văn Huê',
    lat: 10.7997700,
    lng: 106.6751300,
  },
  {
    id: 'feedback-web-helen-nguyen-studio',
    name: 'Helen Nguyễn Studio',
    category: 'Trang điểm',
    address: '118 Hồ Văn Huê',
    lat: 10.8045900,
    lng: 106.6775450,
  },
  {
    id: 'feedback-web-ktiu-luxury',
    name: 'KTIU Luxury',
    aliases: ['Ktiu Studio / Ktiu Luxury'],
    category: 'Váy cưới',
    address: '152–156 Hồ Văn Huê',
    lat: 10.8029778,
    lng: 106.6768535,
  },
  {
    id: 'feedback-web-thien-duong',
    name: 'Công ty Áo Cưới Thiên Đường',
    category: 'Váy cưới',
    address: '124 Hồ Văn Huê',
    lat: 10.8043370,
    lng: 106.6773970,
  },
];
