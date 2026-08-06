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

export const SERVICES_PAGE_SIZE = 9;

export function useServicesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || 'Tất Cả';
  const [activeCategory, setActiveCategory] = useState('Tất Cả');
  const [vendors, setVendors] = useState<VendorCardModel[]>([]);
  const [categories, setCategories] = useState<string[]>(getDefaultVendorCategories());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

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

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredVendors.length / SERVICES_PAGE_SIZE)),
    [filteredVendors.length]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchTerm]);

  const paginatedVendors = useMemo(() => {
    const start = (currentPage - 1) * SERVICES_PAGE_SIZE;
    return filteredVendors.slice(start, start + SERVICES_PAGE_SIZE);
  }, [currentPage, filteredVendors]);

  const setCategory = (category: string) => setSearchParams({ category });

  return {
    activeCategory,
    categories,
    currentPage,
    filteredVendors,
    loading,
    paginatedVendors,
    searchTerm,
    setCategory,
    setCurrentPage,
    setSearchTerm,
    totalPages,
  };
}
