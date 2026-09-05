import { Lock, Mail, Sparkles, User } from 'lucide-react';
import { motion } from 'motion/react';
import type { AuthMode, LoginFormValues } from '../types';
import { AuthStatusMessage } from './AuthStatusMessage';

type LoginFormPanelProps = {
  error: string;
  loading: boolean;
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  onOAuthLogin: (provider: 'google' | 'facebook') => void;
  onSubmit: (event: React.FormEvent) => void;
  onValueChange: <Key extends keyof LoginFormValues>(key: Key, value: LoginFormValues[Key]) => void;
  success: boolean;
  values: LoginFormValues;
};

export function LoginFormPanel({
  error,
  loading,
  mode,
  onModeChange,
  onOAuthLogin,
  onSubmit,
  onValueChange,
  success,
  values,
}: LoginFormPanelProps) {
  const isLogin = mode === 'login';

  return (
    <div className="w-full md:w-[420px] flex flex-col justify-center">
      <div className="bg-white rounded-3xl border border-rose-50 p-6 md:p-8 shadow-sm">
        <div className="flex border-b border-rose-50/50 mb-6 pb-2">
          <button
            onClick={() => onModeChange('login')}
            className={`flex-1 pb-3 text-center text-xs font-bold tracking-widest uppercase transition-all ${
              isLogin ? 'text-[#F2BFC8] border-b-2 border-[#F2BFC8]' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Đăng Nhập
          </button>
          <button
            onClick={() => onModeChange('signup')}
            className={`flex-1 pb-3 text-center text-xs font-bold tracking-widest uppercase transition-all ${
              !isLogin ? 'text-[#F2BFC8] border-b-2 border-[#F2BFC8]' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Đăng Ký
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <AuthStatusMessage error={error} success={success} />

          {!isLogin && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-1.5"
            >
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider pl-1">Họ và Tên</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={values.fullName}
                  onChange={(event) => onValueChange('fullName', event.target.value)}
                  className="w-full bg-rose-50/20 border border-rose-100/50 rounded-2xl py-3 pl-11 pr-5 text-xs focus:outline-none focus:ring-1 focus:ring-[#F2BFC8] text-[#1B2C40] transition-all"
                />
              </div>
            </motion.div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider pl-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                placeholder="email@example.com"
                value={values.email}
                onChange={(event) => onValueChange('email', event.target.value)}
                className="w-full bg-rose-50/20 border border-rose-100/50 rounded-2xl py-3 pl-11 pr-5 text-xs focus:outline-none focus:ring-1 focus:ring-[#F2BFC8] text-[#1B2C40] transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider pl-1">Mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                placeholder="••••••••"
                value={values.password}
                onChange={(event) => onValueChange('password', event.target.value)}
                className="w-full bg-rose-50/20 border border-rose-100/50 rounded-2xl py-3 pl-11 pr-5 text-xs focus:outline-none focus:ring-1 focus:ring-[#F2BFC8] text-[#1B2C40] transition-all"
              />
            </div>
          </div>

          {!isLogin && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider pl-1">Vai trò của bạn</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => onValueChange('role', 'bride')}
                  className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                    values.role === 'bride'
                      ? 'border-[#F2BFC8] bg-rose-50 text-[#F2BFC8]'
                      : 'border-rose-100/40 bg-white text-gray-500'
                  }`}
                >
                  Cô dâu (Bride)
                </button>
                <button
                  type="button"
                  onClick={() => onValueChange('role', 'groom')}
                  className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                    values.role === 'groom'
                      ? 'border-blue-400 bg-blue-50 text-blue-500'
                      : 'border-rose-100/40 bg-white text-gray-500'
                  }`}
                >
                  Chú rể (Groom)
                </button>
              </div>
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading || success}
            className="w-full bg-[#1B2C40] hover:bg-[#F2BFC8] text-white py-3.5 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg transition-colors flex items-center justify-center gap-2 mt-6 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>{isLogin ? 'Đăng Nhập' : 'Đăng Ký Tài Khoản'}</span>
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
              </>
            )}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 text-[10px] uppercase tracking-widest text-gray-400">
          <span className="h-px flex-1 bg-rose-100" />Hoặc<span className="h-px flex-1 bg-rose-100" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={loading || success}
            onClick={() => onOAuthLogin('google')}
            className="rounded-xl border border-gray-200 px-3 py-2.5 text-xs font-bold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            Google
          </button>
          <button
            type="button"
            disabled={loading || success}
            onClick={() => onOAuthLogin('facebook')}
            className="rounded-xl border border-blue-200 px-3 py-2.5 text-xs font-bold text-blue-700 transition hover:bg-blue-50 disabled:opacity-50"
          >
            Facebook
          </button>
        </div>
      </div>
    </div>
  );
}
