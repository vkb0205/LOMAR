import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { fadeBlurVariant } from '../animations';
import { journeyStops } from '../content';
import { ArrowUpRightIcon } from '../../../shared/ui/icons';
import { SectionHeading, Accent } from '../../../shared/ui/SectionHeading';

export function ServiceTilesSection() {
  return (
    <section className="relative w-full overflow-hidden bg-canvas px-4 py-24 md:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_12%_8%,rgba(215,139,162,0.18),transparent_60%),radial-gradient(55%_45%_at_90%_22%,rgba(124,154,90,0.16),transparent_60%)]"
      />

      <div className="relative mx-auto max-w-[1200px]">
        <SectionHeading
          eyebrow="Dịch vụ trong khu phố"
          title={
            <>
              Một phố, <Accent>trọn hành trình</Accent>
            </>
          }
          description="Mỗi gian hàng trên Hồ Văn Huê là một mảnh ghép cho ngày cưới trọn vẹn — chọn nơi bắt đầu, và để Bé Song Hỷ dẫn lối phần còn lại."
        />

        <div className="mt-12 grid grid-cols-2 gap-4 md:mt-16 md:grid-cols-3 md:gap-6">
          {journeyStops.map((stop, index) => (
            <motion.div
              key={stop.to}
              variants={fadeBlurVariant}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: (index % 3) * 0.08, ease: [0.32, 0.72, 0, 1] }}
              className="group"
            >
              <Link
                to={stop.to}
                className="block h-full rounded-bezel bg-ink/8 p-1.5 ring-1 ring-ink/8 shadow-tile transition-all duration-700 ease-fluid group-hover:-translate-y-1.5 group-hover:bg-ink/12 group-hover:ring-sage/30 active:scale-[0.98]"
              >
                <div className="flex h-full flex-col gap-5 rounded-bezel-inner bg-canvas p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] transition-all duration-700 ease-fluid md:p-7">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-rose/30 bg-rose-mist/80 text-rose-deep transition-colors duration-500 group-hover:bg-rose group-hover:text-white md:h-14 md:w-14">
                    <stop.icon className="h-6 w-6 stroke-[1.4] md:h-7 md:w-7" />
                  </div>
                  <div className="flex flex-1 items-end justify-between gap-3">
                    <span className="whitespace-pre-line text-left text-[10px] font-bold uppercase leading-snug tracking-[0.14em] text-ink transition-colors duration-500 group-hover:text-rose md:text-[11px]">
                      {stop.title}
                    </span>
                    <span className="mb-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sage-mist text-ink transition-all duration-500 ease-fluid group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:scale-105 group-hover:bg-ink group-hover:text-canvas">
                      <ArrowUpRightIcon />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
