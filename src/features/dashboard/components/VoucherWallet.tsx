import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Gift, Lock, Ticket } from 'lucide-react';
import { DashboardTask, DashboardVoucher } from '../types';

interface VoucherWalletProps {
  loading: boolean;
  tasks: DashboardTask[];
  vouchers: DashboardVoucher[];
}

export function VoucherWallet({ loading, tasks, vouchers }: VoucherWalletProps) {
  return (
    <div className="bg-gray-900 rounded-3xl shadow-xl p-6 md:p-8 text-white h-full relative overflow-hidden min-h-[500px]">
      <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500 rounded-full blur-3xl opacity-20 -mr-20 -mt-20" />

      <h2 className="text-xl font-bold mb-6 flex items-center relative z-10 font-serif">
        <Gift className="w-6 h-6 mr-2 text-rose-400" />
        Ví Ưu Đãi Của Bạn
      </h2>

      <div className="space-y-4 relative z-10 w-full overflow-hidden">
        {loading && (
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm z-20 flex items-center justify-center rounded-3xl">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-400" />
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {vouchers.map(voucher => (
            <VoucherCard key={voucher.voucherId} tasks={tasks} voucher={voucher} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

interface VoucherCardProps {
  tasks: DashboardTask[];
  voucher: DashboardVoucher;
}

function VoucherCard({ tasks, voucher }: VoucherCardProps) {
  const isUnlocked = voucher.status === 'unlocked' || voucher.status === 'redeemed';

  if (voucher.requiredTaskId && !isUnlocked) {
    return <LockedVoucherCard tasks={tasks} voucher={voucher} />;
  }

  return <UnlockedVoucherCard voucher={voucher} />;
}

function LockedVoucherCard({ tasks, voucher }: VoucherCardProps) {
  const requiredTaskName = tasks.find(task => task.taskId === voucher.requiredTaskId)?.name || 'nhiệm vụ';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-gray-800/50 backdrop-blur border border-gray-700/50 p-5 rounded-2xl w-full flex items-center text-gray-400 shadow-inner animate-in fade-in duration-300"
    >
      <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mr-4 flex-shrink-0 border border-gray-700/30">
        <Lock className="w-5 h-5 text-gray-500" />
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-gray-300 text-sm leading-tight">Voucher Bí Mật</h3>
        <p className="text-[10px] mt-1 text-gray-500 font-medium">
          Hoàn thành "{requiredTaskName}" để mở khóa
        </p>
      </div>
    </motion.div>
  );
}

interface UnlockedVoucherCardProps {
  voucher: DashboardVoucher;
}

function UnlockedVoucherCard({ voucher }: UnlockedVoucherCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', bounce: 0.5 }}
      layout
      className={voucher.requiredTaskId ? 'bg-gradient-to-r from-rose-500 to-orange-500 p-[1.5px] rounded-2xl w-full shadow-lg' : 'bg-gray-800 border border-gray-700 p-5 rounded-2xl flex items-center transition-all hover:bg-gray-700 w-full shadow-md'}
    >
      {voucher.requiredTaskId ? (
        <div className="bg-white rounded-[14px] p-5 text-gray-900 flex items-center relative overflow-hidden w-full">
          <div className="absolute -left-3 -top-3 w-16 h-16 bg-rose-100 rounded-full blur-xl opacity-50" />
          <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0 relative z-10">
            <Ticket className="w-6 h-6 text-rose-600" />
          </div>
          <div className="flex-1 relative z-10 pr-2">
            <span className="text-[9px] font-extrabold text-rose-600 uppercase tracking-widest mb-1 block">Đã Mở Khóa</span>
            <h3 className="font-bold text-sm leading-tight text-[#1B2C40] font-serif">{voucher.title}</h3>
            <p className="text-[10px] text-gray-500 mt-1 font-medium">Áp dụng cho tất cả dịch vụ tương ứng trên phố</p>
          </div>
          <button className="ml-2 w-9 h-9 bg-rose-600 text-white rounded-full flex items-center justify-center transition-transform hover:scale-105 hover:bg-rose-500 flex-shrink-0 relative z-10 shadow-md active:scale-95">
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <>
          <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
            <Ticket className="w-5 h-5 text-gray-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-white text-sm leading-tight">{voucher.title}</h3>
            <p className="text-[10px] text-gray-400 mt-1 font-medium">{voucher.discountValue}</p>
          </div>
        </>
      )}
    </motion.div>
  );
}
