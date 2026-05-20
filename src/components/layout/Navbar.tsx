import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, ChevronDown } from 'lucide-react';
import logoImg from '../../img/Logo màu.png';

export default function Navbar() {
  const location = useLocation();

  const navLinks = [
    { name: 'TRANG CHỦ', path: '/' },
    { name: 'DỊCH VỤ', path: '/explore', hasChild: true },
    { name: 'CUSTOMIZE CÙNG BẠN', path: '/customize' },
    { name: 'BLOG', path: '/blog' },
    { name: 'WEDDING GUIDE', path: '/guide' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#181144] border-b border-white/10 shadow-sm">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 xl:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-3 group py-1">
              <img
                src={logoImg}
                alt="Logo Phố Hạnh Phúc Hồ Văn Huê"
                className="h-16 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
              />
              <div className="flex flex-col justify-center">
                <span className="font-serif font-bold text-xl leading-tight text-white tracking-wider uppercase">
                  Phố Hạnh Phúc
                </span>
                <span className="font-serif font-bold text-xl leading-tight text-white tracking-wider uppercase">
                  Hồ Văn Huê
                </span>
                <span className="text-[9px] text-white/60 font-medium tracking-widest mt-0.5 uppercase">
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
                className={`flex items-center text-[12px] font-bold tracking-widest transition-colors uppercase ${location.pathname === link.path ? 'text-white border-b-2 border-rose-400 pb-1' : 'text-white/80 hover:text-rose-400 pt-1.5 pb-1.5'
                  }`}
              >
                {link.name}
                {link.hasChild && <ChevronDown className="w-3 h-3 ml-1 text-white/50" />}
              </Link>
            ))}
          </div>

          {/* User Account / Actions */}
          <div className="flex items-center space-x-4">
            <Link
              to="/dashboard"
              className="hidden lg:flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all bg-[#F2BFC8] text-white hover:bg-[#F2BFC8] shadow-sm uppercase tracking-wider"
            >
              Hành Trình Của Bạn
            </Link>

            <Link
              to="/dashboard"
              className="w-10 h-10 rounded-full border border-white/20 text-white flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <User className="w-5 h-5" />
            </Link>
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
