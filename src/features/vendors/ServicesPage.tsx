import { useEffect, useRef, useState } from 'react';
import { MessageCircle, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AssistantChat } from '../ai-consultant/components/AssistantChat';
import { useConsultantChat } from '../ai-consultant/hooks/useConsultantChat';
import { ROUTES } from '../../shared/config/routes';
import { SERVICES_PAGE_SIZE } from './hooks/useServicesPage';
import { CategoryFilterBar } from './components/CategoryFilterBar';
import { Pagination } from './components/Pagination';
import { ResultToolbar } from './components/ResultToolbar';
import { ServicesHero } from './components/ServicesHero';
import { VendorCard } from './components/VendorCard';
import { VendorCardSkeleton } from './components/VendorCardSkeleton';
import { useServicesPage } from './hooks/useServicesPage';

export default function Services() {
  const navigate = useNavigate();
  const services = useServicesPage();
  const chat = useConsultantChat('services');
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
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
          {/* Result workspace — hairline sheet on soft paper (AIC result panel) */}
          <section className="w-full min-w-0 flex-1 overflow-hidden rounded-xl border border-hairline bg-surface-soft">
            {!services.loading && services.filteredVendors.length > 0 && (
              <ResultToolbar
                activeCategory={services.activeCategory}
                loadMs={services.loadMs}
                rangeStart={services.visibleRange.start}
                rangeEnd={services.visibleRange.end}
                sortKey={services.sortKey}
                totalCount={services.filteredVendors.length}
                onSortChange={services.setSortKey}
              />
            )}

            <div className="p-4">
              {services.loading ? (
                <div
                  className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
                  role="status"
                  aria-label="Đang tải dịch vụ"
                >
                  {Array.from({ length: SERVICES_PAGE_SIZE }, (_, index) => (
                    <VendorCardSkeleton key={index} />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3" role="list">
                  {services.paginatedVendors.map((vendor, index) => (
                    <VendorCard
                      key={vendor.id}
                      vendor={vendor}
                      index={(services.currentPage - 1) * SERVICES_PAGE_SIZE + index}
                      onOpen={vendorId => navigate(ROUTES.vendorDetail(vendorId))}
                    />
                  ))}
                </div>
              )}

              {services.filteredVendors.length === 0 && !services.loading && (
                <div className="flex flex-col items-center rounded-xl border border-dashed border-hairline bg-canvas px-8 py-16 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-card text-muted">
                    <Search strokeWidth={1.5} className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 font-serif text-2xl font-normal text-ink">
                    Không tìm thấy dịch vụ
                  </h3>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
                    Hiện tại chưa có dịch vụ nào trong danh mục này. Vui lòng thử lại sau hoặc
                    chọn danh mục khác.
                  </p>
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
          </section>

          {/* Sticky within this results row: it follows the viewport while vendor
              cards scroll, then stops at the row boundary before later sections. */}
          <aside className="hidden w-full shrink-0 self-start lg:sticky lg:top-24 lg:block lg:h-[calc(100dvh-7rem)] lg:w-[380px]">
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

        {/* Mobile consultant — floating launcher and compact chat sheet. */}
        {!mobileChatOpen && (
          <button
            type="button"
            onClick={() => setMobileChatOpen(true)}
            aria-label="Mở trò chuyện với Bé Song Hỷ"
            title="Mở trò chuyện với Bé Song Hỷ"
            className="fixed bottom-5 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-ink text-canvas shadow-lift transition-all duration-200 hover:-translate-y-0.5 hover:bg-ink-soft lg:hidden"
          >
            <MessageCircle strokeWidth={1.5} className="h-5 w-5" />
          </button>
        )}

        {mobileChatOpen && (
          <section
            aria-label="Trợ lý AI Bé Song Hỷ"
            className="fixed inset-x-3 bottom-3 z-50 h-[min(500px,calc(100dvh-1.5rem))] lg:hidden"
          >
            <AssistantChat
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
              compact
              className="shadow-float"
            />
            <button
              type="button"
              onClick={() => setMobileChatOpen(false)}
              aria-label="Đóng trò chuyện"
              title="Đóng trò chuyện"
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg bg-canvas text-muted transition-colors hover:bg-surface-soft hover:text-ink"
            >
              <X strokeWidth={1.5} className="h-4 w-4" />
            </button>
          </section>
        )}
      </div>
    </div>
  );
}
