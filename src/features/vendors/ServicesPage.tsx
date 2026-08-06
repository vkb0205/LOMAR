import { useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FloatingChat from '../chat/components/FloatingChat';
import { CategoryFilterBar } from './components/CategoryFilterBar';
import { Pagination } from './components/Pagination';
import { ServicesChat } from './components/ServicesChat';
import { ServicesHero } from './components/ServicesHero';
import { VendorCard } from './components/VendorCard';
import { useServicesChat } from './hooks/useServicesChat';
import { useServicesPage } from './hooks/useServicesPage';

export default function Services() {
  const navigate = useNavigate();
  const services = useServicesPage();
  const chat = useServicesChat();
  const categoryBarRef = useRef<HTMLDivElement>(null);
  const prevPageRef = useRef(services.currentPage);

  useEffect(() => {
    if (prevPageRef.current !== services.currentPage) {
      categoryBarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    prevPageRef.current = services.currentPage;
  }, [services.currentPage]);

  return (
    <div className="w-full flex flex-col font-sans pb-20 bg-[#FFFFFF] min-h-screen">
      <ServicesHero searchTerm={services.searchTerm} onSearchTermChange={services.setSearchTerm} />

      <div className="max-w-[1400px] mx-auto w-full px-4 mt-8 lg:mt-12">
        <div ref={categoryBarRef} className="scroll-mt-24">
          <CategoryFilterBar activeCategory={services.activeCategory} categories={services.categories} onCategoryChange={services.setCategory} />
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          <div className="flex-1 w-full min-w-0">
            {services.loading ? (
              <div className="w-full flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F2BFC8]"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                {services.paginatedVendors.map((vendor, index) => (
                  <VendorCard key={vendor.id} vendor={vendor} index={index} onOpen={vendorId => navigate(`/vendor/${vendorId}`)} />
                ))}
              </div>
            )}

            {services.filteredVendors.length === 0 && !services.loading && (
              <div className="w-full py-20 text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 text-rose-300 shadow-sm">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-[#1B2C40] font-serif font-bold text-xl mb-2">Không tìm thấy dịch vụ</h3>
                <p className="text-[#6B92B4] text-sm max-w-md">Hiện tại chưa có dịch vụ nào trong danh mục này. Vui lòng thử lại sau hoặc chọn danh mục khác.</p>
              </div>
            )}

            {!services.loading && services.filteredVendors.length > 0 && services.totalPages > 1 && (
              <Pagination
                currentPage={services.currentPage}
                totalPages={services.totalPages}
                onPageChange={services.setCurrentPage}
              />
            )}
          </div>

          <aside className="hidden lg:block w-full lg:w-[380px] flex-shrink-0 lg:sticky lg:top-24 lg:self-start">
            <ServicesChat
              chatContainerRef={chat.chatContainerRef}
              inputValue={chat.inputValue}
              isGenerating={chat.isGenerating}
              messages={chat.messages}
              onGenerate={chat.onGenerate}
              onInputChange={chat.setInputValue}
              retrievedServices={chat.retrievedServices}
            />
          </aside>
        </div>
      </div>

      <div className="lg:hidden">
        <FloatingChat />
      </div>
    </div>
  );
}

