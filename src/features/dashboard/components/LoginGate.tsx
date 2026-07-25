import { ArrowRight, Lock } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { DemoLoginAccount } from '../types';

const DEMO_LOGIN_ACCOUNTS: DemoLoginAccount[] = [
  {
    label: 'Cô dâu Quỳnh Anh',
    email: 'quynhanh.bride@demo.com',
    password: 'demo-password',
  },
  {
    label: 'Chú rể Gia Bảo',
    email: 'giabao.groom@demo.com',
    password: 'demo-password',
  },
];

interface LoginGateProps {
  onDemoSignIn: (email: string, password: string) => void;
}

export function LoginGate({ onDemoSignIn }: LoginGateProps) {
  return (
    <div className="w-full flex-1 min-h-[70vh] flex flex-col items-center justify-center p-4 md:p-6 lg:p-8 bg-[#fffdfa] relative overflow-hidden">
      <div className="absolute top-10 right-10 w-96 h-96 bg-rose-50 rounded-full blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#b5d9f2]/10 rounded-full blur-3xl opacity-60 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', bounce: 0.3 }}
        className="w-full max-w-md bg-white rounded-[32px] border border-rose-100/50 p-8 shadow-xl text-center relative z-10"
      >
        <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 text-[#F2BFC8] border border-rose-100/40">
          <Lock className="w-8 h-8 animate-bounce" />
        </div>

        <h2 className="text-2xl font-bold font-serif text-[#1B2C40] mb-2 uppercase tracking-wide">
          Hành Trình Của Riêng Bạn
        </h2>
        <p className="text-xs text-gray-500 leading-relaxed mb-8">
          Vui lòng đăng nhập để lưu trữ tiến độ chuẩn bị cưới, mở khóa voucher ưu đãi độc quyền và quản lý phong cách lễ cưới của riêng bạn.
        </p>

        <div className="space-y-4">
          <Link
            to="/login?redirect=/dashboard"
            className="w-full bg-[#1B2C40] hover:bg-[#F2BFC8] text-white py-3.5 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Đăng Nhập Ngay</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <div className="pt-6 border-t border-rose-50/50">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-3">
              Đăng nhập nhanh cho Demo
            </p>
            <div className="grid grid-cols-2 gap-3">
              {DEMO_LOGIN_ACCOUNTS.map(account => (
                <button
                  key={account.email}
                  onClick={() => onDemoSignIn(account.email, account.password)}
                  className="py-2.5 px-3 rounded-xl border border-pink-100 bg-pink-50/30 hover:bg-pink-50 hover:shadow-sm text-[10px] font-bold text-[#1B2C40] transition-all cursor-pointer"
                >
                  {account.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
