import { useEffect, useState } from 'react';
import { fetchCustomizeCatalog } from '../services/customizeCatalogService';
import { CustomizeCatalog } from '../types';

interface UseCustomizeCatalogResult {
  catalog: CustomizeCatalog;
}

const EMPTY_CATALOG: CustomizeCatalog = {
  services: [],
  vendorsById: {},
  imagesByServiceId: {},
  tabs: [],
};

export function useCustomizeCatalog(): UseCustomizeCatalogResult {
  const [catalog, setCatalog] = useState<CustomizeCatalog>(EMPTY_CATALOG);

  useEffect(() => {
    async function loadCatalog() {
      try {
        const nextCatalog = await fetchCustomizeCatalog();
        if (!nextCatalog) return;

        setCatalog(nextCatalog);
      } catch (error) {
        console.error('Lỗi khi fetch data:', error);
      }
    }

    loadCatalog();
  }, []);

  return { catalog };
}
