import { useCallback, useState } from 'react';
import { ChevronLeft, ChevronRight, MapPin, MessageCircle, Route, Sparkles } from 'lucide-react';
import { ChatPanel } from './components/ChatPanel';
import { HoVanHueMap } from './components/map/HoVanHueMap';
import { categoryMeta, vendors, type VendorCategory } from './data/hoVanHueVendors';

export default function AIConsultant() {
  const [highlightedIds, setHighlightedIds] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<VendorCategory[]>([]);
  const [panelOpen, setPanelOpen] = useState(true);

  const selectedVendor = selectedId ? vendors.find(vendor => vendor.id === selectedId) : null;
  const categories = Object.entries(categoryMeta) as [VendorCategory, typeof categoryMeta[VendorCategory]][];

  const handleToggleFilter = useCallback((category: VendorCategory) => {
    setActiveFilters(previous =>
      previous.includes(category) ? previous.filter(item => item !== category) : [...previous, category],
    );
  }, []);

  return (
    <div className="flex h-[calc(100dvh-8rem)] min-h-0 w-full flex-col overflow-hidden bg-[#faf6f0] text-[#2d2520] md:h-[calc(100dvh-5rem)]">
      {/* <header className="z-10 flex shrink-0 items-center gap-4 border-b border-[#ede5d8] bg-white px-4 py-3.5 shadow-sm md:px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#c9906a] to-[#a8714f] text-sm font-bold text-white shadow-sm">
            HVH
          </div>
          <div className="min-w-0">
            <h1 className="truncate font-serif text-base font-semibold leading-tight text-[#2d2520]">
              Wedding Street AI
            </h1>
            <p className="truncate text-[11px] leading-tight text-[#7a6e68]">Hồ Văn Huê · Phú Nhuận</p>
          </div>
        </div>

        <div className="hidden h-5 w-px bg-[#ede5d8] sm:block" />

        <div className="hidden items-center gap-1.5 text-xs text-[#7a6e68] sm:flex">
          <span className="h-2 w-2 rounded-full bg-[#8aab8a]" />
          <span>{vendors.length} vendors trên tuyến</span>
        </div>

        {highlightedIds.length > 0 && (
          <>
            <div className="hidden h-5 w-px bg-[#ede5d8] lg:block" />
            <div className="hidden min-w-0 items-center gap-1.5 text-xs font-medium text-[#c9906a] lg:flex">
              <Sparkles className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{highlightedIds.length} vendor được đề xuất</span>
            </div>
          </>
        )}

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden items-center gap-1.5 rounded-full bg-[#f5e6e0] px-3 py-1.5 text-xs font-medium text-[#c9906a] md:flex">
            <MapPin className="h-3.5 w-3.5" />
            <span>TP. Hồ Chí Minh</span>
          </div>
          <button
            type="button"
            onClick={() => setPanelOpen(open => !open)}
            className="flex items-center gap-1.5 rounded-full border border-[#ede5d8] px-3 py-1.5 text-xs font-medium text-[#7a6e68] transition hover:border-[#c9906a] hover:text-[#c9906a]"
          >
            {panelOpen ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{panelOpen ? 'Ẩn chat' : 'Hiện chat'}</span>
          </button>
        </div>
      </header> */}

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <main className="relative min-w-0 flex-1 overflow-hidden">
          <HoVanHueMap
            activeFilters={activeFilters}
            highlightedIds={highlightedIds}
            selectedId={selectedId}
            onSelectVendor={setSelectedId}
          />

          <div className="pointer-events-none absolute left-1/2 top-4 z-[600] -translate-x-1/2 px-4">
            <div className="flex items-center gap-2 rounded-2xl border border-[#ede5d8] bg-white/90 px-4 py-2 text-xs font-medium text-[#2d2520] shadow-sm backdrop-blur-md">
              <Route className="h-4 w-4 text-[#c9906a]" />
              <span className="whitespace-nowrap">
                {highlightedIds.length > 0
                  ? `Route đề xuất: ${highlightedIds.length} điểm từ vị trí của bạn`
                  : selectedVendor
                    ? `Đang chọn: ${selectedVendor.name}`
                    : 'Chọn pin hoặc chat để tạo route đề xuất'}
              </span>
            </div>
          </div>

          <div className="absolute bottom-6 left-4 z-[550] max-w-[250px] rounded-2xl border border-[#ede5d8] bg-white/90 p-3 shadow-lg backdrop-blur-md">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7a6e68]">Lọc theo danh mục</p>
            <div className="flex flex-wrap gap-1.5">
              {categories.map(([category, meta]) => {
                const active = activeFilters.length === 0 || activeFilters.includes(category);
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => handleToggleFilter(category)}
                    className={`flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-medium transition ${
                      active ? 'border-transparent text-[#2d2520]' : 'border-[#ede5d8] text-[#b0a8a0] opacity-60'
                    }`}
                    style={{ background: active ? meta.bg : 'transparent' }}
                  >
                    <span>{meta.icon}</span>
                    <span>{meta.label}</span>
                  </button>
                );
              })}
            </div>

            {highlightedIds.length > 0 && (
              <div className="mt-2.5 flex items-center gap-1.5 border-t border-[#ede5d8] pt-2.5">
                <div
                  className="h-0.5 w-5 rounded bg-[#c9906a]"
                  style={{ backgroundImage: 'repeating-linear-gradient(90deg, #c9906a 0, #c9906a 4px, transparent 4px, transparent 8px)' }}
                />
                <p className="text-[10px] text-[#7a6e68]">Route tối ưu</p>
              </div>
            )}
          </div>

          {!panelOpen && (
            <button
              type="button"
              onClick={() => setPanelOpen(true)}
              aria-label="Hiện chat"
              title="Hiện chat"
              className="absolute bottom-6 right-4 z-[650] grid h-12 w-12 place-items-center rounded-full bg-[#c9906a] text-white shadow-lg transition hover:bg-[#a8714f] lg:hidden"
            >
              <MessageCircle className="h-5 w-5" />
            </button>
          )}
        </main>

        <aside
          className={`shrink-0 overflow-hidden border-l border-[#ede5d8] bg-[#faf6f0] transition-all duration-300 ease-in-out ${
            panelOpen ? 'absolute inset-y-0 right-0 z-[700] w-full md:w-[380px] lg:static lg:z-auto lg:w-[380px]' : 'w-0'
          }`}
        >
          {panelOpen && (
            <div className="h-full w-full">
              <ChatPanel
                highlightedIds={highlightedIds}
                onHighlight={setHighlightedIds}
                onSelectVendor={setSelectedId}
                onClose={() => setPanelOpen(false)}
              />
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
