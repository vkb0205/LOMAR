import { ShieldCheck } from 'lucide-react';
import LegalPageLayout, { type LegalSection } from './LegalPageLayout';

const sections: LegalSection[] = [
  {
    title: 'Phạm vi áp dụng',
    content: <p>Chính sách này giải thích cách Hạnh Phúc Tới Nơi (LOMAR) xử lý thông tin khi bạn truy cập website, tạo tài khoản, đăng nhập hoặc sử dụng các tính năng lập kế hoạch cưới, khám phá dịch vụ, cộng đồng và tư vấn AI.</p>,
  },
  {
    title: 'Thông tin chúng tôi thu thập',
    content: <><p>Tuỳ theo cách bạn sử dụng dịch vụ, chúng tôi có thể xử lý:</p><ul className="list-disc space-y-2 pl-5"><li>Thông tin tài khoản như họ tên, địa chỉ email, ảnh đại diện và mã định danh người dùng.</li><li>Nội dung bạn chủ động cung cấp, gồm kế hoạch cưới, bài đăng, bình luận và yêu cầu tư vấn.</li><li>Dữ liệu kỹ thuật cần thiết để vận hành và bảo vệ dịch vụ, như thông tin phiên đăng nhập và nhật ký lỗi.</li></ul></>,
  },
  {
    title: 'Dữ liệu từ Google',
    content: <><p>Khi bạn chọn “Đăng nhập với Google”, LOMAR chỉ yêu cầu các phạm vi cơ bản gồm <code className="mx-1 rounded bg-ink/5 px-1.5 py-0.5 text-xs text-ink">openid</code>, địa chỉ email và thông tin hồ sơ cơ bản (tên, ảnh đại diện). Chúng tôi dùng dữ liệu này để xác thực, tạo hoặc liên kết tài khoản và hiển thị hồ sơ của bạn trong ứng dụng.</p><p>LOMAR không yêu cầu quyền truy cập Google Drive, Danh bạ, Gmail, Lịch hoặc mật khẩu Google của bạn. Việc đăng nhập được xử lý thông qua Google OAuth và Supabase Auth.</p></>,
  },
  {
    title: 'Mục đích sử dụng',
    content: <ul className="list-disc space-y-2 pl-5"><li>Xác thực người dùng, duy trì phiên đăng nhập và bảo vệ tài khoản.</li><li>Cung cấp, cá nhân hoá và cải thiện các tính năng của LOMAR.</li><li>Phản hồi yêu cầu hỗ trợ, phát hiện lỗi, gian lận hoặc hành vi gây hại.</li><li>Tuân thủ nghĩa vụ pháp lý và thực thi các điều khoản sử dụng.</li></ul>,
  },
  {
    title: 'Lưu trữ và chia sẻ dữ liệu',
    content: <><p>Dữ liệu tài khoản và ứng dụng có thể được lưu trữ, xử lý bởi Supabase cùng các nhà cung cấp hạ tầng cần thiết để vận hành LOMAR. Chúng tôi không bán thông tin cá nhân của bạn.</p><p>Chúng tôi chỉ chia sẻ dữ liệu khi cần cung cấp dịch vụ, theo yêu cầu hợp pháp, để bảo vệ người dùng hoặc khi bạn đã đồng ý. Nhà cung cấp dịch vụ chỉ được xử lý dữ liệu cho mục đích vận hành đã xác định.</p></>,
  },
  {
    title: 'Phiên đăng nhập và bảo mật',
    content: <p>Trình duyệt lưu thông tin phiên cần thiết để duy trì trạng thái đăng nhập. LOMAR áp dụng các biện pháp kỹ thuật và tổ chức hợp lý để hạn chế truy cập trái phép, nhưng không hệ thống trực tuyến nào có thể bảo đảm an toàn tuyệt đối. Hãy đăng xuất khỏi thiết bị dùng chung và bảo vệ tài khoản Google của bạn.</p>,
  },
  {
    title: 'Lưu giữ và quyền của bạn',
    content: <><p>Chúng tôi lưu giữ thông tin trong thời gian cần thiết để cung cấp dịch vụ, bảo vệ hệ thống và đáp ứng nghĩa vụ pháp lý. Bạn có thể yêu cầu truy cập, chỉnh sửa hoặc xoá thông tin cá nhân của mình bằng cách liên hệ với chúng tôi.</p><p>Bạn cũng có thể thu hồi quyền truy cập của LOMAR trong phần bảo mật của Tài khoản Google. Việc thu hồi quyền sẽ ngăn đăng nhập mới qua Google nhưng không tự động xoá dữ liệu đã lưu trong LOMAR; hãy gửi yêu cầu xoá dữ liệu nếu bạn muốn thực hiện việc đó.</p></>,
  },
  {
    title: 'Liên hệ và cập nhật chính sách',
    content: <><p>Nếu có câu hỏi hoặc yêu cầu liên quan đến quyền riêng tư, hãy gửi email đến <a className="font-semibold text-rose-deep underline" href="mailto:hello@hanhphuctoinoi.vn">hello@hanhphuctoinoi.vn</a>.</p><p>Chính sách có thể được cập nhật khi dịch vụ hoặc yêu cầu pháp lý thay đổi. Ngày cập nhật mới nhất luôn được hiển thị ở đầu trang.</p></>,
  },
];

export default function PrivacyPage() {
  return <LegalPageLayout eyebrow="Quyền riêng tư" title="Chính sách bảo mật" description="Thông tin minh bạch về dữ liệu LOMAR thu thập, lý do sử dụng và quyền kiểm soát của bạn." updatedAt="06/09/2026" icon={ShieldCheck} sections={sections} />;
}
