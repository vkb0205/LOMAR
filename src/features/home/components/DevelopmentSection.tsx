import { Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import logoMainImg from '../../../assets/images/Logo.png';
import { ROUTES } from '../../../shared/config/routes';
import { fadeBlurVariant } from '../animations';
import { Accent } from '../../../shared/ui/SectionHeading';
import { Reveal } from '../../../shared/ui/Reveal';
import { developmentMilestones } from '../content';

export function DevelopmentSection() {
  return (
    <section className="relative z-20 w-full overflow-hidden bg-canvas px-4 pt-24 pb-24 md:pt-32 md:pb-32">
      <div className="relative z-10 mx-auto max-w-[1200px]">
        <Reveal className="mb-16 flex flex-col items-center" duration={0.8}>
          <div className="flex w-full max-w-3xl items-center gap-6">
            <div className="h-px flex-1 bg-sage/50" />
            <h2 className="text-[1.75rem] font-serif font-bold leading-[1.1] tracking-[-0.015em] text-balance text-ink md:text-4xl lg:text-[2.75rem]">
              Dấu ấn <Accent>phát triển</Accent>
            </h2>
            <div className="h-px flex-1 bg-sage/50" />
          </div>
          <Heart className="mt-4 h-3 w-3 fill-current text-rose" strokeWidth={1.5} />
        </Reveal>

        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-4">
          <Reveal className="text-center lg:col-span-1 lg:text-left" duration={0.8}>
            <p className="font-serif text-sm italic leading-relaxed text-forest opacity-80 md:text-base">
              Từ một con phố với bề dày lịch sử, Hồ Văn Huê không ngừng chuyển mình để trở thành
              điểm đến cưới hàng đầu của các cặp đôi tại{' '}
              <span className="font-bold not-italic">TP.HCM.</span>
            </p>
          </Reveal>

          <div className="relative border-y border-sage/40 p-8 lg:col-span-3 md:p-12 lg:p-16">
            <div className="absolute left-[10%] right-[10%] top-[80px] z-0 hidden h-px bg-rose/40 md:block" />

            <div className="relative z-10 grid grid-cols-1 gap-10 md:grid-cols-4 md:gap-4">
              {developmentMilestones.map((milestone, index) => (
                <motion.div
                  key={milestone.year}
                  variants={fadeBlurVariant}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.15, ease: [0.32, 0.72, 0, 1] }}
                  className="group flex cursor-default flex-col items-center text-center"
                >
                  <div className="mb-6 flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-rose/50 bg-rose-mist text-ink shadow-card transition-all duration-700 ease-fluid group-hover:scale-105 group-hover:border-sage md:h-20 md:w-20">
                    <milestone.icon strokeWidth={1} className="h-7 w-7 md:h-8 md:w-8" />
                  </div>
                  <h3 className="mb-2 font-serif text-xl font-bold text-forest transition-colors duration-500 group-hover:text-ink md:text-2xl">
                    {milestone.year}
                  </h3>
                  <p className="text-[10px] font-bold uppercase leading-relaxed tracking-wider text-forest opacity-70 whitespace-pre-line md:text-[11px]">
                    {milestone.title}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-24 flex w-full flex-col items-center justify-center gap-8 xl:flex-row xl:gap-6">
          <Reveal duration={0.9} delay={0.2} className="w-full flex-1">
            {/* Double-bezel photo banner */}
            <div className="relative min-h-[320px] w-full overflow-hidden rounded-bezel bg-ink/5 p-1.5 ring-1 ring-sage/25 shadow-float md:min-h-[370px]">
              <div className="relative h-full w-full overflow-hidden rounded-bezel-inner">
                <img
                  src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=1200"
                  alt="Phố"
                  className="absolute inset-0 h-full w-full object-cover opacity-70 transition-transform duration-1000 ease-fluid hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/80 to-transparent md:bg-gradient-to-r md:to-transparent" />
                <div className="relative z-10 flex h-full w-full flex-col items-center justify-end p-6 text-center sm:p-12 md:w-2/3 md:items-start md:justify-center md:text-left xl:pl-24">
                  <div className="mb-4 flex items-center gap-3 self-center md:mb-6 md:self-start">
                    <img src={logoMainImg} alt="Logo" className="h-14 w-auto object-contain" />
                    <div className="flex flex-col justify-center border-l border-ink/30 pl-3">
                      <span className="font-serif text-xs font-bold uppercase leading-none tracking-wider text-ink md:text-sm">
                        HẠNH PHÚC TỚI NƠI
                      </span>
                    </div>
                  </div>
                  <h2 className="mb-6 font-serif text-xl font-bold uppercase leading-tight text-ink md:mb-8 md:text-2xl lg:text-3xl">
                    CÙNG NHAU KIẾN TẠO
                    <br />
                    NHỮNG KHỞI ĐẦU HẠNH PHÚC
                  </h2>
                  <Link
                    to={ROUTES.explore}
                    className="group inline-flex items-center gap-3 self-center rounded-full bg-ink py-2.5 pl-6 pr-2.5 text-[11px] font-bold uppercase tracking-widest text-canvas transition-all duration-500 ease-fluid hover:bg-ink-soft active:scale-[0.98] md:self-start"
                  >
                    KHÁM PHÁ NGAY
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white transition-all duration-500 ease-fluid group-hover:translate-x-1 group-hover:-translate-y-[1px] group-hover:scale-105 group-hover:bg-rose-mist">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-3.5 w-3.5 text-ink transition-transform duration-500 ease-fluid group-hover:translate-x-0.5"
                        aria-hidden
                      >
                        <path d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
