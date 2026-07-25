import { Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import trainImg from '../../../assets/images/new_bg.jpeg';
import { journeyStops } from '../content';

export function HeroSection() {
  return (
    <section className="relative w-full min-h-[600px] lg:h-[700px] flex items-center justify-center pt-10 bg-gradient-to-b from-[#fffcf8] via-[#fffbf6] to-[#fbfcfe]">
      <div className="absolute inset-0 flex justify-center items-end pointer-events-none z-0 overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(242,191,200,0.2),_transparent_45%),radial-gradient(circle_at_bottom,_rgba(181,217,242,0.2),_transparent_55%)]">
        <img
          src={trainImg}
          alt="Butterfly Background"
          className="w-full h-full object-cover object-right md:object-cover opacity-95 scale-100 origin-bottom"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#fffdfa]/50 via-white/10 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#fffdfa]/40 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-[1200px] mx-auto px-4 flex flex-col h-full justify-center pb-12 md:pb-20">
        <div className="relative flex flex-col items-start lg:text-left mb-8 lg:mb-0 w-full lg:w-2/3 translate-y-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-[#12306d] leading-[1.25] tracking-tight uppercase"
          >
            HẠNH PHÚC <br />
            <span className="font-serif italic text-2xl sm:text-4xl lg:text-5xl text-[#df9e3a] normal-case tracking-normal font-medium">
              không phải là đích đến
            </span><br />
            MÀ LÀ HÀNH TRÌNH
          </motion.h1>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-5 w-1/3 md:w-1/4 flex items-center">
            <div className="h-[1px] bg-[#df9e3a]/80 flex-1"></div>
            <Heart className="w-3.5 h-3.5 text-[#df9e3a] mx-2 fill-[#df9e3a]" />
            <div className="h-[1px] bg-[#df9e3a]/80 flex-1"></div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-8 w-full sm:w-auto">
            <Link to="/explore" className="inline-flex items-center justify-between sm:justify-start gap-3 bg-transparent text-[#12306d] border border-[#12306d] rounded-full py-2.5 md:py-4 px-4 md:px-8 text-[10px] sm:text-xs md:text-sm font-bold tracking-widest uppercase hover:bg-[#12306d]/5 hover:-translate-y-0.5 transition-all shadow-none group w-full sm:w-auto">
              <span>KHÁM PHÁ HÀNH TRÌNH CỦA BẠN</span>
              <div className="w-6 h-6 md:w-7 md:h-7 rounded-full border border-[#12306d] flex items-center justify-center text-[#12306d] transition-colors group-hover:bg-[#12306d]/5 shrink-0">
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }} className="mt-16 lg:mt-24 w-full">
          <div className="flex items-center justify-between overflow-x-auto no-scrollbar py-4 px-2 md:py-6 md:px-2 gap-1 md:gap-2">
            {journeyStops.map((stop, index, stops) => (
              <div className="contents" key={stop.to}>
                <Link to={stop.to} className="flex flex-col items-center gap-3 group shrink-0 z-10 w-20 md:w-24 hover:-translate-y-1.5 transition-transform duration-300">
                  <div className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center text-[#df9e3a] bg-white border border-[#df9e3a]/60 shadow-sm rounded-full transition-all group-hover:bg-[#df9e3a] group-hover:text-white group-hover:shadow-md group-hover:shadow-[#df9e3a]/30 z-10 relative">
                    <stop.icon className="w-6 h-6 md:w-7 md:h-7 stroke-[1.5]" />
                  </div>
                  <span className="text-[9px] md:text-[10px] font-bold text-[#df9e3a] whitespace-pre-line tracking-wide text-center uppercase leading-tight group-hover:text-[#df9e3a]/80 transition-colors">
                    {stop.title}
                  </span>
                </Link>

                {index < stops.length - 1 && (
                  <div className="flex-1 min-w-[15px] md:min-w-[30px] flex items-center shrink-0 mx-1 md:mx-2 z-0 mb-8 md:mb-10">
                    <div className="h-[1px] w-full bg-[#df9e3a]/40 relative flex items-center">
                      <svg viewBox="0 0 24 24" className="absolute -right-1 md:-right-1.5 w-3 h-3 text-[#df9e3a]/60" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
