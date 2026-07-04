import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Mail, Lock, User, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import logoMainImg from '../img/Logo.png';

export default function Login() {
  const { signIn, signUp, user } = useAppContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/dashboard';

  const [isLoginTab, setIsLoginTab] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'bride' | 'groom'>('bride');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // If already logged in, redirect immediately
  React.useEffect(() => {
    if (user) {
      navigate(redirectPath);
    }
  }, [user, navigate, redirectPath]);

  const handleDemoLogin = async (demoEmail: string, _name: string, _userRole: 'bride' | 'groom') => {
    setLoading(true);
    setError('');

    // Demo accounts must exist in Supabase Auth with this shared password.
    const { error: signInError } = await signIn(demoEmail, 'demo-password');

    if (signInError) {
      setError('Không thể đăng nhập tài khoản demo. Vui lòng thử lại.');
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    setTimeout(() => {
      navigate(redirectPath);
    }, 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (!isLoginTab && !fullName)) {
      setError('Vui lòng điền đầy đủ các thông tin cần thiết.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: authError } = isLoginTab
        ? await signIn(email, password)
        : await signUp(email, password, fullName, role);

      if (authError) {
        setError(authError);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        navigate(redirectPath);
      }, 500);
    } catch (err) {
      setError('Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    {
      name: 'Cô dâu Quỳnh Anh',
      roleText: 'Cô dâu (Bride)',
      email: 'quynhanh.bride@demo.com',
      role: 'bride' as const,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120',
      bgColor: 'from-pink-50 to-rose-50/50',
      borderColor: 'border-pink-100',
      iconColor: 'text-pink-500',
    },
    {
      name: 'Chú rể Gia Bảo',
      roleText: 'Chú rể (Groom)',
      email: 'giabao.groom@demo.com',
      role: 'groom' as const,
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=120',
      bgColor: 'from-blue-50 to-indigo-50/50',
      borderColor: 'border-blue-100',
      iconColor: 'text-blue-500',
    }
  ];

  return (
    <div className="min-h-screen w-full flex bg-[#fffdfa] relative overflow-hidden py-12 px-4 justify-center items-center">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-50 rounded-full blur-3xl opacity-60 -translate-y-1/3 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#b5d9f2]/10 rounded-full blur-3xl opacity-60 translate-y-1/3 -translate-x-1/3 pointer-events-none" />

      <div className="w-full max-w-[1000px] bg-white/60 backdrop-blur-md border border-[#b5d9f2]/30 rounded-[40px] shadow-2xl p-6 md:p-10 lg:p-12 flex flex-col md:flex-row gap-10 items-stretch z-10">
        
        {/* Left Side: Branding / Intro */}
        <div className="flex-1 flex flex-col justify-between py-4 pr-0 md:pr-6 border-b md:border-b-0 md:border-r border-[#b5d9f2]/20">
          <div className="space-y-6 text-center md:text-left">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <img src={logoMainImg} alt="Logo" className="h-16 w-auto object-contain" />
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

          {/* Quick Login Shortcuts */}
          <div className="mt-8 space-y-4">
            <h3 className="text-xs font-bold text-[#1B2C40]/60 uppercase tracking-widest text-center md:text-left">
              Đăng nhập nhanh cho Demo
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {demoAccounts.map((account) => (
                <button
                  key={account.email}
                  disabled={loading}
                  onClick={() => handleDemoLogin(account.email, account.name, account.role)}
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

        {/* Right Side: Tabbed Login / Sign Up Form */}
        <div className="w-full md:w-[420px] flex flex-col justify-center">
          <div className="bg-white rounded-3xl border border-rose-50 p-6 md:p-8 shadow-sm">
            {/* Tabs */}
            <div className="flex border-b border-rose-50/50 mb-6 pb-2">
              <button
                onClick={() => { setIsLoginTab(true); setError(''); }}
                className={`flex-1 pb-3 text-center text-xs font-bold tracking-widest uppercase transition-all ${
                  isLoginTab ? 'text-[#F2BFC8] border-b-2 border-[#F2BFC8]' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Đăng Nhập
              </button>
              <button
                onClick={() => { setIsLoginTab(false); setError(''); }}
                className={`flex-1 pb-3 text-center text-xs font-bold tracking-widest uppercase transition-all ${
                  !isLoginTab ? 'text-[#F2BFC8] border-b-2 border-[#F2BFC8]' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Đăng Ký
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-100 text-red-600 px-4 py-2.5 rounded-xl text-xs font-medium"
                >
                  {error}
                </motion.div>
              )}

              <AnimatePresence mode="wait">
                {success && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 mb-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Đăng nhập thành công! Đang chuyển hướng...
                  </motion.div>
                )}
              </AnimatePresence>

              {!isLoginTab && (
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
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-rose-50/20 border border-rose-100/50 rounded-2xl py-3 pl-11 pr-5 text-xs focus:outline-none focus:ring-1 focus:ring-[#F2BFC8] text-[#1B2C40] transition-all"
                  />
                </div>
              </div>

              {!isLoginTab && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-1.5"
                >
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider pl-1">Vai trò của bạn</label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('bride')}
                      className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                        role === 'bride'
                          ? 'border-[#F2BFC8] bg-rose-50 text-[#F2BFC8]'
                          : 'border-rose-100/40 bg-white text-gray-500'
                      }`}
                    >
                      Cô dâu (Bride)
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('groom')}
                      className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                        role === 'groom'
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
                    <span>{isLoginTab ? 'Đăng Nhập' : 'Đăng Ký Tài Khoản'}</span>
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
