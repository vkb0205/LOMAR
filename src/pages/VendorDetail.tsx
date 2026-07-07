import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, Star, ArrowLeft, Heart, ShoppingBag, Phone, Share2, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { Database } from '../types/database';
import FollowButton from '../components/social/FollowButton';

type Vendor = Database['public']['Tables']['vendors']['Row'];
type Service = Database['public']['Tables']['services']['Row'];

const fadeVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function VendorDetail() {
  const { vendorId } = useParams<{ vendorId: string }>();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { window.scrollTo(0, 0); }, [vendorId]);

  useEffect(() => {
    async function fetchVendorData() {
      if (!vendorId) return;
      try {
        setLoading(true);
        const { data: vendorData, error: vendorError } = await supabase
          .from('vendors').select('*').eq('id', vendorId).single();
        if (vendorError) throw vendorError;
        setVendor(vendorData);

        const { data: servicesData, error: servicesError } = await supabase
          .from('services').select('*').eq('vendor_id', vendorId);
        if (servicesError) throw servicesError;
        setServices(servicesData || []);
      } catch (error) {
        console.error('Error fetching vendor details:', error);
        setVendor(null);
        setServices([]);
      } finally { setLoading(false); }
    }
    fetchVendorData();
  }, [vendorId]);

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[#FAF6EE]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F2BFC8]"></div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-[#FAF6EE] px-4 text-center">
        <h2 className="text-2xl font-serif font-bold text-[#1B2C40] mb-4">Không tìm thấy thương hiệu</h2>
        <button onClick={() => navigate('/explore')}
          className="flex items-center gap-2 text-[#F2BFC8] font-bold uppercase tracking-widest text-xs">
          <ArrowLeft className="w-4 h-4" /> QUAY LẠI KHÁM PHÁ
        </button>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col font-sans mb-20 bg-[#FAF6EE] min-h-screen">
      <div className="relative w-full h-[420px] sm:h-[450px] overflow-hidden">
        <img src={vendor.image_url || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=2000'}
          alt={vendor.name || 'Vendor'} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent" />
        <div className="absolute top-4 left-4 md:top-8 md:left-8 z-20">
          <button onClick={() => navigate(-1)}
            className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/40 transition-all border border-white/30">
            <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>
        <div className="absolute bottom-0 left-0 w-full p-4 sm:p-6 md:p-12 z-10">
          <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-[#F2BFC8] text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">
                  {vendor.category || 'Dịch vụ'}
                </span>
                <div className="flex items-center bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white font-bold text-xs border border-white/20">
                  <Star className="w-3.5 h-3.5 fill-[#ffcc7e] text-[#ffcc7e] mr-1" />
                  {Number(vendor.rating_avg) || '5.0'}
                </div>
              </div>
              <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white uppercase tracking-tight leading-tight mb-2">
                {vendor.name}
              </h1>
              <div className="flex items-center text-white/90 text-xs sm:text-sm">
                <MapPin className="w-3.5 h-3.5 mr-1.5 text-rose-300 shrink-0" />
                {vendor.address || 'Hồ Văn Huê, Phú Nhuận'}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-2 md:mt-0">
              <FollowButton type="vendor" targetId={vendor.id} size="md" showCount={false} />
              <button className="flex items-center gap-2 bg-white text-[#1B2C40] px-5 py-2.5 sm:px-6 sm:py-3 rounded-full font-bold text-xs tracking-widest uppercase hover:bg-rose-50 transition-colors shadow-lg">
                <Phone className="w-4 h-4" /> LIÊN HỆ
              </button>
              <button className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#F2BFC8] text-white flex items-center justify-center hover:bg-rose-400 transition-colors shadow-lg shrink-0">
                <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto w-full px-4 mt-12 md:mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-20">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-2xl font-serif font-bold text-[#1B2C40] uppercase tracking-wide">VỀ CHÚNG TÔI</h2>
              <div className="h-[1px] bg-rose-100 flex-1"></div>
            </div>
            <p className="text-[#1B2C40]/80 leading-relaxed text-base md:text-lg mb-8">
              {vendor.name} là một trong những thương hiệu uy tín hàng đầu tại Phố Hạnh Phúc Hồ Văn Huê. Với phong cách phục vụ tận tâm và chất lượng dịch vụ đỉnh cao, chúng tôi cam kết mang đến những trải nghiệm tuyệt vời nhất cho ngày trọng đại của bạn.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {['Tư vấn chuyên nghiệp 24/7', 'Sản phẩm thiết kế độc bản', 'Ưu đãi voucher lên đến 20%', 'Hỗ trợ may đo theo yêu cầu'].map((feature, i) => (
                <div key={i} className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-rose-50 shadow-sm">
                  <div className="w-6 h-6 rounded-full bg-[#FAF6EE] flex items-center justify-center text-[#F2BFC8] shrink-0">
                    <Heart className="w-3 h-3 fill-current" />
                  </div>
                  <span className="text-xs font-bold text-[#1B2C40] uppercase tracking-wider">{feature}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[32px] p-8 border border-rose-100 shadow-sm sticky top-24">
              <h3 className="font-serif font-bold text-[#1B2C40] text-xl mb-6 uppercase">THÔNG TIN</h3>
              <div className="space-y-6">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-[#F2BFC8] uppercase tracking-widest">ĐỊA CHỈ</span>
                  <p className="text-sm text-[#1B2C40] font-medium">{vendor.address}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-[#F2BFC8] uppercase tracking-widest">GIỜ MỞ CỬA</span>
                  <p className="text-sm text-[#1B2C40] font-medium">08:00 - 21:00 Hàng ngày</p>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-[#F2BFC8] uppercase tracking-widest">ĐÁNH GIÁ</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-[#ffcc7e] text-[#ffcc7e]" />
                    <span className="text-sm text-[#1B2C40] font-bold">{Number(vendor.rating_avg)}/5.0</span>
                    <span className="text-xs text-gray-400 ml-1">({vendor.rating_count}+ đánh giá)</span>
                  </div>
                </div>
              </div>
              <button className="w-full mt-8 py-4 bg-[#F2BFC8] text-white rounded-full font-bold text-xs uppercase tracking-widest shadow-md hover:bg-rose-400 transition-all hover:-translate-y-0.5">
                NHẬN TƯ VẤN NGAY
              </button>
            </div>
          </div>
        </div>

        {/* Services Section (renamed from products) */}
        <div className="flex flex-col mb-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
            <div className="flex flex-col items-center md:items-start">
              <h2 className="text-3xl font-serif font-bold text-[#1B2C40] uppercase tracking-wider mb-2">BỘ SƯU TẬP</h2>
              <p className="text-sm text-gray-500 italic">Khám phá những dịch vụ nổi bật của {vendor.name}</p>
            </div>
            <div className="flex gap-4">
              <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-rose-100 text-[#1B2C40] text-xs font-bold tracking-widest uppercase hover:bg-rose-50 transition-colors">
                <Filter className="w-4 h-4" /> BỘ LỌC
              </button>
              <div className="flex bg-white rounded-full border border-rose-100 p-1">
                <button className="px-6 py-2 rounded-full bg-[#1B2C40] text-white text-[10px] font-bold uppercase tracking-widest">MỚI NHẤT</button>
                <button className="px-6 py-2 rounded-full text-[#1B2C40] text-[10px] font-bold uppercase tracking-widest">PHỔ BIẾN</button>
              </div>
            </div>
          </div>

          {services.length === 0 ? (
            <div className="w-full py-20 text-center flex flex-col items-center bg-white rounded-[40px] border border-dashed border-rose-200">
              <ShoppingBag className="w-12 h-12 text-rose-200 mb-4" />
              <h3 className="text-[#1B2C40] font-serif font-bold text-xl mb-2">Dịch vụ đang được cập nhật</h3>
              <p className="text-gray-400 text-sm">Vui lòng quay lại sau để xem bộ sưu tập mới nhất.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {services.map((service, index) => (
                <motion.div key={service.id} variants={fadeVariant} initial="hidden" whileInView="visible"
                  viewport={{ once: true }} transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-rose-50 hover:shadow-md hover:-translate-y-1 transition-all group">
                  <div className="w-full aspect-[3/4] relative overflow-hidden bg-gray-50">
                    <img src={service.thumbnail_url || 'https://images.unsplash.com/photo-1595000072051-5afcb1eef556?auto=format&fit=crop&q=80&w=600'}
                      alt={service.name || 'Service'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white">
                      <Heart className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="p-6">
                    <span className="text-[10px] font-bold text-[#F2BFC8] uppercase tracking-widest mb-1 block">{service.category || 'Dịch vụ'}</span>
                    <h3 className="font-serif font-bold text-[#1B2C40] text-lg mb-3 leading-tight group-hover:text-[#F2BFC8] transition-colors">{service.name}</h3>
                    <div className="flex justify-between items-center mt-auto">
                      <span className="font-bold text-[#1B2C40]">
                        {Number(service.base_price).toLocaleString('vi-VN')} <span className="text-[10px] font-normal">VND</span>
                      </span>
                      <Link to="/customize" className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-[#F2BFC8] hover:bg-[#F2BFC8] hover:text-white transition-all">
                        <ShoppingBag className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-[#1B2C40] rounded-[40px] p-8 md:p-16 text-center relative overflow-hidden">
          <div className="absolute top-[-50px] right-[-50px] opacity-10">
            <Star className="w-64 h-64 text-white" />
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white uppercase tracking-tight mb-6">
              BẠN MUỐN THIẾT KẾ RIÊNG?
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto mb-10 text-sm md:text-base">
              Hãy để Bé Song Hỷ đồng hành cùng bạn tạo nên những dấu ấn độc bản cho ngày cưới.
            </p>
            <Link to="/customize"
              className="inline-flex items-center gap-3 bg-[#F2BFC8] text-white px-10 py-4 rounded-full font-bold text-xs tracking-widest uppercase hover:bg-rose-400 transition-all shadow-lg hover:-translate-y-1">
              THỬ NGAY <ArrowLeft className="w-4 h-4 rotate-180" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
