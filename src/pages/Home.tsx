import React from 'react';
import { ArrowRight, Landmark, Navigation, HeartHandshake, Gift, Heart, MapPin, Search, Bot, Building2, HandHeart, Flower2, Infinity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

// Khai báo một biến cấu hình animation dùng chung để tái sử dụng cho gọn code
const fadeBlurVariant = {
  hidden: { opacity: 0, y: 40, filter: 'blur(10px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)' }
};

import trainImg from '../img/train_marriage.jpeg';


export default function Home() {
  return (
    <div className="w-full flex flex-col font-sans mb-20 animate-in fade-in duration-500 overflow-hidden relative bg-[#FAF6EE]">

      {/* Decorative floral backgrounds - top left and right */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none mix-blend-multiply" />

      {/* =========================================
          1. HERO SECTION 
      ========================================= */}
      <section className="relative w-full min-h-[600px] lg:h-[700px] flex items-center justify-center pt-10">

        {/* Background Đoàn Tàu */}
        <div className="absolute inset-0 flex justify-center items-end pointer-events-none z-0 overflow-hidden">
          <img
            src={trainImg}
            alt="Train Outline"
            className="w-full h-full object-cover object-bottom md:object-center opacity-100 mix-blend-multiply -translate-y-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-white/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-white/50 md:to-white/80" />
        </div>

        <div className="relative z-10 w-full max-w-[1200px] mx-auto px-4 flex flex-col h-full justify-center pb-24 md:pb-32">

          <div className="relative flex flex-col items-start lg:text-left mb-8 lg:mb-0 w-full lg:w-2/3 translate-y-15">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-[#1B2C40] leading-[1.2] tracking-tight uppercase"
            >
              HẠNH PHÚC <br />
              <span className="font-serif italic text-4xl sm:text-5xl lg:text-5xl text-[#F2BFC8] normal-case tracking-normal">
                không phải là đích đến
              </span><br />
              MÀ LÀ HÀNH TRÌNH
            </motion.h1>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-6 w-1/2 md:w-1/3 flex items-center">
              <div className="h-px bg-rose-200 flex-1"></div>
              <Heart className="w-4 h-4 text-rose-300 mx-2 fill-current" />
              <div className="h-px bg-rose-200 flex-1"></div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-8"
            >
              <Link to="/explore" className="inline-flex items-center gap-3 bg-white text-[#1B2C40] border border-rose-200 rounded-full py-3 md:py-4 px-6 md:px-8 text-xs md:text-sm font-bold tracking-widest uppercase hover:bg-[#F2BFC8] hover:text-white hover:border-[#F2BFC8] hover:-translate-y-1 transition-all shadow-sm hover:shadow-md hover:shadow-rose-200 group">
                Khám phá hành trình của bạn
                <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-rose-50 flex items-center justify-center text-rose-400 group-hover:bg-white group-hover:text-[#F2BFC8] transition-colors">
                  <ArrowRight className="w-3 h-3 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </motion.div>
          </div>

          {/* LỘ TRÌNH HẠNH PHÚC */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-20 lg:mt-24 w-full"
          >
            <div className="inline-flex items-center justify-between lg:justify-start overflow-x-auto no-scrollbar py-4 px-2 md:py-6 md:px-2">
              {[
                { title: 'GA\nVĂN MINH', icon: Landmark, to: '/dashboard?station=T01' },
                { title: 'GA\nHIỆN ĐẠI', icon: Building2, to: '/dashboard?station=T02' },
                { title: 'GA\nNGHĨA TÌNH', icon: HandHeart, to: '/dashboard?station=T03' },
                { title: 'GA\nTRI ÂN', icon: Flower2, to: '/dashboard?station=T04' },
                { title: 'GA\nHẸN VÀ HÔN', icon: Infinity, to: '/dashboard' }
              ].map((stop, i, arr) => (
                <React.Fragment key={i}>
                  <Link to={stop.to} className="flex flex-col items-center gap-3 group shrink-0 z-10 w-20 md:w-24 hover:-translate-y-2 transition-transform duration-300">
                    <div className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center text-[#6B92B4] bg-white border border-rose-100 shadow-sm rounded-full transition-all group-hover:bg-[#F2BFC8] group-hover:text-white group-hover:shadow-md group-hover:shadow-rose-200 group-hover:border-[#F2BFC8] z-10 relative">
                      <stop.icon className="w-6 h-6 md:w-7 md:h-7 stroke-[1.5]" />
                    </div>
                    <span className="text-[9px] md:text-[11px] font-bold text-[#1B2C40] whitespace-pre-line tracking-wide text-center uppercase leading-tight group-hover:text-rose-400 transition-colors">
                      {stop.title}
                    </span>
                  </Link>

                  {i < arr.length - 1 && (
                    <div className="flex-1 min-w-[20px] md:min-w-[40px] flex items-center shrink-0 mx-2 md:mx-4 z-0 mb-8 md:mb-10">
                      <div className="h-[1px] w-full bg-rose-300/50 relative flex items-center">
                        <ArrowRight className="absolute -right-1 md:-right-2 w-3 h-3 md:w-4 md:h-4 text-rose-400 stroke-[1.5]" />
                      </div>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-4 md:mt-10 flex items-center text-[#6B92B4] font-bold text-[10px] md:text-xs tracking-widest uppercase"
          >
            <div className="w-6 h-6 rounded-full bg-rose-50 flex items-center justify-center mr-2">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
            </div>
            PHƯỜNG ĐỨC NHUẬN, TP. HỒ CHÍ MINH
          </motion.div>

        </div>
      </section>

      {/* =========================================
          2. CÂU CHUYỆN CỦA CHÚNG TÔI SECTION 
      ========================================= */}
      <section className="py-24 px-4 relative z-10 w-full bg-white">
        <div className="max-w-[1200px] mx-auto text-center">

          <motion.div
            variants={fadeBlurVariant}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center mb-4 gap-2 md:gap-4"
          >
            <div className="h-px bg-rose-200 w-10 md:w-16"></div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-[#1B2C40] uppercase">
              CÂU CHUYỆN <span className="text-[#F2BFC8]">CỦA CHÚNG TÔI</span>
            </h2>
            <div className="h-px bg-rose-200 w-10 md:w-16"></div>
          </motion.div>

          <motion.div
            variants={fadeBlurVariant}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Heart className="w-4 h-4 text-rose-200 mx-auto fill-current mb-6" />
            <p className="max-w-3xl mx-auto text-[#1B2C40] text-sm md:text-base leading-relaxed mb-16 px-4 md:px-0">
              Hồ Văn Huê – con phố mang tên một vị chí sĩ yêu nước – hôm nay tiếp tục sứ mệnh
              kết nối yêu thương theo cách rất riêng: trở thành "<strong>Phố Hạnh Phúc</strong>" – hệ sinh thái cưới
              đầu tiên được xây dựng với tinh thần hiện đại, văn minh và nghĩa tình.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'NGHĨA TÌNH', desc: 'Gắn kết cộng đồng,\nlan tỏa những giá trị tốt đẹp\ntrong văn hóa cưới Việt.', img: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&q=80&w=400', icon: HeartHandshake, color: 'text-[#1B2C40]' },
              { title: 'VĂN MINH', desc: 'Chuẩn hóa dịch vụ cưới,\nnâng tầm trải nghiệm\ncho các cặp đôi.', img: 'https://images.unsplash.com/photo-1542042161784-26ab9e041e89?auto=format&fit=crop&q=80&w=400', icon: Landmark, color: 'text-[#F2BFC8]' },
              { title: 'HIỆN ĐẠI', desc: 'Ứng dụng công nghệ,\ncá nhân hóa hành trình cưới\ntiện lợi và đầy cảm hứng.', img: 'https://images.unsplash.com/photo-1512418490979-92798cec1380?auto=format&fit=crop&q=80&w=400', icon: Navigation, color: 'text-[#1B2C40]' },
              { title: 'HẠNH PHÚC', desc: 'Tất cả hướng đến một điều:\nviết nên những khoảnh khắc\ntrọn vẹn và đáng nhớ.', img: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&q=80&w=400', icon: Heart, color: 'text-[#F2BFC8]' }
            ].map((pillar, i) => (
              <motion.div
                key={i}
                variants={fadeBlurVariant}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.15 }} // Hiệu ứng delay bậc thang
                className="bg-white rounded-[24px] overflow-hidden shadow-md shadow-rose-100/50 border border-rose-50 flex flex-col items-center hover:shadow-lg transition-shadow min-h-[420px] max-w-[320px] mx-auto w-full group"
              >
                <div className="pt-8 pb-4 px-4 flex flex-col items-center flex-1 w-full">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center text-rose-300 mb-4 group-hover:scale-110 transition-transform`}>
                    <pillar.icon className="w-10 h-10 stroke-[1.5]" />
                  </div>
                  <h3 className={`font-serif font-bold text-xl mb-3 ${pillar.color}`}>{pillar.title}</h3>
                  <p className="text-[#1B2C40] text-xs leading-relaxed whitespace-pre-line text-center">{pillar.desc}</p>
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
      <section className="pt-24 pb-20 px-4 w-full relative bg-[#FAF6EE] overflow-hidden z-20">

        {/* Background Decorations */}
        {/* <div className="absolute top-10 left-[-60px] opacity-10 pointer-events-none rotate-45">
          <Flower2 className="w-64 h-64 text-rose-300" />
        </div>
        <div className="absolute top-40 right-[-80px] opacity-10 pointer-events-none -rotate-12">
          <Navigation className="w-80 h-80 text-rose-300" />
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
              <div className="h-[1px] bg-rose-200 flex-1"></div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-[#1B2C40] uppercase">
                DẤU ẤN <span className="text-[#F2BFC8]">PHÁT TRIỂN</span>
              </h2>
              <div className="h-[1px] bg-rose-200 flex-1"></div>
            </div>
            <Heart className="w-3 h-3 text-rose-300 mt-4 fill-current" />
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
              <p className="text-[#1B2C40] text-sm md:text-base leading-relaxed font-serif italic opacity-80">
                Từ một con phố với bề dày lịch sử, Hồ Văn Huê không ngừng chuyển mình để trở thành điểm đến cưới hàng đầu của các cặp đôi tại <span className="text-[#F2BFC8] font-bold not-italic">TP.HCM.</span>
              </p>
            </motion.div>

            {/* Right Timeline - Wrapped in a subtle border box */}
            <div className="lg:col-span-3 relative bg-white/40 backdrop-blur-sm border border-rose-100 rounded-[40px] md:rounded-[60px] p-8 md:p-12 lg:p-16">
              <div className="absolute top-[80px] left-[10%] right-[10%] h-[1px] bg-rose-200 z-0 hidden md:block"></div>

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
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white border border-rose-100 flex items-center justify-center text-rose-300 mb-6 shrink-0 relative z-10 group-hover:scale-105 transition-transform shadow-sm group-hover:shadow-md group-hover:border-rose-200">
                      <ms.icon className="w-7 h-7 md:w-8 md:h-8 stroke-[1]" />
                    </div>
                    <h3 className="font-serif font-bold text-xl md:text-2xl text-[#1B2C40] mb-2 group-hover:text-[#F2BFC8] transition-colors">{ms.year}</h3>
                    <p className="text-[10px] md:text-[11px] text-[#1B2C40] whitespace-pre-line leading-relaxed opacity-70 uppercase font-bold tracking-wider">{ms.title}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>


          {/* Lower Content containing Mascot and Banner */}
          <div className="flex flex-col xl:flex-row gap-8 xl:gap-6 relative z-10 w-full items-center justify-center mt-20">

            {/* Mascot & Chat card */}
            {/* <motion.div
              variants={fadeBlurVariant}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7 }}
              className="flex flex-col sm:flex-row items-center sm:items-start gap-4 bg-white rounded-[32px] p-6 sm:p-8 xl:mr-[-80px] border border-rose-100 shadow-md relative z-20 shrink-0 w-full max-w-full sm:max-w-[450px] mt-12 sm:mt-0"
            >
              <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full flex shrink-0 -mt-16 sm:mt-0 sm:-ml-20 overflow-hidden items-center justify-center relative bg-[#FAF6EE] border-4 border-white shadow-inner self-center sm:self-center">
                <Bot className="w-16 h-16 md:w-20 md:h-20 text-rose-400 relative z-10" />
              </div>

              <div className="flex flex-col flex-1 pl-0 sm:pl-2 md:pl-4 text-center sm:text-left mt-2 sm:mt-0">
                <h3 className="font-serif font-bold text-[#1B2C40] text-lg leading-tight uppercase mb-1">BÉ SONG HỶ</h3>
                <p className="text-sm text-[#F2BFC8] font-serif italic mb-4">Đồng hành cùng bạn</p>
                <ul className="space-y-3 mb-6">
                  {[
                    { text: 'Gợi ý dịch vụ phù hợp', icon: Heart },
                    { text: 'Giải đáp thắc mắc 24/7', icon: Search },
                    { text: 'Chia sẻ kinh nghiệm', icon: Navigation }
                  ].map((item, i) => (
                    <li key={i} className="flex items-center justify-center sm:justify-start text-[11px] text-[#1B2C40] font-bold">
                      <span className="w-5 h-5 rounded-full border border-rose-200 flex items-center justify-center mr-2 text-rose-400 bg-[#FAF6EE] shrink-0">
                        <item.icon className="w-3 h-3" />
                      </span>
                      {item.text}
                    </li>
                  ))}
                </ul>

                <button className="flex items-center justify-center sm:justify-between w-full gap-4 bg-[#F2BFC8] text-white rounded-full py-3 px-5 text-[10px] font-bold tracking-widest uppercase hover:bg-rose-400 transition-all shadow-md hover:-translate-y-0.5 group">
                  CHAT VỚI BÉ SONG HỶ
                  <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-[#F2BFC8] group-hover:bg-rose-50 transition-colors">
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </button>
              </div>
            </motion.div> */}

            {/* Banner */}
            <motion.div
              variants={fadeBlurVariant}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="flex-1 w-full max-w-[800px] bg-white rounded-[32px] overflow-hidden relative shadow-md border border-rose-100 min-h-[300px] md:min-h-[350px]"
            >
              <img src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=1200" alt="Phố" className="absolute inset-0 w-full h-full object-cover opacity-70 hover:scale-105 transition-transform duration-1000" />
              <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-white/95 via-white/80 to-transparent md:to-transparent" />
              <div className="relative z-10 p-6 sm:p-12 flex flex-col justify-end md:justify-center h-full w-full md:w-2/3 xl:pl-32 items-center text-center md:items-start md:text-left">
                <div className="inline-block border-y border-[#1B2C40] py-2 px-4 md:px-6 mb-4 md:mb-6 self-center md:self-start">
                  <p className="font-serif text-[#1B2C40] font-bold text-xs md:text-sm tracking-widest uppercase leading-tight">PHỐ HẠNH PHÚC<br />HỒ VĂN HUÊ</p>
                </div>
                <h2 className="font-serif font-bold text-[#1B2C40] text-xl md:text-2xl lg:text-3xl uppercase leading-tight mb-6 md:mb-8">
                  CÙNG NHAU KIẾN TẠO<br />NHỮNG KHỞI ĐẦU HẠNH PHÚC
                </h2>
                <Link to="/explore" className="inline-flex self-center md:self-start items-center gap-3 bg-[#F2BFC8] text-white rounded-full py-3 px-6 text-[10px] md:text-xs font-bold tracking-widest uppercase hover:bg-rose-400 transition-all shadow-md hover:-translate-y-0.5 group">
                  KHÁM PHÁ NGAY
                  <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-[#F2BFC8] group-hover:bg-rose-50 transition-colors">
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
