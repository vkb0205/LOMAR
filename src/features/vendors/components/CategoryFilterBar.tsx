import { Filter } from 'lucide-react';

interface CategoryFilterBarProps {
  activeCategory: string;
  categories: string[];
  onCategoryChange: (category: string) => void;
}

export function CategoryFilterBar({ activeCategory, categories, onCategoryChange }: CategoryFilterBarProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
      <div className="flex overflow-x-auto no-scrollbar w-full md:w-auto pb-2 md:pb-0 gap-2">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`px-6 py-2.5 rounded-full text-xs font-bold tracking-widest whitespace-nowrap transition-all uppercase border ${activeCategory === category ? 'bg-[#1B2C40] text-white border-[#1B2C40]' : 'bg-white text-[#1B2C40] border-rose-100 hover:border-[#1B2C40]'}`}
          >
            {category}
          </button>
        ))}
      </div>
      <button className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white border border-rose-100 text-[#1B2C40] text-xs font-bold tracking-widest uppercase hover:bg-rose-50 transition-colors shrink-0">
        <Filter className="w-4 h-4" /> BỘ LỌC
      </button>
    </div>
  );
}
