export interface MapChatMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  vendorIds?: string[];
  timestamp: Date;
}

export interface QuickReply {
  label: string;
  value: string;
}

export interface ChatStep {
  message: string;
  quickReplies?: QuickReply[];
  vendorIds?: string[];
}

export const chatSteps: Record<string, ChatStep> = {
  welcome: {
    message: 'Xin chào! Mình là Bé Song Hỷ — đồng hành cùng bạn trên Bản đồ Hạnh Phúc của phố Hồ Văn Huê. Mình sẽ hỏi nhanh về ngân sách, phong cách và ưu tiên rồi ghim các vendor phù hợp lên bản đồ.\n\nBạn muốn bắt đầu không?',
    quickReplies: [
      { label: 'Bắt đầu tư vấn', value: 'yes' },
      { label: 'Cho tôi xem vendor nổi bật', value: 'all' },
    ],
  },
  budget: {
    message: 'Trước hết, ngân sách bạn muốn dành cho váy cưới, chụp ảnh và styling nằm ở mức nào?',
    quickReplies: [
      { label: 'Tiết kiệm', value: 'budget' },
      { label: 'Tầm trung', value: 'mid' },
      { label: 'Cao cấp', value: 'luxury' },
    ],
  },
  style: {
    message: 'Phong cách tổng thể bạn thích là gì?',
    quickReplies: [
      { label: 'Tối giản hiện đại', value: 'modern' },
      { label: 'Lãng mạn nhiều hoa', value: 'romantic' },
      { label: 'Ảnh cưới editorial', value: 'photo' },
      { label: 'Sang trọng nổi bật', value: 'luxury' },
    ],
  },
  priorities: {
    message: 'Dịch vụ nào là ưu tiên chính để mình tối ưu tuyến ghé thăm?',
    quickReplies: [
      { label: 'Váy cưới', value: 'dress' },
      { label: 'Chụp ảnh', value: 'photo' },
      { label: 'Trang điểm', value: 'makeup' },
      { label: 'Lịch trọn gói', value: 'all' },
    ],
  },
  recommend_dress: {
    message: 'Mình đề xuất bắt đầu ở cụm 115-123 Hồ Văn Huê: Quyên Nguyễn Bridal cho váy cao cấp, TYMIE Bridal cho lựa chọn linh hoạt, rồi CEM Bridal Studio để so thêm phom tối giản. Mình đã ghim tuyến thử váy theo thứ tự trên bản đồ.',
    vendorIds: ['hvh-005', 'hvh-006', 'hvh-008'],
    quickReplies: [
      { label: 'Thêm chụp ảnh', value: 'add_photo' },
      { label: 'Thêm makeup', value: 'add_makeup' },
      { label: 'Lưu lịch này', value: 'save' },
    ],
  },
  recommend_photo: {
    message: 'Nếu ưu tiên hình ảnh, tuyến hợp lý là TuArt Wedding cho concept cao cấp, Gallery Bridal để xem gói ảnh kèm váy, sau đó Gia Hưng Studio cho album truyền thống. Route đã được vẽ từ vị trí của bạn tới từng điểm.',
    vendorIds: ['hvh-004', 'hvh-007', 'hvh-009'],
    quickReplies: [
      { label: 'Thêm váy cưới', value: 'add_dress' },
      { label: 'Thêm makeup', value: 'add_makeup' },
      { label: 'Lưu lịch này', value: 'save' },
    ],
  },
  recommend_makeup: {
    message: 'Để tối ưu chuẩn bị trong ngày, mình ghim Ahihi Studio và Vera Studio cho makeup, kèm TYMIE Bridal gần đầu tuyến 117 để thử váy trước khi makeup trial.',
    vendorIds: ['hvh-006', 'hvh-001', 'hvh-011'],
    quickReplies: [
      { label: 'Thêm chụp ảnh', value: 'add_photo' },
      { label: 'Thêm váy cao cấp', value: 'add_luxury' },
      { label: 'Lưu lịch này', value: 'save' },
    ],
  },
  recommend_all: {
    message: 'Mình đã tạo lịch tham khảo trọn tuyến Hồ Văn Huê: xuất phát từ vị trí của bạn, ghé Phat Pro/Nha để xem gói ảnh, lên cụm 170-168 cho makeup/hoa, rồi kết thúc ở cụm 147-115 cho váy và concept cao cấp.',
    vendorIds: ['hvh-012', 'hvh-002', 'hvh-011', 'hvh-001', 'hvh-010', 'hvh-004', 'hvh-008', 'hvh-006', 'hvh-005'],
    quickReplies: [
      { label: 'Tinh gọn còn 4 điểm', value: 'shortlist' },
      { label: 'Lưu itinerary', value: 'save' },
    ],
  },
  add_photo: {
    message: 'Mình thêm TuArt Wedding và Gia Hưng Studio vào lịch để bạn có hai mức lựa chọn ảnh cưới: editorial cao cấp và album truyền thống.',
    vendorIds: ['hvh-005', 'hvh-006', 'hvh-008', 'hvh-004', 'hvh-009'],
    quickReplies: [
      { label: 'Thêm makeup', value: 'add_makeup' },
      { label: 'Lưu lịch này', value: 'save' },
    ],
  },
  add_dress: {
    message: 'Mình thêm Quyên Nguyễn Bridal và CEM Bridal Studio để tuyến chụp ảnh có thêm hai điểm thử váy nổi bật gần nhau.',
    vendorIds: ['hvh-004', 'hvh-007', 'hvh-009', 'hvh-005', 'hvh-008'],
    quickReplies: [
      { label: 'Thêm makeup', value: 'add_makeup' },
      { label: 'Lưu lịch này', value: 'save' },
    ],
  },
  add_makeup: {
    message: 'Mình thêm Ahihi Studio và Vera Studio để bạn có điểm makeup trial trên tuyến, tiện ghép sau lịch thử váy hoặc chụp concept.',
    vendorIds: ['hvh-005', 'hvh-006', 'hvh-008', 'hvh-001', 'hvh-011'],
    quickReplies: [
      { label: 'Thêm ảnh cưới', value: 'add_photo' },
      { label: 'Lưu lịch này', value: 'save' },
    ],
  },
  add_luxury: {
    message: 'Mình ưu tiên các điểm cao cấp: Quyên Nguyễn Bridal, KTIU Luxury và TuArt Wedding. Đây là tuyến ngắn cho cặp đôi muốn tập trung vào váy và hình ảnh nổi bật.',
    vendorIds: ['hvh-005', 'hvh-003', 'hvh-004'],
    quickReplies: [
      { label: 'Thêm makeup', value: 'add_makeup' },
      { label: 'Lưu lịch này', value: 'save' },
    ],
  },
  shortlist: {
    message: 'Mình tinh gọn còn 4 điểm dễ đi nhất: Phat Pro Studio, Ahihi Studio, TuArt Wedding và Quyên Nguyễn Bridal. Tuyến này vẫn đủ ảnh, makeup, concept và váy cao cấp.',
    vendorIds: ['hvh-012', 'hvh-001', 'hvh-004', 'hvh-005'],
    quickReplies: [
      { label: 'Lưu itinerary', value: 'save' },
      { label: 'Bắt đầu lại', value: 'restart' },
    ],
  },
  save: {
    message: 'Mình đã lưu lựa chọn trên tab Lựa chọn của tôi. Bạn có thể bấm từng vendor để nhảy thẳng tới pin và xem số điện thoại, giờ mở cửa, specialty trong popup.',
    quickReplies: [
      { label: 'Bắt đầu lại', value: 'restart' },
      { label: 'Xem trọn tuyến', value: 'all' },
    ],
  },
  restart: {
    message: 'Được rồi, mình làm lại từ đầu. Bạn muốn bắt đầu bằng ngân sách nào?',
    quickReplies: [
      { label: 'Tiết kiệm', value: 'budget' },
      { label: 'Tầm trung', value: 'mid' },
      { label: 'Cao cấp', value: 'luxury' },
    ],
  },
};

