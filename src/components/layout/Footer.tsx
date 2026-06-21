import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Mail, MapPin, Phone, Heart } from 'lucide-react';
import logoMainImg from '../../img/Logo.png';

function TiktokIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
    >
      <path d="M9 0h1.98c.144.715.54 1.617 1.235 2.512C12.895 3.389 13.797 4 15 4v2c-1.753 0-3.07-.814-4-1.829V11a5 5 0 1 1-5-5v2a3 3 0 1 0 3 3z" />
    </svg>
  );
}

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-rose-100 pt-20 pb-10 px-4 w-full relative overflow-hidden">
      
      {/* Decorative Background Element */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-rose-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
      
      <div className="max-w-[1200px] mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="flex flex-col gap-6">
            <Link to="/" className="flex items-center gap-3 group py-1">
              <img
                src={logoMainImg}
                alt="Logo Phố Hạnh Phúc Hồ Văn Huê"
                className="h-16 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
              />
              <div className="flex flex-col justify-center">
                <span className="text-xl font-serif font-bold text-[#1B2C40] tracking-wider uppercase leading-tight">
                  PHỐ HẠNH PHÚC
                </span>
                <span className="text-[9px] text-[#F2BFC8] font-bold tracking-[0.2em] uppercase mt-0.5 leading-tight">
                  HỒ VĂN HUÊ
                </span>
                <span className="text-[8px] text-[#1B2C40]/60 font-medium tracking-widest mt-0.5 uppercase">
                  Wedding Platform
                </span>
              </div>
            </Link>
            <p className="text-sm text-[#1B2C40]/70 leading-relaxed">
              Hệ sinh thái dịch vụ cưới hỏi hàng đầu tại "Phố Cưới" Hồ Văn Huê. Nơi hiện thực hóa giấc mơ ngày trọng đại của mọi cặp đôi.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-[#F2BFC8] hover:bg-[#F2BFC8] hover:text-white transition-all">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-[#F2BFC8] hover:bg-[#F2BFC8] hover:text-white transition-all">
                <TiktokIcon className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif font-bold text-[#1B2C40] text-lg mb-6 uppercase tracking-wider">KHÁM PHÁ</h4>
            <ul className="flex flex-col gap-4">
              <li><Link to="/explore" className="text-sm text-[#1B2C40]/70 hover:text-[#F2BFC8] transition-colors">Dịch vụ cưới</Link></li>
              <li><Link to="/customize" className="text-sm text-[#1B2C40]/70 hover:text-[#F2BFC8] transition-colors">Thiết kế phong cách</Link></li>
              <li><Link to="/guide" className="text-sm text-[#1B2C40]/70 hover:text-[#F2BFC8] transition-colors">Cẩm nang cưới</Link></li>
              <li><Link to="/blog" className="text-sm text-[#1B2C40]/70 hover:text-[#F2BFC8] transition-colors">Tin tức & Sự kiện</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-serif font-bold text-[#1B2C40] text-lg mb-6 uppercase tracking-wider">LIÊN HỆ</h4>
            <ul className="flex flex-col gap-4">
              <li className="flex items-start gap-3 text-sm text-[#1B2C40]/70">
                <MapPin className="w-5 h-5 text-[#F2BFC8] shrink-0" />
                <span>123 Hồ Văn Huê, P.9, Q. Phú Nhuận, TP. HCM</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-[#1B2C40]/70">
                <Phone className="w-5 h-5 text-[#F2BFC8] shrink-0" />
                <span>0123 456 789</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-[#1B2C40]/70">
                <Mail className="w-5 h-5 text-[#F2BFC8] shrink-0" />
                <span>contact@phohanhphuc.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-serif font-bold text-[#1B2C40] text-lg mb-6 uppercase tracking-wider">BẢN TIN</h4>
            <p className="text-sm text-[#1B2C40]/70 mb-6">Đăng ký để nhận ưu đãi và cẩm nang cưới mới nhất.</p>
            <div className="flex flex-col gap-3">
              <input 
                type="email" 
                placeholder="Email của bạn" 
                className="bg-rose-50/50 border border-rose-100 rounded-full py-3 px-5 text-sm focus:outline-none focus:ring-1 focus:ring-[#F2BFC8]"
              />
              <button className="bg-[#1B2C40] text-white py-3 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[#F2BFC8] transition-colors shadow-lg">
                ĐĂNG KÝ
              </button>
            </div>
          </div>

        </div>

        {/* Footer Bottom */}
        <div className="pt-8 border-t border-rose-50 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-xs text-[#1B2C40]/50 font-medium">
            &copy; {currentYear} PHỐ HẠNH PHÚC. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-xs text-[#1B2C40]/50 font-medium">
            Created with <Heart className="w-3 h-3 text-rose-300 fill-current" /> by Bé Song Hỷ
          </div>
          <div className="flex gap-8">
            <a href="#" className="text-xs text-[#1B2C40]/50 hover:text-[#F2BFC8] transition-colors font-medium">Điều khoản</a>
            <a href="#" className="text-xs text-[#1B2C40]/50 hover:text-[#F2BFC8] transition-colors font-medium">Bảo mật</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
