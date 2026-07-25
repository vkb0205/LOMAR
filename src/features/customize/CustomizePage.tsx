import { useEffect } from 'react';
import { useAuth } from '../auth/hooks/useAuth';
import { useCustomization } from './hooks/useCustomization';
import { CategoryTabs } from './components/CategoryTabs';
import { CustomizeChat } from './components/CustomizeChat';
import { PreviewActions } from './components/PreviewActions';
import { PreviewCanvas } from './components/PreviewCanvas';
import { PreviewHeader } from './components/PreviewHeader';
import { ServiceSelector } from './components/ServiceSelector';
import { VenueComingSoon } from './components/VenueComingSoon';
import { useCustomizeCatalog } from './hooks/useCustomizeCatalog';
import { useCustomizeChat } from './hooks/useCustomizeChat';
import { useCustomizePreview } from './hooks/useCustomizePreview';
import { useCustomizeSelection } from './hooks/useCustomizeSelection';
import { buildInitialActiveProductIds, PLACEHOLDER_IMAGE } from './services/customizeCatalogService';

export default function Customize() {
  const { user } = useAuth();
  const { customizedServices, saveCustomizedService } = useCustomization();
  const userId = user?.id ?? null;
  const { catalog } = useCustomizeCatalog();
  const {
    activeProductId,
    activeService,
    activeTab,
    isProductDropdownOpen,
    selectedMannequin,
    selectedThumb,
    servicesInActiveTab,
    vendorInfo,
    handleProductChange,
    setActiveProductIds,
    setActiveTab,
    setIsProductDropdownOpen,
    setSelectedMannequin,
    setSelectedThumb,
  } = useCustomizeSelection({
    allImages: catalog.imagesByServiceId,
    allServices: catalog.services,
    allVendors: catalog.vendorsById,
  });

  const serviceImages = activeProductId ? catalog.imagesByServiceId[activeProductId] : [];
  const baseImage = serviceImages?.[0] || PLACEHOLDER_IMAGE;
  const currentMainImage = selectedThumb || baseImage;
  const currentPrice = Number(activeService?.base_price || 0);

  const chat = useCustomizeChat(userId, activeTab);
  const preview = useCustomizePreview({
    activeProductId,
    activeService,
    activeTab,
    currentMainImage,
    inputValue: chat.inputValue,
    selectedMannequin,
    userId,
    vendorInfo,
    appendAssistantMessage: chat.appendAssistantMessage,
    appendUserMessage: chat.appendUserMessage,
    persistMessage: chat.persistMessage,
    setInputValue: chat.setInputValue,
  });

  useEffect(() => {
    if (catalog.tabs.length === 0 || catalog.services.length === 0) return;

    setActiveProductIds(buildInitialActiveProductIds(catalog.tabs, catalog.services, customizedServices));
    setActiveTab(catalog.tabs[0] || '');
    // Keep this as an initial-load effect so customization writes below do not reinitialize selection.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalog.tabs, catalog.services]);

  useEffect(() => {
    setSelectedThumb(null);
  }, [activeTab, setSelectedThumb]);

  useEffect(() => {
    if (!activeProductId || !activeService) return;

    const currentService = {
      category: activeTab,
      productId: activeProductId,
      productName: activeService.name || '',
      basePrice: Number(activeService.base_price || 0),
      totalPrice: Number(activeService.base_price || 0),
      imageUrl: catalog.imagesByServiceId[activeProductId]?.[0] || PLACEHOLDER_IMAGE,
      vendorName: vendorInfo?.name || 'Bé Song Hỷ',
      selectedOptions: [],
    };

    const previousSavedService = customizedServices[activeTab];
    if (!previousSavedService || previousSavedService.productId !== activeProductId) {
      saveCustomizedService(activeTab, currentService);
    }
  }, [
    activeTab,
    activeProductId,
    activeService,
    catalog.imagesByServiceId,
    vendorInfo,
    customizedServices,
    saveCustomizedService,
  ]);

  return (
    <div className="w-full flex flex-col font-sans pb-10 mt-6 px-4 bg-[#FFFFFF] min-h-screen">
      <CategoryTabs tabs={catalog.tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'Venue' ? (
        <VenueComingSoon />
      ) : (
        <div className="max-w-[1400px] w-full mx-auto flex flex-col lg:flex-row gap-6 lg:gap-8 lg:h-[800px] items-start">
          <aside className="lg:w-[320px] flex-shrink-0 flex flex-col gap-3 overflow-y-auto no-scrollbar pb-4 h-full">
            <ServiceSelector
              activeTab={activeTab}
              activeProductId={activeProductId}
              activeService={activeService}
              allImages={catalog.imagesByServiceId}
              allServices={servicesInActiveTab}
              isOpen={isProductDropdownOpen}
              onChange={handleProductChange}
              onOpenChange={setIsProductDropdownOpen}
            />

            <div className="relative z-10 space-y-3">
              <div className="text-center p-6 text-sm text-gray-500 bg-white/50 rounded-3xl border border-rose-100">
                Tùy chỉnh AI — Hãy nhập mô tả hoặc yêu cầu trong chat bên phải để Bé Song tạo thiết kế.
              </div>
            </div>
          </aside>

          <main className="flex-1 bg-white/70 backdrop-blur-md rounded-[32px] shadow-sm border border-rose-100 overflow-hidden flex flex-col p-6 min-h-[500px] lg:min-h-0 h-full">
            <PreviewHeader
              activeService={activeService}
              activeTab={activeTab}
              selectedMannequin={selectedMannequin}
              vendorInfo={vendorInfo}
              onMannequinChange={setSelectedMannequin}
            />

            <PreviewCanvas
              generatedPreviewUrl={preview.generatedPreviewUrl}
              inputValue={chat.inputValue}
              isGenerating={preview.isGenerating}
              previewImage={preview.previewImage}
              selectedMannequin={selectedMannequin}
              canGenerate={Boolean(activeService)}
              onGenerate={preview.handleGeneratePreview}
              onInputChange={chat.setInputValue}
            />
          </main>

          <aside className="lg:w-[350px] flex flex-col gap-6 h-full min-h-0">
            <PreviewActions
              currentPrice={currentPrice}
              isSaving={preview.isSaving}
              onSaveDesign={preview.handleSaveDesign}
            />
            <CustomizeChat
              chatContainerRef={chat.chatContainerRef}
              inputValue={chat.inputValue}
              isGenerating={preview.isGenerating}
              messages={chat.messages}
              canGenerate={Boolean(activeService)}
              onGenerate={preview.handleGeneratePreview}
              onInputChange={chat.setInputValue}
            />
          </aside>
        </div>
      )}
    </div>
  );
}
