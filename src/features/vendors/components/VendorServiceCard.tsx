import { Heart, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import type { VendorDetailService } from '../types';

const fadeVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

interface VendorServiceCardProps {
  index: number;
  service: VendorDetailService;
}

export function VendorServiceCard({ index, service }: VendorServiceCardProps) {
  return (
    <motion.div
      key={service.id}
      variants={fadeVariant}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-rose-50 hover:shadow-md hover:-translate-y-1 transition-all group"
    >
      <div className="w-full aspect-[3/4] relative overflow-hidden bg-gray-50">
        <img
          src={service.thumbnail_url || 'https://images.unsplash.com/photo-1595000072051-5afcb1eef556?auto=format&fit=crop&q=80&w=600'}
          alt={service.name || 'Service'}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
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
          <Link to="/ai-consultant" className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-[#F2BFC8] hover:bg-[#F2BFC8] hover:text-white transition-all">
            <ShoppingBag className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
