import { useMemo, useState } from 'react';
import locations from '../../data/ho-van-hue-wedding-dresses.json';

interface WeddingLocation {
  id: string;
  name: string;
  type: string;
  address: string;
  lat: number;
  lng: number;
  phone: string;
}

interface LocationListProps {
  selectedId?: string | null;
  onSelect: (location: WeddingLocation) => void;
}

export function LocationList({ selectedId, onSelect }: LocationListProps) {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const allLocations = locations as WeddingLocation[];

  const types = useMemo(() => Array.from(new Set(allLocations.map(item => item.type))), [allLocations]);
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return allLocations.filter(item => {
      const matchesQuery = !normalized || `${item.name} ${item.type}`.toLowerCase().includes(normalized);
      const matchesType = type === 'all' || item.type === type;
      return matchesQuery && matchesType;
    });
  }, [allLocations, query, type]);

  return (
    <section className="flex min-h-0 flex-col border-t border-slate-100 bg-white px-4 py-4">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-rose-600">Địa điểm</p>
          <h2 className="text-sm font-semibold text-slate-900">Váy cưới Hồ Văn Huê</h2>
        </div>
        <span className="text-xs text-slate-400">{filtered.length} địa điểm</span>
      </div>

      <input
        value={query}
        onChange={event => setQuery(event.target.value)}
        placeholder="Tìm theo tên hoặc loại..."
        className="mb-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-rose-300 focus:bg-white"
      />

      <select
        value={type}
        onChange={event => setType(event.target.value)}
        className="mb-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 outline-none focus:border-rose-300"
      >
        <option value="all">Tất cả loại dịch vụ</option>
        {types.map(item => <option key={item} value={item}>{item}</option>)}
      </select>

      <div className="min-h-0 space-y-2 overflow-y-auto pr-1">
        {filtered.map((location, index) => {
          const rank = index + 1;
          const active = location.id === selectedId;
          return (
            <button
              type="button"
              key={location.id}
              onClick={() => onSelect(location)}
              className={`group flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition ${
                active ? 'border-rose-200 bg-rose-50 shadow-sm' : 'border-slate-100 bg-white hover:border-rose-100 hover:bg-rose-50/40'
              }`}
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-rose-600 text-xs font-bold text-white">{rank}</span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-slate-900">{location.name}</span>
                <span className="mt-0.5 block text-xs text-slate-500">{location.type}</span>
                <span className="mt-1 block truncate text-[11px] text-slate-400">{location.address}</span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
