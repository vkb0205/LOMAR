import { MapPin, Star } from 'lucide-react';
import { motion } from 'motion/react';
import type { VendorCardModel } from '../types';

const fadeVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

interface VendorCardProps {
  index: number;
  vendor: VendorCardModel;
  onOpen: (vendorId: string) => void;
}

export function VendorCard({ index, vendor, onOpen }: VendorCardProps) {
  const fallbackImage = `https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&q=80&w=600&sig=${vendor.id}`;

  return (
    <motion.div
      variants={fadeVariant}
      initial="hidden"
      animate="visible"
      transition={{ delay: index * 0.1 }}
      onClick={() => onOpen(vendor.id)}
      className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-rose-100 hover:shadow-md hover:-translate-y-1 transition-all group cursor-pointer flex flex-col"
    >
      <div className="w-full aspect-[4/3] relative overflow-hidden bg-gray-100">
        <img
          src={vendor.img || fallbackImage}
          alt={vendor.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-[#1B2C40] uppercase tracking-widest shadow-sm">
          {vendor.category}
        </div>
      </div>
      <div className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-serif font-bold text-lg text-[#1B2C40] group-hover:text-[#314ad0] transition-colors leading-tight">{vendor.name}</h3>
          <div className="flex items-center bg-[#ffe9c9] px-2 py-1 rounded-md text-[#ffcc7e] font-bold text-xs shrink-0">
            <Star className="w-3 h-3 fill-current mr-1" />{vendor.rating || '5.0'}
          </div>
        </div>
        {vendor.addr && (
          <div className="flex items-center text-[#6B92B4] text-xs mb-4">
            <MapPin className="w-3.5 h-3.5 mr-1 shrink-0" />
            <span className="truncate">{vendor.addr}</span>
          </div>
        )}
        <button className="mt-auto w-full py-3 bg-[#FAF6EE] text-[#1B2C40] rounded-full font-bold text-[10px] uppercase tracking-widest group-hover:bg-[#deebff] group-hover:text-[#091e8c] transition-colors border border-transparent">
          XEM CHI TIẾT
        </button>
      </div>
    </motion.div>
  );
}
