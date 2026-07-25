import { useEffect, useMemo, useState } from 'react';
import { isServiceInCategory } from '../utils/category';
import { MannequinType, ServiceRow, VendorRow } from '../types';

interface UseCustomizeSelectionInput {
  allImages: Record<string, string[]>;
  allServices: ServiceRow[];
  allVendors: Record<string, VendorRow>;
}

interface UseCustomizeSelectionResult {
  activeProductId: string;
  activeProductIds: Record<string, string>;
  activeService: ServiceRow | undefined;
  activeTab: string;
  isProductDropdownOpen: boolean;
  selectedMannequin: MannequinType;
  selectedThumb: string | null;
  servicesInActiveTab: ServiceRow[];
  vendorInfo: VendorRow | null;
  handleProductChange: (newProductId: string) => void;
  setActiveProductIds: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  setIsProductDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedMannequin: React.Dispatch<React.SetStateAction<MannequinType>>;
  setSelectedThumb: React.Dispatch<React.SetStateAction<string | null>>;
}

export function useCustomizeSelection({
  allImages,
  allServices,
  allVendors,
}: UseCustomizeSelectionInput): UseCustomizeSelectionResult {
  const [activeTab, setActiveTab] = useState('');
  const [activeProductIds, setActiveProductIds] = useState<Record<string, string>>({});
  const [selectedMannequin, setSelectedMannequin] = useState<MannequinType>('female');
  const [selectedThumb, setSelectedThumb] = useState<string | null>(null);
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);

  const activeProductId = activeProductIds[activeTab];
  const activeService = useMemo(
    () => allServices.find(service => service.id === activeProductId),
    [activeProductId, allServices]
  );
  const vendorInfo = activeService?.vendor_id ? allVendors[activeService.vendor_id] : null;
  const servicesInActiveTab = useMemo(
    () => allServices.filter(service => activeTab && isServiceInCategory(service, activeTab)),
    [activeTab, allServices]
  );

  useEffect(() => {
    if (!activeTab || allServices.length === 0) return;

    const currentId = activeProductIds[activeTab];
    const currentServiceExists = allServices.some(service => service.id === currentId);
    if (currentServiceExists) return;

    const fallbackService = allServices.find(service => isServiceInCategory(service, activeTab));
    if (fallbackService) {
      setActiveProductIds(previous => ({ ...previous, [activeTab]: fallbackService.id }));
    }
  }, [activeTab, activeProductIds, allServices]);

  const handleProductChange = (newProductId: string) => {
    setActiveProductIds(previous => ({ ...previous, [activeTab]: newProductId }));
    setSelectedThumb(null);
  };

  return {
    activeProductId,
    activeProductIds,
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
  };
}
