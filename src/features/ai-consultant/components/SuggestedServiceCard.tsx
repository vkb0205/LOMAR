import { ServiceRow } from '../types';

interface SuggestedServiceCardProps {
  service: ServiceRow;
}

export function SuggestedServiceCard({ service }: SuggestedServiceCardProps) {
  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
      <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
        <img
          src={service.thumbnail_url || 'https://images.unsplash.com/photo-1595000072051-5afcb1eef556?auto=format&fit=crop&q=80&w=600'}
          alt={service.name || 'Service'}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 left-3 bg-rose-500 text-white text-[10px] font-bold uppercase px-3 py-1 rounded-full tracking-wider">
          Đề xuất
        </div>
      </div>
      <div className="p-4">
        <h4 className="font-bold text-gray-900 text-sm">{service.name}</h4>
        <p className="text-xs text-rose-600 font-bold mt-1">
          {Number(service.base_price).toLocaleString('vi-VN')} VND
        </p>
      </div>
    </div>
  );
}
