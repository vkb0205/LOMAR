import React from 'react';
import { ArrowRight, Heart, HeartHandshake, Landmark, Flower2, Building2, HandHeart, Infinity, MapPin, Navigation } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

// Khai báo các custom SVG icons để khớp chuẩn với mockup thiết kế
const DressIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 4V3M10 5.5l2-1.5 2 1.5M12 4l-4 3h8z" />
    <path d="M8 7v4c0 1.5 1 2.5 4 2.5s4-1 4-2.5V7H8z" />
    <path d="M8 11.5L4 21h16l-4-9.5" />
    <path d="M12 13.5V21M9.5 15L8 21M14.5 15l1.5 6" />
  </svg>
);

const MakeupIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="5" y="11" width="5" height="10" rx="1" />
    <path d="M6 11V7l3-1.5V11" />
    <ellipse cx="17" cy="9" rx="3.5" ry="3.5" />
    <ellipse cx="17" cy="17" rx="4" ry="2" />
    <path d="M17 12.5v2.5" />
    <circle cx="17" cy="17" r="1.5" />
  </svg>
);

const CameraIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M14.5 4h-5L8 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-4l-1.5-3z" />
    <circle cx="12" cy="13" r="4" />
    <circle cx="12" cy="13" r="1.5" />
    <circle cx="18.5" cy="9.5" r="0.5" fill="currentColor" />
  </svg>
);

const RingsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <ellipse cx="9.5" cy="14.5" rx="5" ry="3" transform="rotate(-15 9.5 14.5)" />
    <ellipse cx="14.5" cy="11.5" rx="5" ry="3" transform="rotate(15 14.5 11.5)" />
    <path d="M14.5 6.5l1.5 2-1.5 1.5-1.5-1.5z" />
  </svg>
);

const GiftBoxIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="8" width="18" height="4" rx="1" />
    <rect x="5" y="12" width="14" height="9" rx="1" />
    <path d="M12 8v13" />
    <path d="M12 8c-2-2.5-4.5-2.5-4.5.5 0 2 2.5 1.5 4.5.5 2 1 4.5.5 4.5-0.5 0-3-2.5-3-4.5-0.5" />
  </svg>
);

const BouquetIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 21L7 12h10z" />
    <path d="M10.5 14.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 1 1-3 0" />
    <path d="M10 15l-2 3M14 15l2 3" />
    <circle cx="12" cy="7" r="2.5" />
    <circle cx="9" cy="9.5" r="2.5" />
    <circle cx="15" cy="9.5" r="2.5" />
    <circle cx="9.5" cy="6" r="2" />
    <circle cx="14.5" cy="6" r="2" />
    <circle cx="12" cy="7" r="0.5" fill="currentColor" />
    <circle cx="9" cy="9.5" r="0.5" fill="currentColor" />
    <circle cx="15" cy="9.5" r="0.5" fill="currentColor" />
  </svg>
);

const HealthIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    <path d="M6 12h3l1.5-3 2 6 1.5-4 1.5 1h2.5" />
  </svg>
);

// Khai báo một biến cấu hình animation dùng chung để tái sử dụng cho gọn code
const fadeBlurVariant = {
  hidden: { opacity: 0, y: 40, filter: 'blur(10px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)' }
};

import trainImg from '../img/new_bg.jpeg';
import mascotImg from '../img/Mascot.png';
import logoMainImg from '../img/Logo.png';

