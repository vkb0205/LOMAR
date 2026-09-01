import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { VendorCardModel, VendorSortKey } from '../types';
import {
  deriveVendorCategories,
  fetchVendorCatalog,
  filterVendors,
  getDefaultVendorCategories,
  mapExternalCategory,
  sortVendors,
} from '../services/vendorCatalogService';

export const SERVICES_PAGE_SIZE = 9;

export function useServicesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || 'Tất Cả';
  const [activeCategory, setActiveCategory] = useState('Tất Cả');
  const [vendors, setVendors] = useState<VendorCardModel[]>([]);
  const [categories, setCategories] = useState<string[]>(getDefaultVendorCategories());
  const [loading, setLoading] = useState(true);
  const [loadMs, setLoadMs] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<VendorSortKey>('featured');
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
        const started = performance.now();
        const catalog = await fetchVendorCatalog();
        if (!active) return;
        setLoadMs(performance.now() - started);
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
    () => sortVendors(filterVendors(vendors, activeCategory, searchTerm), sortKey),
    [activeCategory, searchTerm, sortKey, vendors]
  );

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredVendors.length / SERVICES_PAGE_SIZE)),
    [filteredVendors.length]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchTerm, sortKey]);

  const paginatedVendors = useMemo(() => {
    const start = (currentPage - 1) * SERVICES_PAGE_SIZE;
    return filteredVendors.slice(start, start + SERVICES_PAGE_SIZE);
  }, [currentPage, filteredVendors]);

  const setCategory = (category: string) => setSearchParams({ category });

  const visibleRange = useMemo(() => {
    if (filteredVendors.length === 0) return { start: 0, end: 0 };
    const start = (currentPage - 1) * SERVICES_PAGE_SIZE + 1;
    return { start, end: Math.min(start + paginatedVendors.length - 1, filteredVendors.length) };
  }, [currentPage, filteredVendors.length, paginatedVendors.length]);

  return {
    activeCategory,
    categories,
    currentPage,
    filteredVendors,
    loadMs,
    loading,
    paginatedVendors,
    searchTerm,
    setCategory,
    setCurrentPage,
    setSearchTerm,
    setSortKey,
    sortKey,
    totalPages,
    visibleRange,
  };
}
