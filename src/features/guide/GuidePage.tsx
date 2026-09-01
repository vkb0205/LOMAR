import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Calendar, CheckCircle2, ChevronRight, Download, Heart, PlayCircle, Route, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { openContextualAssistant } from '../chat/openAssistant';
import { ROUTES } from '../../shared/config/routes';
import { EASE } from '../../shared/ui/motion';
import { Reveal } from '../../shared/ui/Reveal';
import { EyebrowTag } from '../../shared/ui/EyebrowTag';
import { Accent } from '../../shared/ui/SectionHeading';

const timelineData = [
  {
    phase: '9-12 Tháng Trước',
    tasks: [
      'Xác định ngân sách và lập kế hoạch tài chính',
      'Lên danh sách khách mời dự kiến',
      'Chọn ngày giờ tổ chức (xem ngày tốt)',
      'Tìm kiếm và đặt cọc Venue (Địa điểm tổ chức)'
    ]
  },
  {
    phase: '6-8 Tháng Trước',
    tasks: [
      'Chọn concept và phong cách trang trí',
      'Thử và đặt may/thuê Váy cưới & Vest',
      'Booking Photographer/Videographer',
      'Khám sức khỏe tiền hôn nhân'
    ]
  },
  {
    phase: '3-5 Tháng Trước',
    tasks: [
      'Chốt danh sách khách mời và in thiệp',
      'Lên thực đơn tiệc cưới',
      'Mua nhẫn cưới và trang sức',
      'Chụp ảnh cưới Pre-wedding'
    ]
  },
  {
    phase: '1-2 Tháng Trước',
    tasks: [
      'Gửi thiệp cưới đến khách mời',
      'Thử lại trang phục cưới',
      'Chốt kịch bản chương trình với MC',
      'Spa chăm sóc da và làm đẹp'
    ]
  }
];

