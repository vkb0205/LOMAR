import { Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { fadeBlurVariant } from '../animations';
import { storyPillars } from '../content';

export function StorySection() {
  return (
    <section className="py-24 px-4 relative z-10 w-full bg-[#ffe9c9]">
      <div className="max-w-[1200px] mx-auto text-center">
        <motion.div
          variants={fadeBlurVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-center mb-4 gap-2 md:gap-4"
        >
          <div className="h-px bg-[#b5d9f2] w-10 md:w-16"></div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-[#1e4696] uppercase">
            CÂU CHUYỆN <span className="text-[#1e4696]">CỦA CHÚNG TÔI</span>
          </h2>
          <div className="h-px bg-[#b5d9f2] w-10 md:w-16"></div>
        </motion.div>

        <motion.div
          variants={fadeBlurVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Heart className="w-4 h-4 text-[#b5d9f2] mx-auto fill-current mb-6" />
          <p className="max-w-3xl mx-auto text-[#1e4696] text-sm md:text-base leading-relaxed mb-16 px-4 md:px-0">
            Hồ Văn Huê – con phố mang tên một vị chí sĩ yêu nước – hôm nay tiếp tục sứ mệnh
            kết nối yêu thương theo cách rất riêng: trở thành "<strong>Phố Hạnh Phúc</strong>" – hệ sinh thái cưới
            đầu tiên được xây dựng với tinh thần hiện đại, văn minh và nghĩa tình.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {storyPillars.map((pillar, index) => (
            <motion.div
              key={pillar.title}
              variants={fadeBlurVariant}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="bg-white rounded-[24px] overflow-hidden shadow-md shadow-[#b5d9f2]/30 border border-[#b5d9f2]/40 flex flex-col items-center hover:shadow-lg transition-shadow min-h-[420px] max-w-[320px] mx-auto w-full group"
            >
              <div className="pt-8 pb-4 px-4 flex flex-col items-center flex-1 w-full">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-[#3e649b] mb-4 group-hover:scale-110 transition-transform">
                  <pillar.icon className="w-10 h-10 stroke-[1.5]" />
                </div>
                <h3 className={`font-serif font-bold text-xl mb-3 ${pillar.color}`}>{pillar.title}</h3>
                <p className="text-[#1e4696] text-xs leading-relaxed whitespace-pre-line text-center">{pillar.desc}</p>
              </div>
              <div className="w-full h-48 p-2 mt-auto">
                <div className="w-full h-full rounded-[16px] overflow-hidden relative">
                  <img src={pillar.img} alt={pillar.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/50 pointer-events-none" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
