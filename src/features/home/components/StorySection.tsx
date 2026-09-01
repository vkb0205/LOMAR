import { Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { fadeBlurVariant } from '../animations';
import { storyPillars } from '../content';
import { Accent } from '../../../shared/ui/SectionHeading';
import { Reveal } from '../../../shared/ui/Reveal';

export function StorySection() {
  return (
    <section className="relative z-10 w-full bg-sage-mist px-4 py-24 md:py-32">
      <div className="mx-auto max-w-[1200px] text-center">
        <Reveal className="mb-5 flex items-center justify-center gap-3 md:gap-5" duration={0.8}>
          <div className="h-px w-10 bg-sage md:w-16" />
          <h2 className="text-[1.75rem] font-serif font-bold leading-[1.1] tracking-[-0.015em] text-balance text-ink md:text-4xl lg:text-[2.75rem]">
            Câu chuyện <Accent>của chúng tôi</Accent>
          </h2>
          <div className="h-px w-10 bg-sage md:w-16" />
        </Reveal>

        <Reveal duration={0.8} delay={0.1}>
          <Heart className="mx-auto mb-6 h-4 w-4 fill-current text-rose" strokeWidth={1.5} />
          <p className="mx-auto mb-14 max-w-2xl px-4 text-sm leading-[1.8] text-ink/75 md:px-0 md:text-base">
            Hồ Văn Huê – con phố mang tên một vị chí sĩ yêu nước – hôm nay tiếp tục sứ mệnh
            kết nối yêu thương theo cách rất riêng: trở thành "<strong>Phố Hạnh Phúc</strong>" – hệ sinh thái cưới
            đầu tiên được xây dựng với tinh thần hiện đại, văn minh và nghĩa tình.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {storyPillars.map((pillar, index) => (
            <motion.div
              key={pillar.title}
              variants={fadeBlurVariant}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.8, delay: index * 0.15, ease: [0.32, 0.72, 0, 1] }}
              className="group mx-auto flex w-full max-w-[320px] flex-col overflow-hidden rounded-[1.75rem] bg-canvas p-1.5 ring-1 ring-sage/25 shadow-card transition-shadow duration-700 hover:shadow-float"
            >
              <div className="relative flex h-44 w-full overflow-hidden rounded-[calc(1.75rem-0.375rem)]">
                <img
                  src={pillar.img}
                  alt={pillar.title}
                  className="h-full w-full object-cover transition-transform duration-700 ease-fluid group-hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-canvas/90 via-canvas/15 to-transparent" />
                <div className="absolute -bottom-5 left-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-canvas text-sage shadow-lift transition-colors duration-500 group-hover:bg-rose/15 group-hover:text-rose">
                  <pillar.icon strokeWidth={1.5} className="h-7 w-7" />
                </div>
              </div>
              <div className="flex w-full flex-1 flex-col items-start px-5 pb-5 pt-8">
                <h3 className={`mb-2 font-serif text-xl font-bold ${pillar.color}`}>{pillar.title}</h3>
                <p className="whitespace-pre-line text-xs leading-relaxed text-forest">{pillar.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
