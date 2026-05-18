import React, { useEffect, useState } from 'react';
import { Search, MapPin, Star, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { Database } from '../types/database';

type VendorRow = Database['public']['Tables']['vendors']['Row'];

// Lớp CSS dùng chung cho animation mờ dần
const fadeVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

interface Vendor {
  id: string;
  name: string;
  category: string;
  rating: number;
  addr?: string;
  img?: string;
}

export default function Services() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('Tất Cả');
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [categories, setCategories] = useState<string[]>(['Tất Cả', 'Váy Cưới', 'Chụp Ảnh', 'Địa Điểm', 'Trang Trí', 'Trang Điểm']);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchVendors() {
      try {
        const { data, error } = await supabase.from('vendors').select('*');
        if (error) throw error;

        if (data) {
          const mappedVendors: Vendor[] = (data as VendorRow[]).map((v) => ({
            id: v.id,
            name: v.name || 'Thương hiệu',
            category: v.category || 'Khác',
            rating: v.rating ? Number(v.rating) : 5.0,
            addr: v.address || '',
            img: v.image_url || ''
          }));
          setVendors(mappedVendors);

          // Lọc danh mục duy nhất và loại bỏ giá trị null/rỗng
          const uniqueCategories = [
            'Tất Cả',
            ...new Set(mappedVendors.map(v => v.category).filter(Boolean))
          ];
          setCategories(uniqueCategories as string[]);
        } else {
          setVendors([]);
        }
      } catch (error) {
        console.error('Error fetching vendors:', error);
        setVendors([]);
      } finally {
        setLoading(false);
      }
    }
    fetchVendors();
  }, []);

  const filteredVendors = vendors.filter(v => {
    const matchesCategory = activeCategory === 'Tất Cả' || v.category === activeCategory;
    const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (v.category && v.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (v.addr && v.addr.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full flex flex-col font-sans mb-20 bg-[#FEF6F7] min-h-screen">

      {/* Header Banner */}
      <div className="relative w-full h-[300px] md:h-[400px] flex items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=2000"
          alt="Wedding Services"
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-[#1D3557]/40" />
        <div className="relative z-10 text-center px-4 flex flex-col items-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-4 uppercase tracking-widest"
          >
            DỊCH VỤ CƯỚI
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white/90 text-sm md:text-base max-w-xl font-medium"
          >
            Khám phá hệ sinh thái dịch vụ cưới trọn vẹn tại Phố Hạnh Phúc, nơi quy tụ những thương hiệu uy tín nhất.
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 w-full max-w-2xl relative flex items-center bg-white rounded-full shadow-lg p-2"
          >
            <div className="absolute left-6 text-gray-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm dịch vụ, thương hiệu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-32 py-3 rounded-full focus:outline-none text-[#1D3557] bg-transparent"
            />
            <button className="absolute right-2 top-2 bottom-2 bg-[#F494A2] text-white px-6 md:px-8 rounded-full font-bold text-xs tracking-widest uppercase hover:bg-rose-400 transition-colors">
              TÌM KIẾM
            </button>
          </motion.div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto w-full px-4 mt-8 lg:mt-12">

        {/* Categories & Filter */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <div className="flex overflow-x-auto no-scrollbar w-full md:w-auto pb-2 md:pb-0 gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2.5 rounded-full text-xs font-bold tracking-widest whitespace-nowrap transition-all uppercase border ${activeCategory === cat
                  ? 'bg-[#1D3557] text-white border-[#1D3557]'
                  : 'bg-white text-[#1D3557] border-rose-100 hover:border-[#1D3557]'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white border border-rose-100 text-[#1D3557] text-xs font-bold tracking-widest uppercase hover:bg-rose-50 transition-colors shrink-0">
            <Filter className="w-4 h-4" /> BỘ LỌC
          </button>
        </div>

        {/* Vendor Grid */}
        {loading ? (
          <div className="w-full flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F494A2]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredVendors.map((vendor, index) => (
              <motion.div
                key={vendor.id}
                variants={fadeVariant}
                initial="hidden"
                animate="visible"
                transition={{ delay: index * 0.1 }}
                onClick={() => navigate(`/vendor/${vendor.id}`)}
                className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-rose-100 hover:shadow-md hover:-translate-y-1 transition-all group cursor-pointer flex flex-col"
              >
                <div className="w-full aspect-[4/3] relative overflow-hidden bg-gray-100">
                  <img
                    src={vendor.img || `https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&q=80&w=600&sig=${vendor.id}`}
                    alt={vendor.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-[#1D3557] uppercase tracking-widest shadow-sm">
                    {vendor.category}
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-serif font-bold text-lg text-[#1D3557] group-hover:text-[#F494A2] transition-colors leading-tight">{vendor.name}</h3>
                    <div className="flex items-center bg-rose-50 px-2 py-1 rounded-md text-rose-500 font-bold text-xs shrink-0">
                      <Star className="w-3 h-3 fill-current mr-1" />
                      {vendor.rating || '5.0'}
                    </div>
                  </div>

                  {vendor.addr && (
                    <div className="flex items-center text-[#5D7B9A] text-xs mb-4">
                      <MapPin className="w-3.5 h-3.5 mr-1 shrink-0" />
                      <span className="truncate">{vendor.addr}</span>
                    </div>
                  )}

                  <button className="mt-auto w-full py-3 bg-[#FFF5F5] text-[#1D3557] rounded-full font-bold text-[10px] uppercase tracking-widest group-hover:bg-[#F494A2] group-hover:text-white transition-colors border border-rose-50">
                    XEM CHI TIẾT
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {filteredVendors.length === 0 && !loading && (
          <div className="w-full py-20 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 text-rose-300 shadow-sm">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-[#1D3557] font-serif font-bold text-xl mb-2">Không tìm thấy dịch vụ</h3>
            <p className="text-[#5D7B9A] text-sm max-w-md">Hiện tại chưa có dịch vụ nào trong danh mục này. Vui lòng thử lại sau hoặc chọn danh mục khác.</p>
          </div>
        )}
      </div>

    </div>
  );
}
