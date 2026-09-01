import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, ChevronDown, LogOut, LayoutDashboard, Sparkles, ShieldCheck } from 'lucide-react';
import logoImg from '../../assets/images/Asset 24.png';
import { useAuth } from '../../features/auth/hooks/useAuth';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut();
    setShowDropdown(false);
    navigate('/');
  };

  const navLinks = [
    { name: 'TRANG CHỦ', path: '/' },
    { name: 'DỊCH VỤ', path: '/explore', hasChild: true },
    { name: 'TƯ VẤN CÙNG BẠN', path: '/ai-consultant' },
    { name: 'BLOG', path: '/blog' },
    { name: 'WEDDING GUIDE', path: '/guide' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#181144] border-b border-white/10 shadow-sm">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 xl:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-2 sm:gap-3 group py-1">
              <img
                src={logoImg}
                alt="Logo Phố Hạnh Phúc Hồ Văn Huê"
                className="h-12 sm:h-16 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
              />
              <div className="flex flex-col justify-center">
                <span className="font-serif font-bold text-sm sm:text-xl leading-tight text-white tracking-wider uppercase">
                  Phố Hạnh Phúc
                </span>
                <span className="hidden sm:block text-[9px] text-white/60 font-medium tracking-widest mt-0.5 uppercase">
                  Nơi bắt đầu hành trình hôn nhân
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex space-x-8 items-center">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center text-[12px] font-bold tracking-widest transition-colors uppercase ${location.pathname === link.path ? 'text-white border-b-2 border-[#ddb983] pb-1' : 'text-white/80 hover:text-rose-400 pt-1.5 pb-1.5'
                  }`}
              >
                {link.name}
                {link.hasChild && <ChevronDown className="w-3 h-3 ml-1 text-white/50" />}
              </Link>
            ))}
          </div>

          {/* User Account / Actions */}
          <div className="flex items-center space-x-4 relative" ref={dropdownRef}>
            {user ? (
              <>
                {/* Logged In Navbar Section */}
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 text-white hover:bg-white/5 transition-all cursor-pointer"
                >
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover border border-rose-200"
                  />
                  <span className="hidden md:inline text-xs font-bold uppercase tracking-wider">
                    {user.name.split(' ').pop()}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 opacity-60 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-rose-50 overflow-hidden z-[999] py-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-2 border-b border-rose-50/50 mb-1">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Tài khoản</p>
                      <p className="text-xs font-bold text-[#1B2C40] truncate mt-0.5">{user.name}</p>
                      <p className="text-[9px] text-[#F2BFC8] font-bold uppercase tracking-wider mt-0.5">{user.role === 'bride' ? 'Cô dâu' : 'Chú rể'}</p>
                    </div>

                    {user.accountRole === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50/60 transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-indigo-500" />
                        Quản Trị Hệ Thống
                      </Link>
                    )}

                    <Link
                      to="/dashboard"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-rose-50/40 hover:text-[#F2BFC8] transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-gray-400" />
                      Hành Trình Của Bạn
                    </Link>

                    {/* adj */}

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-red-500 hover:bg-red-50/50 transition-colors text-left border-t border-rose-50/30 mt-1 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-red-400" />
                      Đăng Xuất
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Logged Out Navbar Section */}
                <Link
                  to="/login"
                  className="hidden lg:flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all bg-[#ffe9c9] text-[#181144] hover:bg-[#ffdb9f] hover:text-[#181144] shadow-sm uppercase tracking-wider"
                >
                  Đăng Nhập
                </Link>

                <Link
                  to="/login"
                  className="w-10 h-10 rounded-full border border-white/20 text-white flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <User className="w-5 h-5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden flex flex-row overflow-x-auto border-t border-white/10 py-3 px-4 gap-4 no-scrollbar bg-[#181144]">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`flex items-center whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${location.pathname === link.path ? 'bg-rose-400 text-white' : 'bg-white/10 text-white border border-white/10 hover:bg-white/20'
              }`}
          >
            {link.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}
