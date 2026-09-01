import { useParams, useNavigate, Link } from 'react-router-dom';
import { Heart, ShoppingBag, Phone, Share2, Filter, Sparkles, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { openContextualAssistant } from '../chat/openAssistant';
import { ROUTES } from '../../shared/config/routes';
import FollowButton from '../social/components/FollowButton';
import { VendorServiceCard } from './components/VendorServiceCard';
import { useVendorDetail } from './hooks/useVendorDetail';
import { Spinner } from '../../shared/ui/Spinner';
import { EmptyState } from '../../shared/ui/EmptyState';
import { Reveal } from '../../shared/ui/Reveal';
import { ArrowLeftIcon } from '../../shared/ui/icons';
import { EASE } from '../../shared/ui/motion';

export default function VendorDetail() {
  const { vendorId } = useParams<{ vendorId: string }>();
  const navigate = useNavigate();
  const { loading, services, vendor } = useVendorDetail(vendorId);

  if (loading) {
    return (
      <div className="flex min-h-[100dvh] w-full items-center justify-center bg-canvas">
        <Spinner />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="flex min-h-[100dvh] w-full flex-col items-center justify-center gap-6 bg-canvas px-4 text-center">
        <h2 className="mb-2 font-serif text-2xl font-bold text-ink">Không tìm thấy thương hiệu</h2>
        <button
          onClick={() => navigate(ROUTES.explore)}
          className="group inline-flex items-center gap-2.5 rounded-full border border-ink/15 bg-white/70 py-2.5 pl-5 pr-2.5 text-[11px] font-bold uppercase tracking-widest text-ink transition-all duration-500 ease-fluid hover:border-ink/40 hover:bg-white active:scale-[0.98]"
        >
          Quay lại khám phá
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink/5 transition-all duration-500 ease-fluid group-hover:-translate-x-1 group-hover:scale-105 group-hover:bg-ink/10">
            <ArrowLeftIcon className="h-3 w-3" />
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col bg-canvas pb-24">
      {/* Hero — editorial, ink scrim unified with the design system */}
      <div className="relative h-[420px] w-full overflow-hidden sm:h-[450px]">
        <motion.img
          initial={{ scale: 1.06, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: EASE }}
          src={
            vendor.image_url ||
            'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=2000'
          }
          alt={vendor.name || 'Vendor'}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-deep/85 via-ink-deep/35 to-ink-deep/10" />

        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: EASE }}
          className="absolute left-4 top-24 z-20 md:left-8 md:top-28"
        >
          <button
            onClick={() => navigate(-1)}
            className="group flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-white/10 text-canvas backdrop-blur-md transition-all duration-500 ease-fluid hover:bg-white/25 active:scale-95 md:h-12 md:w-12"
            aria-label="Quay lại"
          >
            <ArrowLeftIcon className="h-5 w-5 transition-transform duration-500 ease-fluid group-hover:-translate-x-0.5" />
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
          className="absolute bottom-0 left-0 z-10 w-full p-4 pb-8 sm:p-6 md:p-12"
        >
          <div className="mx-auto flex max-w-[1200px] flex-col justify-between gap-5 md:flex-row md:items-end">
            <div className="flex-1">
              <div className="mb-3 flex items-center gap-3">
                <span className="rounded-full bg-rose px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                  {vendor.category || 'Dịch vụ'}
                </span>
                <div className="flex items-center rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs font-bold text-canvas backdrop-blur-md">
                  <Star strokeWidth={1.5} className="mr-1 h-3.5 w-3.5 fill-cream text-cream" />
                  {Number(vendor.rating_avg) || '5.0'}
                </div>
              </div>
              <h1 className="mb-2 font-serif text-2xl font-bold leading-tight tracking-tight text-canvas sm:text-4xl md:text-5xl lg:text-6xl">
                {vendor.name}
              </h1>
              <div className="flex items-center text-xs text-canvas/85 sm:text-sm">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-1.5 h-3.5 w-3.5 shrink-0 text-rose-soft"
                  aria-hidden
                >
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {vendor.address || 'Hồ Văn Huê, Phú Nhuận'}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <FollowButton type="vendor" targetId={vendor.id} size="md" showCount={false} />
              <button className="group inline-flex items-center gap-2.5 rounded-full bg-canvas py-2 pl-5 pr-2 text-[11px] font-bold uppercase tracking-widest text-ink shadow-lift transition-all duration-500 ease-fluid hover:bg-white active:scale-[0.98] sm:py-2.5 sm:pl-6 sm:pr-2.5">
                Liên hệ
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink/5 transition-all duration-500 ease-fluid group-hover:translate-x-0.5 group-hover:-translate-y-[1px] group-hover:scale-105 group-hover:bg-ink/10">
                  <Phone strokeWidth={1.5} className="h-3.5 w-3.5" />
                </span>
              </button>
              <button
                className="flex h-11 w-11 items-center justify-center rounded-full bg-rose text-white shadow-lift transition-all duration-500 ease-fluid hover:-translate-y-0.5 hover:bg-rose-bright active:scale-95 sm:h-12 sm:w-12"
                aria-label="Chia sẻ"
              >
                <Share2 strokeWidth={1.5} className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mx-auto mt-16 w-full max-w-[1200px] px-4 md:mt-20">
        <div className="mb-24 grid grid-cols-1 gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Reveal>
              <div className="mb-6 flex items-center gap-4">
                <h2 className="font-serif text-2xl font-bold uppercase tracking-wide text-ink">
                  Về chúng tôi
                </h2>
                <div className="h-px flex-1 bg-rose/30" />
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mb-10 text-base leading-relaxed text-ink/80 md:text-lg">
                {vendor.name} là một trong những thương hiệu uy tín hàng đầu tại Phố Hạnh Phúc Hồ
                Văn Huê. Với phong cách phục vụ tận tâm và chất lượng dịch vụ đỉnh cao, chúng tôi
                cam kết mang đến những trải nghiệm tuyệt vời nhất cho ngày trọng đại của bạn.
              </p>
            </Reveal>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {['Tư vấn chuyên nghiệp 24/7', 'Sản phẩm thiết kế độc bản', 'Ưu đãi voucher lên đến 20%', 'Hỗ trợ may đo theo yêu cầu'].map(
                (feature, i) => (
                  <Reveal key={feature} delay={0.1 + i * 0.08}>
                    {/* Double-bezel feature mini-card */}
                    <div className="rounded-2xl bg-ink/5 p-1 ring-1 ring-ink/5 transition-all duration-700 ease-fluid hover:-translate-y-0.5 hover:bg-ink/8">
                      <div className="flex items-center gap-3 rounded-[calc(1rem-0.25rem)] bg-white p-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-mist text-rose-deep">
                          <Heart strokeWidth={1.5} className="h-3 w-3 fill-current" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-ink">
                          {feature}
                        </span>
                      </div>
                    </div>
                  </Reveal>
                ),
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <Reveal delay={0.15}>
              <div className="sticky top-24 rounded-bezel bg-ink/5 p-1.5 ring-1 ring-ink/5 shadow-card">
                <div className="rounded-bezel-inner bg-white p-7 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] md:p-8">
                  <h3 className="mb-6 font-serif text-xl font-bold uppercase text-ink">Thông tin</h3>
                  <div className="space-y-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-rose-deep">
                        Địa chỉ
                      </span>
                      <p className="text-sm font-medium text-ink">{vendor.address}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-rose-deep">
                        Giờ mở cửa
                      </span>
                      <p className="text-sm font-medium text-ink">08:00 - 21:00 Hàng ngày</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-rose-deep">
                        Đánh giá
                      </span>
                      <div className="flex items-center gap-1">
                        <Star strokeWidth={1.5} className="h-4 w-4 fill-gold text-gold" />
                        <span className="text-sm font-bold text-ink">
                          {Number(vendor.rating_avg)}/5.0
                        </span>
                        <span className="ml-1 text-xs text-ink/50">
                          ({vendor.rating_count}+ đánh giá)
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="group mt-8 flex w-full items-center justify-between rounded-full bg-ink py-2 pl-6 pr-2 text-[11px] font-bold uppercase tracking-widest text-canvas transition-all duration-500 ease-fluid hover:bg-ink-soft active:scale-[0.98]">
                    Nhận tư vấn ngay
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 transition-all duration-500 ease-fluid group-hover:translate-x-0.5 group-hover:-translate-y-[1px] group-hover:scale-105 group-hover:bg-white/20">
                      <Sparkles strokeWidth={1.5} className="h-3.5 w-3.5" />
                    </span>
                  </button>
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        {/* Collection */}
        <Reveal>
          <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div className="flex flex-col items-center md:items-start">
              <h2 className="mb-2 font-serif text-3xl font-bold uppercase tracking-wider text-ink">
                Bộ sưu tập
              </h2>
              <p className="text-sm italic text-ink/55">
                Khám phá những dịch vụ nổi bật của {vendor.name}
              </p>
            </div>
            <div className="flex gap-4">
              <button className="flex items-center gap-2 rounded-full bg-canvas px-6 py-3 text-xs font-bold uppercase tracking-widest text-ink ring-1 ring-ink/15 transition-all duration-500 ease-fluid hover:ring-ink/40">
                <Filter strokeWidth={1.5} className="h-4 w-4" /> Bộ lọc
              </button>
              <div className="flex rounded-full bg-canvas p-1 ring-1 ring-ink/15">
                <button className="rounded-full bg-ink px-5 py-2 text-[10px] font-bold uppercase tracking-widest text-canvas shadow-lift">
                  Mới nhất
                </button>
                <button className="px-5 py-2 text-[10px] font-bold uppercase tracking-widest text-ink/60 transition-colors duration-500 hover:text-ink">
                  Phổ biến
                </button>
              </div>
            </div>
          </div>
        </Reveal>

        {services.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag strokeWidth={1.5} className="h-7 w-7" />}
            title="Dịch vụ đang được cập nhật"
            description="Vui lòng quay lại sau để xem bộ sưu tập mới nhất."
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 md:gap-8">
            {services.map((service, index) => (
              <VendorServiceCard key={service.id} service={service} index={index} />
            ))}
          </div>
        )}

        {/* Closing CTA — dark bezel panel */}
        <Reveal className="mt-24">
          <div className="relative overflow-hidden rounded-bezel bg-ink p-1.5 ring-1 ring-white/10">
            <div className="relative overflow-hidden rounded-bezel-inner bg-gradient-to-br from-ink via-ink to-ink-soft px-8 py-14 text-center md:p-16">
              <div className="pointer-events-none absolute -top-12 right-6 opacity-10">
                <Star className="h-48 w-48 text-cream" strokeWidth={0.75} />
              </div>
              <div className="relative z-10">
                <h2 className="mb-6 font-serif text-3xl font-bold tracking-tight text-canvas md:text-4xl lg:text-5xl">
                  Cần gợi ý cho <span className="italic text-rose-soft">ngày cưới?</span>
                </h2>
                <p className="mx-auto mb-10 max-w-2xl text-sm leading-relaxed text-canvas/75 md:text-base">
                  Hỏi tư vấn AI về ngân sách và concept, hoặc lưu tiến trình trong hành trình cưới
                  của bạn.
                </p>
                <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() =>
                      openContextualAssistant({
                        prompt: vendor.name ? `Tư vấn về ${vendor.name}` : undefined,
                      })
                    }
                    className="group inline-flex items-center gap-3 rounded-full bg-rose py-3 pl-8 pr-3 text-xs font-bold uppercase tracking-widest text-white shadow-lift transition-all duration-500 ease-fluid hover:-translate-y-0.5 hover:bg-rose-bright active:scale-[0.98]"
                  >
                    Tư vấn AI
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 transition-all duration-500 ease-fluid group-hover:translate-x-0.5 group-hover:-translate-y-[1px] group-hover:scale-105">
                      <Sparkles strokeWidth={1.5} className="h-4 w-4" />
                    </span>
                  </button>
                  <Link
                    to={ROUTES.dashboard}
                    className="inline-flex items-center justify-center rounded-full border border-white/25 px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-canvas transition-all duration-500 ease-fluid hover:bg-white/10 active:scale-[0.98]"
                  >
                    Hành trình của tôi
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
