import { ArrowRight, BriefcaseBusiness, ShieldCheck, UserRound, type LucideIcon } from 'lucide-react';
import logoMainImg from '../../../assets/images/Logo.png';
import type { AccountRole, QuickLoginAccount } from '../types';
import { quickLoginAccounts } from '../constants';

type RoleLoginPanelProps = {
  loading: boolean;
  onQuickLogin: (account: QuickLoginAccount) => void;
};

const rolePresentation: Record<
  AccountRole,
  {
    icon: LucideIcon;
    iconClassName: string;
    iconBackgroundClassName: string;
    borderClassName: string;
  }
> = {
  customer: {
    icon: UserRound,
    iconClassName: 'text-pink-500',
    iconBackgroundClassName: 'bg-pink-50',
    borderClassName: 'border-pink-100 hover:border-pink-200',
  },
  vendor: {
    icon: BriefcaseBusiness,
    iconClassName: 'text-blue-500',
    iconBackgroundClassName: 'bg-blue-50',
    borderClassName: 'border-blue-100 hover:border-blue-200',
  },
  admin: {
    icon: ShieldCheck,
    iconClassName: 'text-amber-600',
    iconBackgroundClassName: 'bg-amber-50',
    borderClassName: 'border-amber-100 hover:border-amber-200',
  },
};

export function RoleLoginPanel({ loading, onQuickLogin }: RoleLoginPanelProps) {
  return (
    <div className="flex-1 flex flex-col justify-between py-4 pr-0 md:pr-6 border-b md:border-b-0 md:border-r border-[#b5d9f2]/20">
      <div className="space-y-6 text-center md:text-left">
        <div className="flex items-center gap-3 justify-center md:justify-start">
          <img src={logoMainImg} alt="Logo" className="h-20 w-auto object-contain" />
          <div className="flex flex-col justify-center border-l border-[#1e4696]/20 pl-3">
            <span className="font-serif text-[#1B2C40] font-bold text-lg tracking-wider uppercase leading-none">
              PHỐ HẠNH PHÚC
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl lg:text-4xl font-serif font-bold text-[#1B2C40] leading-tight">
            NƠI KHỞI ĐẦU <br />
            <span className="text-[#df9e3a] italic font-normal">Hành Trình Hôn Nhân</span>
          </h1>
          <p className="text-xs text-[#1B2C40]/70 leading-relaxed max-w-sm mx-auto md:mx-0">
            Chào mừng bạn đến với hệ sinh thái cưới hỏi hiện đại. Đăng nhập để tùy biến dịch vụ cưới độc bản và quản lý tiến trình ngày chung đôi.
          </p>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        <div>
          <h3 className="text-xs font-bold text-[#1B2C40]/60 uppercase tracking-widest text-center md:text-left">
            Quick login by role
          </h3>
          <p className="text-[10px] text-[#1B2C40]/50 text-center md:text-left mt-1">
            Choose a workspace to sign in instantly.
          </p>
        </div>

        <div className="space-y-3">
          {quickLoginAccounts.map((account) => {
            const presentation = rolePresentation[account.accountRole];
            const Icon = presentation.icon;

            return (
              <button
                key={account.id}
                type="button"
                disabled={loading}
                onClick={() => onQuickLogin(account)}
                className={`group flex items-center gap-3 p-3.5 rounded-2xl bg-white border ${presentation.borderClassName} shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer text-left w-full disabled:opacity-50 disabled:cursor-wait disabled:hover:translate-y-0`}
              >
                <div className={`w-10 h-10 rounded-xl ${presentation.iconBackgroundClassName} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-5 h-5 ${presentation.iconClassName}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-serif font-bold text-sm text-[#1B2C40] truncate">{account.label}</h4>
                  <p className="text-[10px] text-[#1B2C40]/50 font-medium tracking-wide mt-0.5">{account.description}</p>
                </div>
                <div className={`w-7 h-7 rounded-full ${presentation.iconBackgroundClassName} flex items-center justify-center ${presentation.iconClassName} group-hover:translate-x-0.5 transition-transform`}>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