export default function Guide() {
  const [activePhase, setActivePhase] = useState(0);

  return (
    <div className="flex w-full flex-col bg-canvas pb-24">
      {/* Hero — editorial split on ink with soft photo glow (no mix-blend) */}
      <div className="relative w-full overflow-hidden bg-ink">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_80%_at_75%_20%,rgba(215,139,162,0.18),transparent_60%),radial-gradient(50%_60%_at_10%_100%,rgba(124,154,90,0.2),transparent_60%)]"
        />
        <div className="relative mx-auto flex max-w-[1200px] flex-col items-center px-4 pt-40 pb-24 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="mb-8 flex h-16 w-16 items-center justify-center rounded-3xl border border-white/15 bg-white/8 text-rose-soft backdrop-blur-md"
          >
            <BookOpen strokeWidth={1.25} className="h-8 w-8" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
          >
            <EyebrowTag tone="onDark">Cẩm nang cưới</EyebrowTag>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 32, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.9, delay: 0.2, ease: EASE }}
            className="mt-5 font-serif text-[clamp(2.25rem,5.5vw,4.25rem)] font-bold leading-[1.05] tracking-[-0.015em] text-canvas"
          >
            Wedding <span className="italic text-rose-soft">Guide</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35, ease: EASE }}
            className="mt-6 max-w-2xl text-sm font-medium leading-relaxed text-canvas/75 md:text-base"
          >
            Cẩm nang toàn diện giúp bạn chuẩn bị cho ngày trọng đại một cách hoàn hảo nhất.
            Mọi thứ bạn cần biết đều có ở đây.
          </motion.p>
        </div>
      </div>

      <div className="relative z-20 mx-auto -mt-14 flex w-full max-w-[1200px] flex-col gap-8 px-4 lg:flex-row">
        {/* Main checklist — double-bezel */}
        <Reveal className="flex-1">
          <div className="rounded-bezel bg-ink/5 p-1.5 ring-1 ring-ink/5 shadow-card">
            <div className="rounded-bezel-inner bg-white p-7 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] md:p-10">
              <div className="mb-8 flex items-center justify-between border-b border-ink/8 pb-6">
                <div>
                  <h2 className="mb-2 font-serif text-2xl font-bold uppercase tracking-widest text-ink">
                    Checklist chuẩn bị
                  </h2>
                  <p className="text-xs font-medium text-ink/55">
                    Lộ trình chi tiết cho đám cưới trong mơ
                  </p>
                </div>
                <button className="hidden items-center gap-2 rounded-full bg-rose-mist px-4 py-2 text-xs font-bold uppercase tracking-widest text-rose-deep transition-all duration-500 ease-fluid hover:bg-rose hover:text-white sm:flex">
                  <Download strokeWidth={1.5} className="h-4 w-4" /> Tải PDF
                </button>
              </div>

              <div className="flex flex-col gap-8 md:flex-row">
                {/* Phase selector */}
                <div className="flex w-full shrink-0 flex-col gap-3 md:w-48">
                  {timelineData.map((data, idx) => {
                    const active = activePhase === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => setActivePhase(idx)}
                        aria-pressed={active}
                        className={`relative overflow-hidden rounded-2xl border py-4 pl-5 pr-4 text-left transition-all duration-500 ease-fluid ${
                          active
                            ? 'border-ink bg-ink shadow-lift'
                            : 'border-ink/12 text-ink/60 hover:border-ink/40 hover:text-ink'
                        }`}
                      >
                        {active && (
                          <motion.span
                            layoutId="guide-phase-glow"
                            className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_100%_at_100%_0%,rgba(215,139,162,0.25),transparent_70%)]"
                          />
                        )}
                        <span
                          className={`relative block text-[10px] font-bold uppercase tracking-widest ${
                            active ? 'text-rose-soft' : 'opacity-70'
                          }`}
                        >
                          Giai đoạn {idx + 1}
                        </span>
                        <span className={`relative block text-sm font-bold ${active ? 'text-canvas' : ''}`}>
                          {data.phase}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Tasks */}
                <motion.div
                  key={activePhase}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, ease: EASE }}
                  className="flex-1 rounded-2xl border border-ink/8 bg-canvas p-6 md:p-8"
                >
                  <div className="mb-6 flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-mist text-rose-deep">
                      <Calendar strokeWidth={1.5} className="h-5 w-5" />
                    </span>
                    <h3 className="font-serif text-xl font-bold text-ink">
                      {timelineData[activePhase].phase}
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {timelineData[activePhase].tasks.map((task, idx) => (
                      <div
                        key={idx}
                        className="group flex cursor-pointer items-start gap-4 rounded-xl border border-ink/8 bg-white p-4 transition-all duration-500 ease-fluid hover:-translate-y-0.5 hover:border-rose/40 hover:shadow-card"
                      >
                        <span className="mt-0.5 text-sage transition-colors duration-500 group-hover:text-rose-deep">
                          <CheckCircle2 strokeWidth={1.5} className="h-5 w-5" />
                        </span>
                        <p className="pt-0.5 text-sm font-medium leading-relaxed text-ink">{task}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Sidebar */}
        <aside className="flex shrink-0 flex-col gap-6 lg:w-[380px]">
          {/* Featured article */}
          <Reveal delay={0.1}>
            <div className="group cursor-pointer overflow-hidden rounded-bezel bg-ink/5 p-1.5 ring-1 ring-ink/5 shadow-card transition-shadow duration-700 hover:shadow-float">
              <div className="flex flex-col overflow-hidden rounded-bezel-inner bg-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]">
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=600"
                    alt="Wedding Tip"
                    className="h-full w-full object-cover transition-transform duration-700 ease-fluid group-hover:scale-105"
                  />
                  <div className="absolute left-4 top-4 rounded-full bg-canvas/90 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-ink">
                    Mẹo hay
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="mb-3 font-serif text-lg font-bold leading-tight text-ink transition-colors duration-500 group-hover:text-rose-deep">
                    5 Lưu ý quan trọng khi chọn địa điểm tổ chức tiệc cưới
                  </h3>
                  <p className="mb-4 line-clamp-2 text-xs leading-relaxed text-ink/55">
                    Đừng vội đặt cọc ngay nếu bạn chưa kiểm tra kỹ các yếu tố về không gian, âm
                    thanh, ánh sáng và bãi đỗ xe...
                  </p>
                  <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-widest text-rose-deep transition-colors duration-500 group-hover:text-ink">
                    Đọc tiếp
                    <ChevronRight strokeWidth={1.5} className="ml-1 h-4 w-4 transition-transform duration-500 ease-fluid group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Next steps — dark accent panel */}
          <Reveal delay={0.2}>
            <div className="overflow-hidden rounded-bezel bg-ink p-1.5 ring-1 ring-white/10">
              <div className="relative flex flex-col overflow-hidden rounded-bezel-inner bg-gradient-to-br from-ink via-ink to-ink-soft p-7">
                <div className="pointer-events-none absolute -right-5 -top-5 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
                <div className="pointer-events-none absolute -bottom-5 -left-5 h-40 w-40 rounded-full bg-rose/20 blur-2xl" />

                <div className="relative z-10 flex h-full flex-col">
                  <div className="mb-2 flex items-center gap-2">
                    <PlayCircle strokeWidth={1.5} className="h-5 w-5 text-rose-soft" />
                    <h3 className="font-serif text-xl font-bold text-canvas">Bước tiếp theo</h3>
                  </div>
                  <p className="mb-6 text-xs leading-relaxed text-canvas/70">
                    Biến checklist thành hành trình cá nhân, hoặc hỏi AI khi cần gợi ý nhanh.
                  </p>

                  <div className="mt-auto flex flex-col gap-3">
                    <Link
                      to={ROUTES.dashboard}
                      className="group flex w-full items-center justify-between rounded-full bg-rose py-2 pl-5 pr-2 text-[10px] font-bold uppercase tracking-widest text-white transition-all duration-500 ease-fluid hover:-translate-y-0.5 hover:bg-rose-bright active:scale-[0.98]"
                    >
                      Mở hành trình của tôi
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 transition-all duration-500 ease-fluid group-hover:translate-x-0.5 group-hover:scale-105">
                        <Route strokeWidth={1.5} className="h-3.5 w-3.5" />
                      </span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => openContextualAssistant()}
                      className="flex w-full items-center justify-center gap-2 rounded-full border border-white/25 py-3 text-[10px] font-bold uppercase tracking-widest text-canvas transition-all duration-500 ease-fluid hover:bg-white/10 active:scale-[0.98]"
                    >
                      <Sparkles strokeWidth={1.5} className="h-4 w-4" /> Hỏi tư vấn AI
                    </button>
                    <Link
                      to={ROUTES.explore}
                      className="flex w-full items-center justify-center gap-2 rounded-full py-3 text-[10px] font-bold uppercase tracking-widest text-canvas/80 transition-colors duration-500 hover:text-canvas"
                    >
                      Khám phá dịch vụ <ChevronRight strokeWidth={1.5} className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.25} className="flex justify-center">
            <Heart className="h-3 w-3 fill-current text-rose" strokeWidth={1.5} />
          </Reveal>
        </aside>
      </div>
    </div>
  );
}
