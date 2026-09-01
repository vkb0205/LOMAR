import { ArrowRight } from 'lucide-react';
import logoMainImg from '../../../assets/images/Logo.png';
import { demoAccounts } from '../constants';
import type { DemoAccount } from '../types';

type LoginBrandPanelProps = {
  loading: boolean;
  onDemoLogin: (account: DemoAccount) => void;
};

export function LoginBrandPanel({ loading, onDemoLogin }: LoginBrandPanelProps) {
  return (
    <div className="flex-1 flex flex-col justify-between py-4 pr-0 md:pr-6 border-b md:border-b-0 md:border-r border-[#b5d9f2]/20">
      <div className="space-y-6 text-center md:text-left">
        <div className="flex items-center gap-3 justify-center md:justify-start">
          <img src={logoMainImg} alt="Logo" className="h-20 w-auto object-contain" />
          <div className="flex flex-col justify-center border-l border-[#1e4696]/20 pl-3">
            <span className="font-serif text-[#1B2C40] font-bold text-lg tracking-wider uppercase leading-none">PHỐ HẠNH PHÚC</span>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl lg:text-4xl font-serif font-bold text-[#1B2C40] leading-tight">
            NƠI KHỞI ĐẦU <br />
            <span className="text-[#df9e3a] italic font-normal">Hành Trình Hôn Nhân</span>
          </h1>
          <p className="text-xs text-[#1B2C40]/70 leading-relaxed max-w-sm mx-auto md:mx-0">
            Chào mừng bạn đến với hệ sinh thái cưới hỏi hiện đại tại Hồ Văn Huê. Đăng nhập để tùy biến dịch vụ cưới độc bản và quản lý tiến trình ngày chung đôi.
          </p>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        <h3 className="text-xs font-bold text-[#1B2C40]/60 uppercase tracking-widest text-center md:text-left">
          Đăng nhập nhanh cho Demo
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {demoAccounts.map((account) => (
            <button
              key={account.email}
              disabled={loading}
              onClick={() => onDemoLogin(account)}
              className={`flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-br ${account.bgColor} border ${account.borderColor} shadow-sm hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer text-left w-full disabled:opacity-50`}
            >
              <img
                src={account.avatar}
                alt={account.name}
                className="w-10 h-10 rounded-full object-cover border border-white/80 shrink-0 shadow-sm"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-serif font-bold text-xs text-[#1B2C40] truncate">{account.name}</h4>
                <p className="text-[9px] text-[#1B2C40]/50 font-bold uppercase tracking-wider mt-0.5">{account.roleText}</p>
              </div>
              <div className={`w-6 h-6 rounded-full bg-white/80 border ${account.borderColor} flex items-center justify-center ${account.iconColor}`}>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
