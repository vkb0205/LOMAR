import { Link } from 'react-router-dom';
import { BookOpen, Route, Store } from 'lucide-react';
import { motion } from 'motion/react';
import { ROUTES } from '../../../shared/config/routes';
import { fadeBlurVariant } from '../animations';
import { SectionHeading, Accent } from '../../../shared/ui/SectionHeading';
import { ArrowRightIcon } from '../../../shared/ui/icons';

const steps = [
  {
    title: 'Khám phá dịch vụ',
    desc: 'Lọc theo danh mục, so sánh nhà cung cấp trên Hồ Văn Huê.',
    to: ROUTES.explore,
    icon: Store,
    cta: 'Xem dịch vụ',
  },
  {
    title: 'Lập hành trình',
    desc: 'Theo dõi checklist, lưu thiết kế và mở khóa ưu đãi theo tiến độ.',
    to: ROUTES.dashboard,
    icon: Route,
    cta: 'Vào hành trình',
  },
  {
    title: 'Đọc cẩm nang',
    desc: 'Timeline chuẩn bị cưới theo từng giai đoạn, dễ theo dõi.',
    to: ROUTES.guide,
    icon: BookOpen,
    cta: 'Xem cẩm nang',
  },
];

export function JourneyCTA() {
  return (
    <section className="relative z-10 bg-canvas px-4 py-24 md:py-32">
      <div className="mx-auto max-w-[1200px]">
        <SectionHeading
          eyebrow="Lộ trình rõ ràng"
          title={
            <>
              Bắt đầu <Accent>hành trình cưới</Accent>
            </>
          }
          description="Ba bước gọn — từ khám phá dịch vụ đến checklist cá nhân. Bé Song Hỷ luôn sẵn sàng ở góc màn hình khi bạn cần."
          className="mb-14 md:mb-16"
        />

        <div className="relative grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-6">
          {/* dashed path connecting the steps — the journey metaphor */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-[16%] right-[16%] top-[3.75rem] hidden border-t-2 border-dashed border-rose/30 sm:block"
          />
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              variants={fadeBlurVariant}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.7, delay: index * 0.1, ease: [0.32, 0.72, 0, 1] }}
              className={`group relative flex flex-col rounded-bezel bg-ink/4 p-1.5 ring-1 ring-ink/8 shadow-card transition-all duration-700 ease-fluid hover:-translate-y-1.5 hover:bg-ink/8 ${
                index === 1 ? 'sm:mt-10' : ''
              }`}
            >
              <div className="flex flex-1 flex-col rounded-[calc(2rem-0.375rem)] bg-white p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-mist/70 text-rose ring-4 ring-canvas transition-colors duration-500 group-hover:bg-rose group-hover:text-white">
                    <step.icon strokeWidth={1.5} className="h-5 w-5" />
                  </div>
                  <span className="font-serif text-3xl font-bold italic leading-none text-ink/15 transition-colors duration-500 group-hover:text-rose/40">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mb-2 font-serif text-lg font-bold text-ink">{step.title}</h3>
                <p className="mb-5 flex-1 text-xs leading-relaxed text-ink/65">{step.desc}</p>
                <Link
                  to={step.to}
                  className="group/link inline-flex items-center gap-2.5 self-start rounded-full py-1 pr-1 pl-3 text-[11px] font-bold uppercase tracking-widest text-ink transition-colors duration-500 hover:text-rose-deep"
                >
                  {step.cta}
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink/5 transition-all duration-500 ease-fluid group-hover/link:translate-x-1 group-hover/link:-translate-y-[1px] group-hover/link:scale-105 group-hover/link:bg-rose-deep group-hover/link:text-white">
                    <ArrowRightIcon className="h-3 w-3" />
                  </span>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
