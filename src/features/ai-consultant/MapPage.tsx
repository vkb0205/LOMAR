import { useCallback, useState } from 'react';
import { MapPin, MessageCircle, Route } from 'lucide-react';
import { HoVanHueMap } from './components/map/HoVanHueMap';
import { MapChatPanel } from './components/map/MapChatPanel';
import { categoryMeta, vendors, type VendorCategory } from './data/hoVanHueVendors';
import { ROUTES } from '../../shared/config/routes';
import { Link } from 'react-router-dom';
import { EyebrowTag } from '../../shared/ui/EyebrowTag';

/**
 * Bản đồ Hạnh Phúc — interactive district map for Hồ Văn Huê.
 *
 * Split view: the left panel is the maplibre map with category filters and
 * the AI-generated route; the right panel is Bé Song Hỷ's guided consultant
 * chat that pins ordered itineraries back onto the map. `/ai-consultant`
 * redirects here, replacing the old side-panel consultant page.
 */
export default function MapPage() {
  const [highlightedIds, setHighlightedIds] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<VendorCategory[]>([]);
  // Map-first on small screens; the consultant panel opens from the FAB.
  const [panelOpen, setPanelOpen] = useState(
    () => typeof window === 'undefined' || window.innerWidth >= 1024,
  );

  const selectedVendor = selectedId ? vendors.find(vendor => vendor.id === selectedId) : null;
  const categories = Object.entries(categoryMeta) as [VendorCategory, typeof categoryMeta[VendorCategory]][];

  const handleToggleFilter = useCallback((category: VendorCategory) => {
    setActiveFilters(previous =>
      previous.includes(category) ? previous.filter(item => item !== category) : [...previous, category],
    );
  }, []);

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] w-full flex-col bg-canvas font-sans text-ink md:min-h-[calc(100dvh-4.25rem)]">
      {/* Editorial page header */}
      <header className="mx-auto w-full max-w-[1400px] px-4 pt-24 sm:px-6 md:pt-28 xl:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <EyebrowTag tone="sage">
              <MapPin strokeWidth={1.5} className="h-3 w-3" aria-hidden />
              Khu phố hạnh phúc · Hồ Văn Huê
            </EyebrowTag>
            <h1 className="mt-4 font-serif text-[clamp(1.75rem,4vw,3rem)] font-bold leading-[1.05] tracking-tight text-ink">
              Bản đồ <span className="italic text-rose">Hạnh Phúc</span>
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-pretty text-ink/70 md:text-base">
              Một con phố, trọn vẹn hành trình ngày cưới. Chọn điểm ghé trên bản đồ hoặc để Bé
              Song Hỷ vẽ sẵn tuyến tối ưu cho bạn.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 pb-1">
            {categories.map(([category, meta]) => {
              const active = activeFilters.length === 0 || activeFilters.includes(category);
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleToggleFilter(category)}
                  aria-pressed={active}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-all duration-500 ${
                    active
                      ? 'border-transparent text-ink shadow-sm'
                      : 'border-ink/10 bg-white/60 text-ink/40 opacity-70'
                  }`}
                  style={active ? { background: meta.bg, boxShadow: `inset 0 0 0 1px ${meta.color}33` } : undefined}
                >
                  <span>{meta.icon}</span>
                  <span>{meta.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Split view: map + consultant chat */}
      <div className="mx-auto mt-6 w-full max-w-[1400px] flex-1 px-4 pb-10 sm:px-6 xl:px-8">
        <div className="relative flex h-[calc(100dvh-22rem)] min-h-[560px] w-full gap-4 overflow-hidden md:gap-6">
          <main className="relative min-w-0 flex-1 overflow-hidden">
            <HoVanHueMap
              activeFilters={activeFilters}
              highlightedIds={highlightedIds}
              selectedId={selectedId}
              onSelectVendor={setSelectedId}
            />

            {/* Route status chip */}
            <div className="pointer-events-none absolute left-1/2 top-4 z-[600] -translate-x-1/2 px-4">
              <div className="flex items-center gap-2 rounded-full border border-ink/10 bg-white/90 px-4 py-2 text-xs font-medium text-ink shadow-card backdrop-blur-md">
                <Route strokeWidth={1.5} className="h-4 w-4 text-rose-deep" />
                <span className="whitespace-nowrap">
                  {highlightedIds.length > 0
                    ? `Route đề xuất: ${highlightedIds.length} điểm từ vị trí của bạn`
                    : selectedVendor
                      ? `Đang chọn: ${selectedVendor.name}`
                      : 'Chọn pin hoặc chat để tạo route đề xuất'}
                </span>
              </div>
            </div>

            {/* Route legend, only when a route exists */}
            {highlightedIds.length > 0 && (
              <div className="absolute bottom-6 left-4 z-[550] flex items-center gap-1.5 rounded-full border border-ink/10 bg-white/90 px-3 py-2 shadow-card backdrop-blur-md">
                <div
                  className="h-0.5 w-6 rounded bg-rose-deep"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(90deg, #a4506b 0, #a4506b 4px, transparent 4px, transparent 8px)',
                  }}
                />
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/60">
                  Route tối ưu
                </p>
              </div>
            )}

            {!panelOpen && (
              <button
                type="button"
                onClick={() => setPanelOpen(true)}
                aria-label="Hiện chat"
                title="Hiện chat"
                className="absolute bottom-6 right-4 z-[650] flex h-12 w-12 items-center justify-center rounded-full bg-rose text-white shadow-float transition-all duration-500 ease-fluid hover:-translate-y-0.5 hover:bg-ink lg:hidden"
              >
                <MessageCircle strokeWidth={1.5} className="h-5 w-5" />
              </button>
            )}
          </main>

          <aside
            className={`shrink-0 overflow-hidden transition-all duration-300 ease-in-out ${
              panelOpen
                ? 'absolute inset-y-0 right-0 z-[700] w-full md:static md:z-auto md:w-[380px]'
                : 'w-0'
            }`}
          >
            {panelOpen && (
              <div className="h-full w-full">
                <MapChatPanel
                  highlightedIds={highlightedIds}
                  onHighlight={setHighlightedIds}
                  onSelectVendor={setSelectedId}
                  onClose={() => setPanelOpen(false)}
                />
              </div>
            )}
          </aside>
        </div>

        {/* Soft nudge into the full catalog */}
        <p className="mt-6 text-center text-xs text-ink/50">
          Muốn xem đầy đủ chi tiết từng vendor?{' '}
          <Link
            to={ROUTES.explore}
            className="font-semibold text-rose-deep underline decoration-rose/40 underline-offset-4 transition-colors hover:text-ink"
          >
            Khám phá dịch vụ
          </Link>
        </p>
      </div>
    </div>
  );
}
