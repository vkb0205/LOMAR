import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, ChevronDown } from 'lucide-react';

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
    <nav className="sticky top-0 z-50 w-full bg-[#FAF6EE]/90 backdrop-blur-md border-b border-rose-50 shadow-sm">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 xl:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="p-2">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#1B2C40] group-hover:scale-105 transition-transform duration-300">
                  <path d="M24 6C16 6 12 14 12 14C12 14 8 20 8 28C8 38 18 42 24 42C30 42 40 38 40 28C40 20 36 14 36 14C36 14 32 6 24 6Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
                  <circle cx="24" cy="18" r="4" stroke="currentColor" strokeWidth="1.5" fill="none" />
                  <path d="M16 28C16 28 20 34 24 34C28 34 32 28 32 28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <div className="flex flex-col justify-center">
                <span className="font-serif font-bold text-xl leading-tight text-[#1B2C40] tracking-wider uppercase">
                  Phố Hạnh Phúc
                </span>
                <span className="font-serif font-bold text-xl leading-tight text-[#1B2C40] tracking-wider uppercase">
                  Hồ Văn Huê
                </span>
                <span className="text-[9px] text-[#3A5E7F] font-medium tracking-widest mt-0.5 uppercase">
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
                className={`flex items-center text-[12px] font-bold tracking-widest transition-colors uppercase ${
                  location.pathname === link.path ? 'text-[#1B2C40] border-b-2 border-rose-300 pb-1' : 'text-[#1B2C40] hover:text-rose-400 pt-1.5 pb-1.5'
                }`}
              >
                {link.name}
                {link.hasChild && <ChevronDown className="w-3 h-3 ml-1 text-gray-400" />}
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
              className="w-10 h-10 rounded-full border border-[#1B2C40] text-[#1B2C40] flex items-center justify-center hover:bg-rose-50 transition-colors"
            >
              <User className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <div className="lg:hidden flex flex-row overflow-x-auto border-t border-rose-50 py-3 px-4 gap-4 no-scrollbar bg-[#FAF6EE]">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`flex items-center whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${
              location.pathname === link.path ? 'bg-rose-50 text-rose-500' : 'bg-white text-[#1B2C40] border border-gray-100'
            }`}
          >
            {link.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}
