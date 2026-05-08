import React from 'react';
import { useAppContext } from '../context/AppContext';
import { CheckCircle2, Circle, Gift, HeartPulse, Ticket, ArrowRight, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Dashboard() {
  const { healthCheckCompleted, setHealthCheckCompleted } = useAppContext();

  const toggleHealthCheck = () => {
    setHealthCheckCompleted(!healthCheckCompleted);
  };

  return (
    <div className="w-full flex-1 p-4 md:p-6 lg:p-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Dashboard</h1>
        <p className="text-gray-500">Theo dõi hành trình và quản lý ưu đãi của bạn tại Phố Hạnh Phúc.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: Journey Timeline (Hành trình) */}
        <div className="w-full lg:w-1/2">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <HeartPulse className="w-6 h-6 mr-2 text-rose-500" />
              Hành Trình Của Bạn
            </h2>

            <div className="relative border-l-2 border-gray-100 ml-4 space-y-8 pb-4">
              
              {/* Task 1: Health Check (Interactive) */}
              <div className="relative pl-8">
                <div 
                  className={`absolute -left-[11px] top-1 rounded-full bg-white cursor-pointer transition-transform hover:scale-110 ${healthCheckCompleted ? 'text-green-500' : 'text-gray-300'}`}
                  onClick={toggleHealthCheck}
                >
                  {healthCheckCompleted ? (
                    <CheckCircle2 className="w-5 h-5 fill-current text-white bg-green-500 rounded-full" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </div>
                <div 
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    healthCheckCompleted ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
                  }`}
                  onClick={toggleHealthCheck}
                >
                  <h3 className={`font-bold ${healthCheckCompleted ? 'text-green-800' : 'text-gray-900'}`}>
                    Khám sức khỏe tiền hôn nhân
                  </h3>
                  <p className={`text-sm mt-1 ${healthCheckCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                    Bắt buộc • Đánh dấu hoàn thành để nhận ưu đãi
                  </p>
                </div>
              </div>

              {/* Task 2: Choose Studio (Static) */}
              <div className="relative pl-8 opacity-60">
                <div className="absolute -left-[11px] top-1 rounded-full bg-white text-gray-300">
                  <Circle className="w-5 h-5" />
                </div>
                <div className="p-4 rounded-2xl border border-gray-200 bg-white">
                  <h3 className="font-bold text-gray-900">Chọn Studio Chụp Ảnh</h3>
                  <p className="text-sm mt-1 text-gray-500">Tham khảo tại Khám phá</p>
                </div>
              </div>

              {/* Task 3: Book Restaurant (Static) */}
              <div className="relative pl-8 opacity-60">
                <div className="absolute -left-[11px] top-1 rounded-full bg-white text-gray-300">
                  <Circle className="w-5 h-5" />
                </div>
                <div className="p-4 rounded-2xl border border-gray-200 bg-white">
                  <h3 className="font-bold text-gray-900">Đặt Nhà Hàng Tiệc Cưới</h3>
                  <p className="text-sm mt-1 text-gray-500">Nên đặt trước 6 tháng</p>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Right Column: Voucher Wallet (Ưu đãi) */}
        <div className="w-full lg:w-1/2">
          <div className="bg-gray-900 rounded-3xl shadow-lg p-6 md:p-8 text-white h-full relative overflow-hidden">
            {/* Background embellishment */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500 rounded-full blur-3xl opacity-20 -mr-20 -mt-20"></div>
            
            <h2 className="text-xl font-bold mb-6 flex items-center relative z-10">
              <Gift className="w-6 h-6 mr-2 text-rose-400" />
              Ví Ưu Đãi
            </h2>

            <div className="space-y-4 relative z-10 w-full overflow-hidden">
              <AnimatePresence mode="popLayout">
                {/* Magic Moment Voucher - Fully rendered and animates to open state */}
                {healthCheckCompleted ? (
                  <motion.div
                    key="unlocked-voucher"
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: 'spring', bounce: 0.5 }}
                    className="bg-gradient-to-r from-rose-500 to-orange-500 p-[2px] rounded-2xl w-full"
                  >
                    <div className="bg-white rounded-[14px] p-5 text-gray-900 flex items-center relative overflow-hidden">
                      <div className="absolute -left-3 -top-3 w-16 h-16 bg-rose-100 rounded-full blur-xl opacity-50"></div>
                      <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0 relative z-10">
                        <Ticket className="w-6 h-6 text-rose-600" />
                      </div>
                      <div className="flex-1 relative z-10">
                        <span className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-1 block">Đã Mở Khóa</span>
                        <h3 className="font-bold text-lg leading-tight">Giảm 20% Thuê Váy Cưới</h3>
                        <p className="text-sm text-gray-500 mt-1">Áp dụng cho tất cả Studio trên phố</p>
                      </div>
                      <button className="ml-4 w-10 h-10 bg-rose-600 text-white rounded-full flex items-center justify-center transition-transform hover:scale-110 flex-shrink-0 relative z-10">
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="locked-voucher"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-gray-800/50 backdrop-blur border border-gray-700/50 p-5 rounded-2xl w-full flex items-center text-gray-400"
                  >
                    <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <Lock className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-300 text-lg leading-tight">Voucher Bí Mật</h3>
                      <p className="text-sm mt-1">Hoàn thành "Khám sức khỏe" để mở khóa</p>
                    </div>
                  </motion.div>
                )}
                
                {/* Standard Voucher */}
                <motion.div layout className="bg-gray-800 border border-gray-700 p-5 rounded-2xl flex items-center transition-all hover:bg-gray-700 w-full">
                  <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <Ticket className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-lg leading-tight">Tặng Gói Quay Phóng Sự Mini</h3>
                    <p className="text-sm text-gray-400 mt-1">Khi đặt nhà hàng tiệc cưới</p>
                  </div>
                </motion.div>

              </AnimatePresence>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
