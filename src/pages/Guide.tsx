import React, { useState } from 'react';
import { BookOpen, Calendar, CheckCircle2, ChevronRight, Download, Heart, PlayCircle } from 'lucide-react';
import { motion } from 'motion/react';

const fadeVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const timelineData = [
  {
    phase: '9-12 Tháng Trước',
    tasks: [
      'Xác định ngân sách và lập kế hoạch tài chính',
      'Lên danh sách khách mời dự kiến',
      'Chọn ngày giờ tổ chức (xem ngày tốt)',
      'Tìm kiếm và đặt cọc Venue (Địa điểm tổ chức)'
    ]
  },
  {
    phase: '6-8 Tháng Trước',
    tasks: [
      'Chọn concept và phong cách trang trí',
      'Thử và đặt may/thuê Váy cưới & Vest',
      'Booking Photographer/Videographer',
      'Khám sức khỏe tiền hôn nhân'
    ]
  },
  {
    phase: '3-5 Tháng Trước',
    tasks: [
      'Chốt danh sách khách mời và in thiệp',
      'Lên thực đơn tiệc cưới',
      'Mua nhẫn cưới và trang sức',
      'Chụp ảnh cưới Pre-wedding'
    ]
  },
  {
    phase: '1-2 Tháng Trước',
    tasks: [
      'Gửi thiệp cưới đến khách mời',
      'Thử lại trang phục cưới',
      'Chốt kịch bản chương trình với MC',
      'Spa chăm sóc da và làm đẹp'
    ]
  }
];

