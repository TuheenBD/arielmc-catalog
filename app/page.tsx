'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import FilterSidebar from '@/components/FilterSidebar';
import ProductGrid from '@/components/ProductGrid';
import ExportTray from '@/components/ExportTray';
import { MOCK_PRODUCTS } from '@/data/mockProducts';
import { Product, FilterState, ProductCategory } from '@/types/product';
import { ShieldCheck, Globe, X } from 'lucide-react';

function CatalogContent() {
  const searchParams = useSearchParams();
  const [products] = useState<Product[]>(MOCK_PRODUCTS);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    selectedCategories: [],
    priceRange: [0, 500],
    selectedMaterials: [],
    sortBy: 'featured',
  });

  // Deep-linking: Parse incoming query parameters from arielmc-website
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const skusParam = searchParams.get('skus');
    const searchParam = searchParams.get('search');

    if (categoryParam) {
      const matchedCat = ['Leather', 'Jute', 'Ceramics', 'Textiles', 'Pottery'].find(
        (c) => c.toLowerCase() === categoryParam.toLowerCase()
      ) as ProductCategory | undefined;

      if (matchedCat) {
        setFilters((prev) => ({ ...prev, selectedCategories: [matchedCat] }));
      }
    }

    if (searchParam) {
      setFilters((prev) => ({ ...prev, searchQuery: searchParam }));
    }

    if (skusParam) {
      const targetSkus = skusParam.split(',').map((s) => s.trim().toUpperCase());
      const preSelected = products.filter((p) => targetSkus.includes(p.sku.toUpperCase()));
      if (preSelected.length > 0) {
        setSelectedProducts(preSelected);
      }
    }
  }, [searchParams, products]);

  // Extract unique materials
  const availableMaterials = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.materials.forEach((m) => set.add(m)));
    return Array.from(set).sort();
  }, [products]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<ProductCategory, number> = {
      Leather: 0,
      Jute: 0,
      Ceramics: 0,
      Textiles: 0,
      Pottery: 0,
    };
    products.forEach((p) => {
      if (counts[p.category] !== undefined) {
        counts[p.category]++;
      }
    });
    return counts;
  }, [products]);

  // Filtered & sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        if (filters.searchQuery.trim()) {
          const q = filters.searchQuery.toLowerCase();
          const matchesQuery =
            product.name.toLowerCase().includes(q) ||
            product.sku.toLowerCase().includes(q) ||
            product.category.toLowerCase().includes(q) ||
            product.divisionTitle.toLowerCase().includes(q) ||
            product.description.toLowerCase().includes(q) ||
            product.materials.some((m) => m.toLowerCase().includes(q));

          if (!matchesQuery) return false;
        }

        if (
          filters.selectedCategories.length > 0 &&
          !filters.selectedCategories.includes(product.category)
        ) {
          return false;
        }

        if (
          filters.selectedMaterials.length > 0 &&
          !filters.selectedMaterials.some((mat) => product.materials.includes(mat))
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'price-asc') return a.price - b.price;
        if (filters.sortBy === 'price-desc') return b.price - a.price;
        if (filters.sortBy === 'name-asc') return a.name.localeCompare(b.name);
        if (filters.sortBy === 'sku-asc') return a.sku.localeCompare(b.sku);
        return 0;
      });
  }, [products, filters]);

  const handleToggleSelect = (product: Product) => {
    setSelectedProducts((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const handleSelectAllVisible = () => {
    const currentIds = new Set(selectedProducts.map((p) => p.id));
    const newlyAdded = filteredProducts.filter((p) => !currentIds.has(p.id));
    setSelectedProducts((prev) => [...prev, ...newlyAdded]);
  };

  const handleClearVisibleSelection = () => {
    const visibleIds = new Set(filteredProducts.map((p) => p.id));
    setSelectedProducts((prev) => prev.filter((p) => !visibleIds.has(p.id)));
  };

  const handleRemoveSingle = (productId: string) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const handleClearAllSelected = () => {
    setSelectedProducts([]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6F2] pb-36">
      {/* Horizontal Header with Search & Branding */}
      <Navbar
        searchQuery={filters.searchQuery}
        onSearchChange={(query) => setFilters((prev) => ({ ...prev, searchQuery: query }))}
        selectedCount={selectedProducts.length}
        totalCount={products.length}
        onToggleMobileFilter={() => setMobileFilterOpen(true)}
      />

      {/* ArielMC Master Compendium Hero Header */}
      <section className="bg-white border-b border-[#0A1A2F]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#0A1A2F]/5 text-[#0A1A2F] text-[11px] font-bold uppercase tracking-widest mb-3 border border-[#0A1A2F]/10 font-heading">
                <Globe className="h-3 w-3 text-[#C9A86A]" />
                <span>Global Sourcing & Export Management • 2026 / 2027 Edition</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0A1A2F] tracking-tight font-heading uppercase">
                The Master Export Compendium
              </h1>
              <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed font-sans max-w-2xl">
                Comprehensive OEM / ODM manufacturing across Bangladesh’s premier industrial sectors. Curate customized commercial line sheets for international distribution across the UK, USA, Europe, and Australia.
              </p>
            </div>

            {/* Compliance Credential Badges */}
            <div className="flex flex-wrap lg:flex-col items-start gap-2 shrink-0 bg-[#F8F6F2] p-4 rounded-xl border border-slate-200/80">
              <div className="flex items-center space-x-2 text-xs font-bold text-[#0A1A2F]">
                <ShieldCheck className="h-4 w-4 text-[#C9A86A]" />
                <span>Certified International Standards</span>
              </div>
              <div className="flex flex-wrap gap-1.5 text-[10px] text-slate-600 font-medium">
                <span className="px-2 py-0.5 bg-white rounded border border-slate-200">LWG Audited Leather</span>
                <span className="px-2 py-0.5 bg-white rounded border border-slate-200">GOTS Organic Jute</span>
                <span className="px-2 py-0.5 bg-white rounded border border-slate-200">OEKO-TEX 100</span>
                <span className="px-2 py-0.5 bg-white rounded border border-slate-200">BSCI & Sedex</span>
                <span className="px-2 py-0.5 bg-white rounded border border-slate-200">FDA Food Contact</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog Sourcing Matrix */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block">
            <FilterSidebar
              filters={filters}
              onChange={setFilters}
              categoryCounts={categoryCounts}
              availableMaterials={availableMaterials}
              totalResults={filteredProducts.length}
            />
          </div>

          {/* Product Grid Area */}
          <ProductGrid
            products={filteredProducts}
            selectedProducts={selectedProducts}
            onToggleSelect={handleToggleSelect}
            onSelectAllVisible={handleSelectAllVisible}
            onClearSelection={handleClearVisibleSelection}
          />
        </div>
      </main>

      {/* Mobile Filters Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-[#0A1A2F]/50 backdrop-blur-xs"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative ml-auto w-full max-w-xs h-full bg-white p-6 shadow-xl flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
              <h3 className="font-bold text-sm text-[#0A1A2F] uppercase font-heading">
                Sourcing Filters
              </h3>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <FilterSidebar
              filters={filters}
              onChange={setFilters}
              categoryCounts={categoryCounts}
              availableMaterials={availableMaterials}
              totalResults={filteredProducts.length}
            />
          </div>
        </div>
      )}

      {/* Interactive Sticky Export Tray */}
      <ExportTray
        selectedProducts={selectedProducts}
        onRemoveProduct={handleRemoveSingle}
        onClearAll={handleClearAllSelected}
      />
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8F6F2] flex items-center justify-center font-heading text-sm text-[#0A1A2F]">Loading ArielMC Catalog...</div>}>
      <CatalogContent />
    </Suspense>
  );
}
