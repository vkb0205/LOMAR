import { Link } from 'react-router-dom';
import { MapPin, Sparkles, Store } from 'lucide-react';
import { motion } from 'motion/react';
import keyVisual from '../../../img/Key Visual - Med Res - 4255x1575px (150ppi).png';
import { ROUTES } from '../../../shared/config/routes';
import { fadeBlurVariant } from '../animations';
import { SectionHeading, Accent } from '../../../shared/ui/SectionHeading';

const highlights = [
  {
    icon: Store,
    title: 'Hơn 300 gian hàng',
    desc: 'Thời trang, trang điểm, studio, trang sức, quà tặng & sức khỏe.',
  },
  {
    icon: MapPin,
    title: 'Một con phố, trọn hành trình',
    desc: 'Đi bộ từ đầu đến cuối phố để chuẩn bị trọn vẹn ngày cưới.',
  },
  {
    icon: Sparkles,
    title: 'Bé Song Hỷ dẫn lối',
    desc: 'Công nghệ, bản đồ hạnh phúc và tư vấn AI luôn sẵn sàng.',
  },
];

export function DistrictSection() {
  return (
    <section className="relative w-full overflow-hidden bg-canvas px-4 py-24 md:py-32">
      <div className="mx-auto max-w-[1200px]">
        <SectionHeading
          eyebrow="Khu phố hạnh phúc"
          title={
            <>
              Dạo bước <Accent>Hồ Văn Huê</Accent>
            </>
          }
          description="Hình dung một con phố nơi mọi thứ cho ngày cưới đều nằm trong tầm tay. Đây là khu phố hạnh phúc — nơi mỗi cặp đôi bắt đầu hành trình của mình."
        />

        <div className="mt-12 grid items-center gap-8 md:mt-16 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
          <motion.div
            variants={fadeBlurVariant}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
            className="relative overflow-hidden rounded-bezel bg-ink/5 p-1.5 ring-1 ring-sage/20 shadow-float"
          >
            <div className="overflow-hidden rounded-bezel-inner">
              <img
                src={keyVisual}
                alt="Phố Hạnh Phúc Hồ Văn Huê - khu phố hạnh phúc"
                className="aspect-[4255/1575] w-full object-cover transition-transform duration-1000 ease-fluid hover:scale-[1.03]"
              />
            </div>
            <div className="pointer-events-none absolute inset-1.5 rounded-bezel-inner bg-gradient-to-t from-ink/25 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 rounded-2xl border border-white/30 bg-white/85 px-4 py-3 shadow-card">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sage">
                Bản đồ hạnh phúc
              </p>
              <p className="mt-0.5 text-sm font-semibold text-ink">Khám phá toàn bộ khu phố</p>
            </div>
          </motion.div>

          <div className="grid gap-4">
            {highlights.map((item, index) => (
              <motion.div
                key={item.title}
                variants={fadeBlurVariant}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.7, delay: index * 0.1, ease: [0.32, 0.72, 0, 1] }}
                className="group flex items-start gap-4 rounded-3xl bg-white p-5 ring-1 ring-ink/10 transition-all duration-700 ease-fluid hover:-translate-y-1 hover:ring-sage/40 hover:shadow-card"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sage-mist text-forest transition-colors duration-500 group-hover:bg-ink group-hover:text-canvas">
                  <item.icon strokeWidth={1.5} className="h-5 w-5" aria-hidden />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-ink/65">{item.desc}</p>
                </div>
              </motion.div>
            ))}

            <motion.div
              variants={fadeBlurVariant}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.32, 0.72, 0, 1] }}
              className="pt-2"
            >
              <Link
                to={ROUTES.explore}
                className="group inline-flex items-center gap-3 rounded-full bg-ink py-2.5 pl-6 pr-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-canvas shadow-lift transition-all duration-500 ease-fluid hover:bg-ink-soft active:scale-[0.98]"
              >
                Xem bản đồ hạnh phúc
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 transition-all duration-500 ease-fluid group-hover:translate-x-1 group-hover:-translate-y-[1px] group-hover:scale-105 group-hover:bg-white/20">
                  <Sparkles strokeWidth={1.5} className="h-4 w-4" aria-hidden />
                </span>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
