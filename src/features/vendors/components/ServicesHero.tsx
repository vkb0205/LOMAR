import { Search } from 'lucide-react';
import { motion } from 'motion/react';

interface ServicesHeroProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
}

export function ServicesHero({ searchTerm, onSearchTermChange }: ServicesHeroProps) {
  return (
    <div className="relative w-full h-[300px] md:h-[400px] flex items-center justify-center overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=2000"
        alt="Wedding Services"
        className="absolute inset-0 w-full h-full object-cover opacity-80"
      />
      <div className="absolute inset-0 bg-[#1B2C40]/40" />
      <div className="relative z-10 text-center px-4 flex flex-col items-center">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-4 uppercase tracking-widest">
          DỊCH VỤ CƯỚI
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-white/90 text-sm md:text-base max-w-xl font-medium">
          Khám phá hệ sinh thái dịch vụ cưới trọn vẹn tại Phố Hạnh Phúc, nơi quy tụ những thương hiệu uy tín nhất.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-8 w-full max-w-2xl relative flex items-center bg-white rounded-full shadow-lg p-2">
          <div className="absolute left-6 text-gray-400"><Search className="w-5 h-5" /></div>
          <input
            type="text"
            placeholder="Tìm kiếm dịch vụ, thương hiệu..."
            value={searchTerm}
            onChange={event => onSearchTermChange(event.target.value)}
            className="w-full pl-14 pr-32 py-3 rounded-full focus:outline-none text-[#1B2C40] bg-transparent"
          />
          <button className="absolute right-2 top-2 bottom-2 bg-[#ffe9c9] text-[#1B2C40] px-6 md:px-8 rounded-full font-bold text-xs tracking-widest uppercase hover:bg-[#ffdb9f] transition-colors">
            TÌM KIẾM
          </button>
        </motion.div>
      </div>
    </div>
  );
}
