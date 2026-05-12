import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Youtube, Mail, MapPin, Phone, Heart } from 'lucide-react';

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
            <Link to="/" className="flex flex-col">
               <span className="text-2xl font-serif font-bold text-[#1D3557] tracking-widest uppercase">PHỐ HẠNH PHÚC</span>
               <span className="text-[10px] text-[#F494A2] font-bold tracking-[0.3em] uppercase">Hồ Văn Huê Wedding Platform</span>
            </Link>
            <p className="text-sm text-[#1D3557]/70 leading-relaxed">
              Hệ sinh thái dịch vụ cưới hỏi hàng đầu tại "Phố Cưới" Hồ Văn Huê. Nơi hiện thực hóa giấc mơ ngày trọng đại của mọi cặp đôi.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-[#F494A2] hover:bg-[#F494A2] hover:text-white transition-all">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-[#F494A2] hover:bg-[#F494A2] hover:text-white transition-all">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-[#F494A2] hover:bg-[#F494A2] hover:text-white transition-all">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif font-bold text-[#1D3557] text-lg mb-6 uppercase tracking-wider">KHÁM PHÁ</h4>
            <ul className="flex flex-col gap-4">
              <li><Link to="/explore" className="text-sm text-[#1D3557]/70 hover:text-[#F494A2] transition-colors">Dịch vụ cưới</Link></li>
              <li><Link to="/customize" className="text-sm text-[#1D3557]/70 hover:text-[#F494A2] transition-colors">Thiết kế phong cách</Link></li>
              <li><Link to="/guide" className="text-sm text-[#1D3557]/70 hover:text-[#F494A2] transition-colors">Cẩm nang cưới</Link></li>
              <li><Link to="/blog" className="text-sm text-[#1D3557]/70 hover:text-[#F494A2] transition-colors">Tin tức & Sự kiện</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-serif font-bold text-[#1D3557] text-lg mb-6 uppercase tracking-wider">LIÊN HỆ</h4>
            <ul className="flex flex-col gap-4">
              <li className="flex items-start gap-3 text-sm text-[#1D3557]/70">
                <MapPin className="w-5 h-5 text-[#F494A2] shrink-0" />
                <span>123 Hồ Văn Huê, P.9, Q. Phú Nhuận, TP. HCM</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-[#1D3557]/70">
                <Phone className="w-5 h-5 text-[#F494A2] shrink-0" />
                <span>0123 456 789</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-[#1D3557]/70">
                <Mail className="w-5 h-5 text-[#F494A2] shrink-0" />
                <span>contact@phohanhphuc.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-serif font-bold text-[#1D3557] text-lg mb-6 uppercase tracking-wider">BẢN TIN</h4>
            <p className="text-sm text-[#1D3557]/70 mb-6">Đăng ký để nhận ưu đãi và cẩm nang cưới mới nhất.</p>
            <div className="flex flex-col gap-3">
              <input 
                type="email" 
                placeholder="Email của bạn" 
                className="bg-rose-50/50 border border-rose-100 rounded-full py-3 px-5 text-sm focus:outline-none focus:ring-1 focus:ring-[#F494A2]"
              />
              <button className="bg-[#1D3557] text-white py-3 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[#F494A2] transition-colors shadow-lg">
                ĐĂNG KÝ
              </button>
            </div>
          </div>

        </div>

        {/* Footer Bottom */}
        <div className="pt-8 border-t border-rose-50 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-xs text-[#1D3557]/50 font-medium">
            &copy; {currentYear} PHỐ HẠNH PHÚC. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-xs text-[#1D3557]/50 font-medium">
            Created with <Heart className="w-3 h-3 text-rose-300 fill-current" /> by Bé Song Hỷ
          </div>
          <div className="flex gap-8">
            <a href="#" className="text-xs text-[#1D3557]/50 hover:text-[#F494A2] transition-colors font-medium">Điều khoản</a>
            <a href="#" className="text-xs text-[#1D3557]/50 hover:text-[#F494A2] transition-colors font-medium">Bảo mật</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
