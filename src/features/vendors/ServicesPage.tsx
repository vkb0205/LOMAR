import { useEffect, useRef } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AssistantChat } from '../ai-consultant/components/AssistantChat';
import { useConsultantChat } from '../ai-consultant/hooks/useConsultantChat';
import { openContextualAssistant } from '../chat/openAssistant';
import { ROUTES } from '../../shared/config/routes';
import { CategoryFilterBar } from './components/CategoryFilterBar';
import { Pagination } from './components/Pagination';
import { ServicesHero } from './components/ServicesHero';
import { VendorCard } from './components/VendorCard';
import { useServicesPage } from './hooks/useServicesPage';
import { Spinner } from '../../shared/ui/Spinner';
import { EmptyState } from '../../shared/ui/EmptyState';

export default function Services() {
  const navigate = useNavigate();
  const services = useServicesPage();
  const chat = useConsultantChat('services');
  const categoryBarRef = useRef<HTMLDivElement>(null);
  const prevPageRef = useRef(services.currentPage);

  useEffect(() => {
    if (prevPageRef.current !== services.currentPage) {
      categoryBarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    prevPageRef.current = services.currentPage;
  }, [services.currentPage]);

  return (
    <div className="flex w-full flex-col bg-canvas pb-24">
      <ServicesHero searchTerm={services.searchTerm} onSearchTermChange={services.setSearchTerm} />

      <div className="mx-auto mt-2 w-full max-w-[1400px] px-4">
        <div ref={categoryBarRef} className="scroll-mt-32">
          <CategoryFilterBar
            activeCategory={services.activeCategory}
            categories={services.categories}
            onCategoryChange={services.setCategory}
          />
        </div>

        <div className="flex flex-col items-start gap-8 lg:flex-row lg:gap-10">
          <div className="w-full min-w-0 flex-1">
            {services.loading ? (
              <div className="flex w-full justify-center py-24">
                <Spinner />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
                {services.paginatedVendors.map((vendor, index) => (
                  <VendorCard
                    key={vendor.id}
                    vendor={vendor}
                    index={index}
                    onOpen={vendorId => navigate(ROUTES.vendorDetail(vendorId))}
                  />
                ))}
              </div>
            )}

            {services.filteredVendors.length === 0 && !services.loading && (
              <div className="w-full py-16">
                <EmptyState
                  icon={<Search strokeWidth={1.5} className="h-7 w-7" />}
                  title="Không tìm thấy dịch vụ"
                  description="Hiện tại chưa có dịch vụ nào trong danh mục này. Vui lòng thử lại sau hoặc chọn danh mục khác."
                />
              </div>
            )}

            {!services.loading &&
              services.filteredVendors.length > 0 &&
              services.totalPages > 1 && (
                <Pagination
                  currentPage={services.currentPage}
                  totalPages={services.totalPages}
                  onPageChange={services.setCurrentPage}
                />
              )}
          </div>

          <aside className="hidden w-full shrink-0 lg:block lg:w-[380px] lg:sticky lg:top-24 lg:self-start">
            <AssistantChat
              layout="sidebar"
              title="Bé Song Hỷ"
              subtitle="Gợi ý dịch vụ phù hợp"
              input={chat.input}
              isTyping={chat.isTyping}
              messages={chat.messages}
              messagesEndRef={chat.messagesEndRef}
              scrollContainerRef={chat.scrollContainerRef}
              retrievedServices={chat.retrievedServices}
              onInputChange={chat.setInput}
              onSubmit={chat.submitMessage}
            />
          </aside>
        </div>

        {/* Mobile AI banner — dark bezel panel */}
        <div className="mt-10 rounded-bezel bg-gradient-to-br from-ink to-ink-soft p-1.5 ring-1 ring-white/10 shadow-float lg:hidden">
          <div className="rounded-bezel-inner flex flex-col justify-between gap-4 bg-ink-deep/40 p-5 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                <Sparkles strokeWidth={1.5} className="h-5 w-5 text-cream" />
              </div>
              <div>
                <p className="font-serif text-base font-bold text-canvas">Cần gợi ý nhanh?</p>
                <p className="mt-1 text-xs leading-relaxed text-canvas/70">
                  Mở Bé Song Hỷ để hỏi ngân sách, concept hoặc dịch vụ phù hợp ngay tại đây.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => openContextualAssistant()}
              className="group inline-flex shrink-0 items-center justify-center gap-2.5 rounded-full bg-cream py-2 pl-5 pr-2 text-[11px] font-bold uppercase tracking-widest text-ink-deep transition-all duration-500 ease-fluid hover:bg-gold active:scale-[0.98]"
            >
              Mở tư vấn AI
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink-deep/10 transition-all duration-500 ease-fluid group-hover:translate-x-1 group-hover:-translate-y-[1px] group-hover:scale-105">
                <Sparkles strokeWidth={1.5} className="h-3.5 w-3.5" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