export default function Guide() {
  const [activePhase, setActivePhase] = useState(0);

  return (
    <div className="w-full flex flex-col font-sans mb-20 bg-[#FEF6F7] min-h-screen">
      
      {/* Hero Section */}
      <div className="relative w-full h-[400px] flex items-center justify-center overflow-hidden bg-[#1D3557]">
        <img 
          src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=2000" 
          alt="Wedding Guide" 
          className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1D3557] to-transparent" />
        
        <div className="relative z-10 text-center px-4 max-w-3xl flex flex-col items-center">
          <motion.div
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-center text-rose-300 mb-6"
          >
            <BookOpen className="w-8 h-8" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-6 uppercase tracking-widest leading-tight"
          >
            WEDDING GUIDE
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-rose-100/90 text-sm md:text-base font-medium leading-relaxed"
          >
            Cẩm nang toàn diện giúp bạn chuẩn bị cho ngày trọng đại một cách hoàn hảo nhất.
            Mọi thứ bạn cần biết đều có ở đây.
          </motion.p>
        </div>
      </div>

      <div className="max-w-[1200px] w-full mx-auto px-4 mt-[-40px] relative z-20 flex flex-col lg:flex-row gap-8">
         
         {/* Main Checklist Column */}
         <div className="flex-1 bg-white rounded-[32px] shadow-sm border border-rose-100 p-8 md:p-10">
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-rose-100">
               <div>
                 <h2 className="text-2xl font-serif font-bold text-[#1D3557] uppercase tracking-widest mb-2">Checklist Chuẩn Bị</h2>
                 <p className="text-[#5D7B9A] text-xs font-medium">Lộ trình chi tiết cho đám cưới trong mơ</p>
               </div>
               <button className="hidden sm:flex items-center gap-2 bg-rose-50 text-rose-500 hover:bg-rose-100 transition-colors px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest">
                  <Download className="w-4 h-4" /> Tải PDF
               </button>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
               {/* Phase Selector */}
               <div className="w-full md:w-48 flex flex-col gap-3 shrink-0">
                  {timelineData.map((data, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActivePhase(idx)}
                      className={`text-left px-5 py-4 rounded-2xl transition-all border ${
                        activePhase === idx 
                          ? 'bg-[#1D3557] text-white border-[#1D3557] shadow-md' 
                          : 'bg-white text-[#5D7B9A] border-rose-100 hover:border-[#1D3557] hover:text-[#1D3557]'
                      }`}
                    >
                      <span className="block text-[10px] font-bold uppercase tracking-widest mb-1 opacity-80">Giai đoạn {idx + 1}</span>
                      <span className="block text-sm font-bold">{data.phase}</span>
                    </button>
                  ))}
               </div>

               {/* Tasks List */}
               <motion.div 
                 key={activePhase}
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 className="flex-1 bg-[#FFF9FA] rounded-2xl border border-rose-50 p-6 md:p-8"
               >
                 <div className="flex items-center gap-3 mb-6">
                    <Calendar className="w-6 h-6 text-[#F494A2]" />
                    <h3 className="text-xl font-serif font-bold text-[#1D3557]">{timelineData[activePhase].phase}</h3>
                 </div>
                 
                 <div className="space-y-4">
                    {timelineData[activePhase].tasks.map((task, idx) => (
                      <div key={idx} className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm border border-rose-50 group cursor-pointer hover:border-rose-200 transition-colors">
                         <div className="mt-0.5 text-rose-300 group-hover:text-[#F494A2] transition-colors">
                           <CheckCircle2 className="w-5 h-5" />
                         </div>
                         <p className="text-[#1D3557] text-sm font-medium leading-relaxed pt-0.5">{task}</p>
                      </div>
                    ))}
                 </div>
               </motion.div>
            </div>
         </div>

         {/* Right Sidebar */}
         <aside className="lg:w-[380px] flex flex-col gap-6 shrink-0">
            
            {/* Featured Article */}
            <div className="bg-white rounded-[32px] shadow-sm border border-rose-100 overflow-hidden flex flex-col group cursor-pointer">
               <div className="h-48 w-full relative overflow-hidden">
                 <img 
                   src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=600" 
                   alt="Wedding Tip" 
                   className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                 />
                 <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-[#1D3557] uppercase tracking-widest">
                    Mẹo Hay
                 </div>
               </div>
               <div className="p-6">
                 <h3 className="font-serif font-bold text-lg text-[#1D3557] mb-3 leading-tight group-hover:text-[#F494A2] transition-colors">
                   5 Lưu ý quan trọng khi chọn địa điểm tổ chức tiệc cưới
                 </h3>
                 <p className="text-[#5D7B9A] text-xs leading-relaxed mb-4 line-clamp-2">
                   Đừng vội đặt cọc ngay nếu bạn chưa kiểm tra kỹ các yếu tố về không gian, âm thanh, ánh sáng và bãi đỗ xe...
                 </p>
                 <button className="flex items-center text-[#F494A2] text-[10px] font-bold uppercase tracking-widest hover:text-rose-500 transition-colors">
                    ĐỌC TIẾP <ChevronRight className="w-4 h-4 ml-1" />
                 </button>
               </div>
            </div>

            {/* Video Tutorial */}
            <div className="bg-[#1D3557] rounded-[32px] shadow-sm overflow-hidden flex flex-col relative p-8">
               <div className="absolute right-[-20px] top-[-20px] w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />
               <div className="absolute left-[-20px] bottom-[-20px] w-40 h-40 bg-rose-400/20 rounded-full blur-2xl pointer-events-none" />
               
               <div className="relative z-10 flex flex-col items-center text-center h-full justify-center">
                  <h3 className="text-white font-serif font-bold text-xl mb-2">Khóa Học Mini</h3>
                  <p className="text-white/70 text-xs mb-8">Hành trang cho cô dâu tương lai</p>
                  
                  <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center cursor-pointer hover:bg-white/20 hover:scale-110 transition-all border border-white/20 mb-6">
                     <PlayCircle className="w-10 h-10 text-white" strokeWidth={1.5} />
                  </div>
                  
                  <button className="w-full py-3 bg-[#F494A2] text-white rounded-full font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-rose-500/30 hover:-translate-y-0.5 hover:bg-rose-400 transition-all">
                    XEM VIDEO NGAY
                  </button>
               </div>
            </div>

         </aside>

      </div>

    </div>
  );
}