export function getNextStep(currentStep: string, input: string): string {
  const lower = input.toLowerCase();

  if (lower.includes('all') || lower.includes('trọn') || lower.includes('tất cả')) return 'recommend_all';
  if (lower.includes('restart') || lower.includes('bắt đầu lại')) return 'restart';

  switch (currentStep) {
    case 'welcome':
      return lower.includes('vendor') ? 'recommend_all' : 'budget';
    case 'budget':
      return 'style';
    case 'style':
      return 'priorities';
    case 'priorities':
    case 'restart':
      if (lower.includes('photo') || lower.includes('ảnh') || lower.includes('chụp')) return 'recommend_photo';
      if (lower.includes('makeup') || lower.includes('trang điểm')) return 'recommend_makeup';
      if (lower.includes('dress') || lower.includes('váy')) return 'recommend_dress';
      return 'recommend_all';
    case 'recommend_dress':
    case 'recommend_photo':
    case 'recommend_makeup':
    case 'recommend_all':
    case 'add_photo':
    case 'add_dress':
    case 'add_makeup':
    case 'add_luxury':
    case 'shortlist':
      if (lower.includes('photo') || lower.includes('ảnh') || lower.includes('chụp')) return 'add_photo';
      if (lower.includes('dress') || lower.includes('váy')) return 'add_dress';
      if (lower.includes('makeup') || lower.includes('trang điểm')) return 'add_makeup';
      if (lower.includes('luxury') || lower.includes('cao cấp')) return 'add_luxury';
      if (lower.includes('short') || lower.includes('gọn') || lower.includes('4')) return 'shortlist';
      if (lower.includes('save') || lower.includes('lưu')) return 'save';
      return 'save';
    case 'save':
      return lower.includes('all') || lower.includes('tuyến') ? 'recommend_all' : 'restart';
    default:
      return 'budget';
  }
}
