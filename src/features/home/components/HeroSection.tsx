import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { HeroBackgroundVideo } from './HeroBackgroundVideo';
import { ROUTES } from '../../../shared/config/routes';
import { ArrowRightIcon, ArrowUpRightIcon } from '../../../shared/ui/icons';
import { EyebrowTag } from '../../../shared/ui/EyebrowTag';
import { EASE } from '../../../shared/ui/motion';

export function HeroSection() {
  return (
    <section data-hero className="relative w-full overflow-hidden bg-canvas">
      <div className="relative aspect-[4255/1575] min-h-[520px] max-h-[760px] w-full overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.1, ease: EASE }}
          className="absolute inset-0"
        >
          <HeroBackgroundVideo />
        </motion.div>

        {/* Warm cream veil so the illustrated district stays soft behind copy */}
        <div className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/55 to-canvas/25" />

        <div className="absolute inset-0 flex items-end justify-center px-4 pb-14 sm:pb-16 md:items-center md:justify-start md:px-8 md:pb-0 lg:px-16 xl:px-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
            className="max-w-xl text-center md:text-left"
          >
            <EyebrowTag>
              <span
                className="h-2 w-2 rounded-full bg-rose shadow-[0_0_0_3px_rgba(215,139,162,0.25)]"
                aria-hidden
              />
              Khu phố hạnh phúc · Hồ Văn Huê
            </EyebrowTag>

            <h1 className="mt-5 font-serif text-[clamp(2rem,6vw,4.5rem)] font-bold leading-[1.05] tracking-tight text-ink">
              Hạnh Phúc
              <br />
              Tới Nơi
            </h1>

            <p className="mt-5 max-w-md text-sm leading-relaxed text-pretty text-ink/75 md:text-base">
              Một con phố, trọn vẹn hành trình chuẩn bị cho ngày cưới của bạn — từ thời trang,
              trang điểm, chụp ảnh đến trang sức, quà tặng và chăm sóc sức khỏe.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 md:justify-start">
              <Link
                to={ROUTES.explore}
                className="group inline-flex items-center gap-3 rounded-full bg-ink py-2.5 pl-6 pr-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-canvas shadow-lift transition-all duration-500 ease-fluid hover:bg-ink-soft active:scale-[0.98]"
              >
                Khám phá dịch vụ
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 transition-all duration-500 ease-fluid group-hover:translate-x-1 group-hover:-translate-y-[1px] group-hover:scale-105 group-hover:bg-white/20">
                  <ArrowUpRightIcon className="h-3.5 w-3.5" />
                </span>
              </Link>
              <Link
                to={ROUTES.guide}
                className="group inline-flex items-center gap-3 rounded-full border border-ink/15 bg-white/70 py-2.5 pl-6 pr-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-ink transition-all duration-500 ease-fluid hover:border-ink/40 hover:bg-white active:scale-[0.98]"
              >
                Xem cẩm nang cưới
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink/5 transition-all duration-500 ease-fluid group-hover:translate-x-1 group-hover:-translate-y-[1px] group-hover:scale-105 group-hover:bg-ink/10">
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </span>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
