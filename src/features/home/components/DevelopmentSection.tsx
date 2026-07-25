import { ArrowRight, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import logoMainImg from '../../../assets/images/Logo.png';
import { fadeBlurVariant } from '../animations';
import { developmentMilestones } from '../content';

export function DevelopmentSection() {
  return (
    <section className="pt-24 pb-20 px-4 w-full relative bg-white overflow-hidden z-20">
      <div className="max-w-[1200px] mx-auto relative z-10">
        <motion.div
          variants={fadeBlurVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center mb-16"
        >
          <div className="flex items-center gap-6 w-full max-w-3xl">
            <div className="h-[1px] bg-[#b5d9f2] flex-1"></div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-[#1e4696] uppercase">
              DẤU ẤN <span className="text-[#1e4696]">PHÁT TRIỂN</span>
            </h2>
            <div className="h-[1px] bg-[#b5d9f2] flex-1"></div>
          </div>
          <Heart className="w-3 h-3 text-[#3e649b] mt-4 fill-current" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-center">
          <motion.div
            variants={fadeBlurVariant}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-1 text-center lg:text-left"
          >
            <p className="text-[#1e4696] text-sm md:text-base leading-relaxed font-serif italic opacity-80">
              Từ một con phố với bề dày lịch sử, Hồ Văn Huê không ngừng chuyển mình để trở thành điểm đến cưới hàng đầu của các cặp đôi tại <span className="text-[#1e4696] font-bold not-italic">TP.HCM.</span>
            </p>
          </motion.div>

          <div className="lg:col-span-3 relative bg-white/40 backdrop-blur-sm border border-[#b5d9f2]/50 rounded-[40px] md:rounded-[60px] p-8 md:p-12 lg:p-16">
            <div className="absolute top-[80px] left-[10%] right-[10%] h-[1px] bg-[#b5d9f2]/50 z-0 hidden md:block"></div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-4 relative z-10">
              {developmentMilestones.map((milestone, index) => (
                <motion.div
                  key={milestone.year}
                  variants={fadeBlurVariant}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  className="flex flex-col items-center text-center group cursor-default"
                >
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white border border-[#b5d9f2]/50 flex items-center justify-center text-[#3e649b] mb-6 shrink-0 relative z-10 group-hover:scale-105 transition-transform shadow-sm group-hover:shadow-md group-hover:border-[#1e4696]">
                    <milestone.icon className="w-7 h-7 md:w-8 md:h-8 stroke-[1]" />
                  </div>
                  <h3 className="font-serif font-bold text-xl md:text-2xl text-[#1e4696] mb-2 group-hover:text-[#1e4696] transition-colors">{milestone.year}</h3>
                  <p className="text-[10px] md:text-[11px] text-[#1e4696] whitespace-pre-line leading-relaxed opacity-70 uppercase font-bold tracking-wider">{milestone.title}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-8 xl:gap-6 relative z-10 w-full items-center justify-center mt-20">
          <motion.div
            variants={fadeBlurVariant}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex-1 w-full bg-white rounded-[32px] overflow-hidden relative shadow-md border border-[#b5d9f2]/50 min-h-[300px] md:min-h-[350px]"
          >
            <img src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=1200" alt="Phố" className="absolute inset-0 w-full h-full object-cover opacity-70 hover:scale-105 transition-transform duration-1000" />
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-white/95 via-white/80 to-transparent md:to-transparent" />
            <div className="relative z-10 p-6 sm:p-12 flex flex-col justify-end md:justify-center h-full w-full md:w-2/3 xl:pl-32 items-center text-center md:items-start md:text-left">
              <div className="flex items-center gap-3 mb-4 md:mb-6 self-center md:self-start">
                <img src={logoMainImg} alt="Logo" className="h-14 w-auto object-contain" />
                <div className="flex flex-col justify-center border-l border-[#1e4696]/30 pl-3">
                  <span className="font-serif text-[#1e4696] font-bold text-xs md:text-sm tracking-wider uppercase leading-none">PHỐ HẠNH PHÚC</span>
                </div>
              </div>
              <h2 className="font-serif font-bold text-[#1e4696] text-xl md:text-2xl lg:text-3xl uppercase leading-tight mb-6 md:mb-8">
                CÙNG NHAU KIẾN TẠO<br />NHỮNG KHỞI ĐẦU HẠNH PHÚC
              </h2>
              <Link to="/explore" className="inline-flex self-center md:self-start items-center gap-3 bg-[#1e4696] text-white rounded-full py-3 px-6 text-[10px] md:text-xs font-bold tracking-widest uppercase hover:bg-[#1e4696] transition-all shadow-md hover:-translate-y-0.5 group">
                KHÁM PHÁ NGAY
                <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-[#1e4696] group-hover:bg-[#b5d9f2]/30 transition-colors">
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