export default function Home() {
  return (
    <div className="w-full flex flex-col font-sans pb-20 animate-in fade-in duration-500 overflow-hidden relative bg-[#fffdfa]">

      {/* Decorative floral backgrounds - top left and right */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none mix-blend-multiply" />

      {/* =========================================
          1. HERO SECTION 
      ========================================= */}
      <section className="relative w-full min-h-[600px] lg:h-[700px] flex items-center justify-center pt-10 bg-gradient-to-b from-[#fffcf8] via-[#fffbf6] to-[#fbfcfe]">

        {/* Background Butterfly Illustration */}
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

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-8 w-full sm:w-auto"
            >
              <Link to="/explore" className="inline-flex items-center justify-between sm:justify-start gap-3 bg-transparent text-[#12306d] border border-[#12306d] rounded-full py-2.5 md:py-4 px-4 md:px-8 text-[10px] sm:text-xs md:text-sm font-bold tracking-widest uppercase hover:bg-[#12306d]/5 hover:-translate-y-0.5 transition-all shadow-none group w-full sm:w-auto">
                <span>KHÁM PHÁ HÀNH TRÌNH CỦA BẠN</span>
                <div className="w-6 h-6 md:w-7 md:h-7 rounded-full border border-[#12306d] flex items-center justify-center text-[#12306d] transition-colors group-hover:bg-[#12306d]/5 shrink-0">
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            </motion.div>
          </div>

          {/* LỘ TRÌNH HẠNH PHÚC */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-16 lg:mt-24 w-full"
          >
            <div className="flex items-center justify-between overflow-x-auto no-scrollbar py-4 px-2 md:py-6 md:px-2 gap-1 md:gap-2">
              {[
                { title: 'THỜI TRANG', icon: DressIcon, to: '/explore?category=Váy Cưới' },
                { title: 'MAKEUP &\nLÀM ĐẸP', icon: MakeupIcon, to: '/explore?category=Make Up' },
                { title: 'CHỤP ẢNH\nSTUDIO', icon: CameraIcon, to: '/explore?category=Studio' },
                { title: 'TRANG SỨC', icon: RingsIcon, to: '/explore?category=Trang Sức' },
                { title: 'QUÀ TẶNG &\nPHỤ KIỆN', icon: GiftBoxIcon, to: '/explore?category=Thiệp Cưới' },
                { title: 'QUÀ TẶNG &\nPHỤ KIỆN', icon: BouquetIcon, to: '/explore?category=Trang Trí' },
                { title: 'Y TẾ', icon: HealthIcon, to: '/explore?category=Sức Khỏe' }
              ].map((stop, i, arr) => (
                <React.Fragment key={i}>
                  <Link to={stop.to} className="flex flex-col items-center gap-3 group shrink-0 z-10 w-20 md:w-24 hover:-translate-y-1.5 transition-transform duration-300">
                    <div className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center text-[#df9e3a] bg-white border border-[#df9e3a]/60 shadow-sm rounded-full transition-all group-hover:bg-[#df9e3a] group-hover:text-white group-hover:shadow-md group-hover:shadow-[#df9e3a]/30 z-10 relative">
                      <stop.icon className="w-6 h-6 md:w-7 md:h-7 stroke-[1.5]" />
                    </div>
                    <span className="text-[9px] md:text-[10px] font-bold text-[#df9e3a] whitespace-pre-line tracking-wide text-center uppercase leading-tight group-hover:text-[#df9e3a]/80 transition-colors">
                      {stop.title}
                    </span>
                  </Link>

                  {i < arr.length - 1 && (
                    <div className="flex-1 min-w-[15px] md:min-w-[30px] flex items-center shrink-0 mx-1 md:mx-2 z-0 mb-8 md:mb-10">
                      <div className="h-[1px] w-full bg-[#df9e3a]/40 relative flex items-center">
                        <svg viewBox="0 0 24 24" className="absolute -right-1 md:-right-1.5 w-3 h-3 text-[#df9e3a]/60" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </motion.div>

        </div>
      </section>

      {/* =========================================
          2. CÂU CHUYỆN CỦA CHÚNG TÔI SECTION 
      ========================================= */}
      <section className="py-24 px-4 relative z-10 w-full bg-[#ffe9c9]">
        <div className="max-w-[1200px] mx-auto text-center">

          <motion.div
            variants={fadeBlurVariant}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
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
            viewport={{ once: true, margin: "-50px" }}
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
            {[
              { title: 'NGHĨA TÌNH', desc: 'Gắn kết cộng đồng,\nlan tỏa những giá trị tốt đẹp\ntrong văn hóa cưới Việt.', img: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&q=80&w=400', icon: HeartHandshake, color: 'text-[#1e4696]' },
              { title: 'VĂN MINH', desc: 'Chuẩn hóa dịch vụ cưới,\nnâng tầm trải nghiệm\ncho các cặp đôi.', img: 'https://images.unsplash.com/photo-1542042161784-26ab9e041e89?auto=format&fit=crop&q=80&w=400', icon: Landmark, color: 'text-[#1e4696]' },
              { title: 'HIỆN ĐẠI', desc: 'Ứng dụng công nghệ,\ncá nhân hóa hành trình cưới\ntiện lợi và đầy cảm hứng.', img: 'https://images.unsplash.com/photo-1512418490979-92798cec1380?auto=format&fit=crop&q=80&w=400', icon: Navigation, color: 'text-[#3e649b]' },
              { title: 'HẠNH PHÚC', desc: 'Tất cả hướng đến một điều:\nviết nên những khoảnh khắc\ntrọn vẹn và đáng nhớ.', img: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&q=80&w=400', icon: Heart, color: 'text-[#5a96c3]' }
            ].map((pillar, i) => (
              <motion.div
                key={i}
                variants={fadeBlurVariant}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.15 }} // Hiệu ứng delay bậc thang
                className="bg-white rounded-[24px] overflow-hidden shadow-md shadow-[#b5d9f2]/30 border border-[#b5d9f2]/40 flex flex-col items-center hover:shadow-lg transition-shadow min-h-[420px] max-w-[320px] mx-auto w-full group"
              >
                <div className="pt-8 pb-4 px-4 flex flex-col items-center flex-1 w-full">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center text-[#3e649b] mb-4 group-hover:scale-110 transition-transform`}>
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

      {/* =========================================
          3. DẤU ẤN PHÁT TRIỂN SECTION 
      ========================================= */}
      <section className="pt-24 pb-20 px-4 w-full relative bg-white overflow-hidden z-20">

        {/* Background Decorations */}
        {/* <div className="absolute top-10 left-[-60px] opacity-10 pointer-events-none rotate-45">
          <Flower2 className="w-64 h-64 text-[#3e649b]" />
        </div>
        <div className="absolute top-40 right-[-80px] opacity-10 pointer-events-none -rotate-12">
          <Navigation className="w-80 h-80 text-[#3e649b]" />
        </div> */}

        <div className="max-w-[1200px] mx-auto relative z-10">

          <motion.div
            variants={fadeBlurVariant}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
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

            {/* Left Description */}
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

            {/* Right Timeline - Wrapped in a subtle border box */}
            <div className="lg:col-span-3 relative bg-white/40 backdrop-blur-sm border border-[#b5d9f2]/50 rounded-[40px] md:rounded-[60px] p-8 md:p-12 lg:p-16">
              <div className="absolute top-[80px] left-[10%] right-[10%] h-[1px] bg-[#b5d9f2]/50 z-0 hidden md:block"></div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-4 relative z-10">
                {[
                  { year: '1960+', title: 'Hình thành\nvà phát triển\nkhu vực', icon: Landmark },
                  { year: '1990+', title: 'Thiên đường\náo cưới và dịch vụ\ncưới đầu tiên', icon: Flower2 },
                  { year: '2010+', title: 'Nâng tầm chất lượng\ndịch vụ, đa dạng\ntrải nghiệm', icon: Building2 },
                  { year: '2024+', title: 'Ra mắt hệ sinh thái\n"Phố Hạnh Phúc\nHồ Văn Huê"', icon: HeartHandshake },
                ].map((ms, i) => (
                  <motion.div
                    key={i}
                    variants={fadeBlurVariant}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: i * 0.15 }}
                    className="flex flex-col items-center text-center group cursor-default"
                  >
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white border border-[#b5d9f2]/50 flex items-center justify-center text-[#3e649b] mb-6 shrink-0 relative z-10 group-hover:scale-105 transition-transform shadow-sm group-hover:shadow-md group-hover:border-[#1e4696]">
                      <ms.icon className="w-7 h-7 md:w-8 md:h-8 stroke-[1]" />
                    </div>
                    <h3 className="font-serif font-bold text-xl md:text-2xl text-[#1e4696] mb-2 group-hover:text-[#1e4696] transition-colors">{ms.year}</h3>
                    <p className="text-[10px] md:text-[11px] text-[#1e4696] whitespace-pre-line leading-relaxed opacity-70 uppercase font-bold tracking-wider">{ms.title}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>


          {/* Lower Content containing Mascot and Banner */}
          <div className="flex flex-col xl:flex-row gap-8 xl:gap-6 relative z-10 w-full items-center justify-center mt-20">


            {/* Banner */}
            <motion.div
              variants={fadeBlurVariant}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
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
      </section >
    </div >
  );
}
