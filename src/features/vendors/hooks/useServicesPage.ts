import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { VendorCardModel } from '../types';
import {
  deriveVendorCategories,
  fetchVendorCatalog,
  filterVendors,
  getDefaultVendorCategories,
  mapExternalCategory,
} from '../services/vendorCatalogService';

export function useServicesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || 'Tất Cả';
  const [activeCategory, setActiveCategory] = useState('Tất Cả');
  const [vendors, setVendors] = useState<VendorCardModel[]>([]);
  const [categories, setCategories] = useState<string[]>(getDefaultVendorCategories());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const resolved = mapExternalCategory(categoryParam);
    const matched = categories.find(category => category.toLowerCase() === resolved.toLowerCase()) || resolved;
    setActiveCategory(matched);
  }, [categoryParam, categories]);

  useEffect(() => {
    let active = true;

    async function loadVendors() {
      try {
        setLoading(true);
        const catalog = await fetchVendorCatalog();
        if (!active) return;
        setVendors(catalog);
        setCategories(deriveVendorCategories(catalog));
      } catch (error) {
        console.error('Error fetching vendors:', error);
        if (active) setVendors([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadVendors();
    return () => {
      active = false;
    };
  }, []);

  const filteredVendors = useMemo(
    () => filterVendors(vendors, activeCategory, searchTerm),
    [activeCategory, searchTerm, vendors]
  );

  const setCategory = (category: string) => setSearchParams({ category });

  return {
    activeCategory,
    categories,
    filteredVendors,
    loading,
    searchTerm,
    setCategory,
    setSearchTerm,
  };
}
