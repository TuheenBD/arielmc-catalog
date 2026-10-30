'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import FilterSidebar from '@/components/FilterSidebar';
import ProductGrid from '@/components/ProductGrid';
import ExportTray from '@/components/ExportTray';
import ProductDetailModal from '@/components/ProductDetailModal';
import SamplePolicyModal from '@/components/SamplePolicyModal';
import HeroShowcase from '@/components/HeroShowcase';
import { CurrencyProvider } from '@/components/CurrencyContext';
import { MOCK_PRODUCTS } from '@/data/mockProducts';
import { Product, FilterState, ProductCategory } from '@/types/product';
import { ShieldCheck, Globe, X, Clock, FileCheck2, Plane, CheckCircle2 } from 'lucide-react';

function CatalogContent() {
  const searchParams = useSearchParams();
  const [products] = useState<Product[]>(MOCK_PRODUCTS);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [selectedDetailProduct, setSelectedDetailProduct] = useState<Product[] | null>(null);
  const [activeModalProduct, setActiveModalProduct] = useState<Product | null>(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [isSamplePolicyOpen, setIsSamplePolicyOpen] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    selectedCategories: [],
    priceRange: [0, 500],
    selectedMaterials: [],
    sortBy: 'featured',
  });

  // Deep-linking: Parse incoming query parameters from website
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
            (product.roadMapCode && product.roadMapCode.toLowerCase().includes(q)) ||
            product.category.toLowerCase().includes(q) ||
            product.divisionTitle.toLowerCase().includes(q) ||
            (product.subCategory && product.subCategory.toLowerCase().includes(q)) ||
            (product.categoryGroup && product.categoryGroup.toLowerCase().includes(q)) ||
            product.description.toLowerCase().includes(q) ||
            (product.hsCode && product.hsCode.toLowerCase().includes(q)) ||
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
        if (filters.sortBy === 'featured') return (a.prodtId || 0) - (b.prodtId || 0);
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

  const handleSelectDivisionCategory = (cat: ProductCategory) => {
    setFilters((prev) => {
      const exists = prev.selectedCategories.includes(cat);
      return {
        ...prev,
        selectedCategories: exists ? [] : [cat],
      };
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

  const handleOpenDetailModal = (product: Product) => {
    setActiveModalProduct(product);
  };

  const handleCloseDetailModal = () => {
    setActiveModalProduct(null);
  };

  const handleRequestSampleFromModal = (product: Product) => {
    // Ensure product is in export tray and open drawer
    if (!selectedProducts.some((p) => p.id === product.id)) {
      setSelectedProducts((prev) => [...prev, product]);
    }
    setActiveModalProduct(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6F2] pb-36">
      {/* Horizontal Header with Currency Switcher & Branding */}
      <Navbar
        searchQuery={filters.searchQuery}
        onSearchChange={(query) => setFilters((prev) => ({ ...prev, searchQuery: query }))}
        selectedCount={selectedProducts.length}
        totalCount={products.length}
        onToggleMobileFilter={() => setMobileFilterOpen(true)}
        onOpenSamplePolicy={() => setIsSamplePolicyOpen(true)}
      />

      {/* ArielMC Master Compendium Corporate Hero Header */}
      <section className="bg-white border-b border-[#0A1A2F]/10">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 lg:gap-10">
            {/* Left Column: Commercial Narrative & Compliance */}
            <div className="w-full lg:w-[34%] xl:w-[33%] flex flex-col justify-center space-y-4 shrink-0">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#0A1A2F]/5 text-[#0A1A2F] text-[11px] font-bold uppercase tracking-widest border border-[#0A1A2F]/10 font-heading w-fit">
                <Globe className="h-3 w-3 text-[#C9A86A]" />
                <span>Corporate Sourcing • 2026 / 2027</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-[40px] xl:text-[44px] font-extrabold text-[#0A1A2F] tracking-tight font-heading uppercase leading-tight">
                The Master Export Compendium
              </h1>

              <p className="text-sm text-slate-600 leading-relaxed font-sans">
                Precision OEM / ODM manufacturing across Bangladesh’s certified industrial clusters. Curate commercial line sheets, evaluate master carton logistics (CBM), and order express counter-samples with preferential tariff documentation for the UK, Europe, USA, and Australia.
              </p>

              {/* Corporate Procurement Micro-Perks */}
              <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-700 pt-1">
                <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-200">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>UK DCTS 0% Duty</span>
                </span>
                <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-200">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>EU GSP 0% Tariff</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsSamplePolicyOpen(true)}
                  className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-[#0A1A2F] text-[#C9A86A] border border-[#0A1A2F] hover:bg-slate-900 transition-colors cursor-pointer"
                >
                  <Clock className="h-3.5 w-3.5 text-[#C9A86A]" />
                  <span>Sample Policy: 100% Credit (SOP)</span>
                </button>
              </div>
            </div>

            {/* Right Column: 5 Hero Representative Items & Sector Selector (25% Bigger) */}
            <div className="w-full lg:w-[66%] xl:w-[67%]">
              <HeroShowcase
                selectedCategories={filters.selectedCategories}
                onSelectCategory={handleSelectDivisionCategory}
                categoryCounts={categoryCounts}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog Sourcing Matrix */}
      <main id="sourcing-matrix" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 scroll-mt-24">
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
            onViewDetails={handleOpenDetailModal}
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

      {/* Tech-Pack & Corporate Spec Modal */}
      {activeModalProduct && (
        <ProductDetailModal
          product={activeModalProduct}
          onClose={handleCloseDetailModal}
          isSelected={selectedProducts.some((p) => p.id === activeModalProduct.id)}
          onToggleSelect={handleToggleSelect}
          onRequestSample={handleRequestSampleFromModal}
          onOpenSamplePolicy={() => setIsSamplePolicyOpen(true)}
        />
      )}

      {/* Interactive Sticky Export Tray */}
      <ExportTray
        selectedProducts={selectedProducts}
        onRemoveProduct={handleRemoveSingle}
        onClearAll={handleClearAllSelected}
        onOpenSamplePolicy={() => setIsSamplePolicyOpen(true)}
      />

      {/* ArielMC Official Sample Policy & SOP Modal */}
      <SamplePolicyModal
        isOpen={isSamplePolicyOpen}
        onClose={() => setIsSamplePolicyOpen(false)}
      />
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8F6F2] flex items-center justify-center font-heading text-sm text-[#0A1A2F]">
          Loading <strong style={{ textTransform: 'none' }} className="font-black text-[#0A1A2F] mx-1 inline-block">ArielMC</strong> Corporate Catalog...
        </div>
      }
    >
      <CurrencyProvider>
        <CatalogContent />
      </CurrencyProvider>
    </Suspense>
  );
}
