'use client';

import React from 'react';
import { ProductCategory, FilterState } from '@/types/product';
import { Filter, RotateCcw, Check, Award } from 'lucide-react';

interface FilterSidebarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  categoryCounts: Record<ProductCategory, number>;
  availableMaterials: string[];
  totalResults: number;
}

const CATEGORIES: { key: ProductCategory; label: string; division: string }[] = [
  { key: 'Leather', label: 'Leather Goods', division: '01 The Leather Compendium' },
  { key: 'Jute', label: 'Golden Jute Textiles', division: '02 The Golden Fiber Edit' },
  { key: 'Ceramics', label: 'Fine Stoneware Ceramics', division: '03 The Ceramic Index' },
  { key: 'Textiles', label: 'Apparel & Weaves', division: '04 Thread & Weave' },
  { key: 'Pottery', label: 'Terracotta Pottery', division: '05 Earth & Form' },
];

export default function FilterSidebar({
  filters,
  onChange,
  categoryCounts,
  availableMaterials,
  totalResults,
}: FilterSidebarProps) {
  const toggleCategory = (cat: ProductCategory) => {
    const current = [...filters.selectedCategories];
    const index = current.indexOf(cat);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(cat);
    }
    onChange({ ...filters, selectedCategories: current });
  };

  const toggleMaterial = (mat: string) => {
    const current = [...filters.selectedMaterials];
    const index = current.indexOf(mat);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(mat);
    }
    onChange({ ...filters, selectedMaterials: current });
  };

  const resetFilters = () => {
    onChange({
      searchQuery: '',
      selectedCategories: [],
      priceRange: [0, 500],
      selectedMaterials: [],
      sortBy: 'featured',
    });
  };

  const isFiltered =
    filters.selectedCategories.length > 0 ||
    filters.selectedMaterials.length > 0 ||
    filters.searchQuery !== '' ||
    filters.sortBy !== 'featured';

  return (
    <aside className="w-full lg:w-72 shrink-0 space-y-6">
      {/* Filter Header Box */}
      <div className="bg-white p-5 rounded-xl border border-[#0A1A2F]/10 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2 text-[#0A1A2F] font-bold text-xs tracking-wider uppercase font-heading">
            <Filter className="h-4 w-4 text-[#C9A86A]" />
            <span>Sourcing Filters</span>
          </div>
          {isFiltered && (
            <button
              onClick={resetFilters}
              className="flex items-center space-x-1 text-xs text-rose-600 hover:text-rose-700 font-medium transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        <div className="mt-3 text-xs text-slate-500 font-medium">
          Showing <span className="font-bold text-[#0A1A2F]">{totalResults}</span> active export specifications
        </div>
      </div>

      {/* Sourcing Divisions Section */}
      <div className="bg-white p-5 rounded-xl border border-[#0A1A2F]/10 shadow-xs space-y-3">
        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-heading">
          Five-Division Index
        </h4>
        <div className="space-y-2">
          {CATEGORIES.map(({ key, label, division }) => {
            const isSelected = filters.selectedCategories.includes(key);
            const count = categoryCounts[key] || 0;
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleCategory(key)}
                className={`w-full text-left p-2.5 rounded-lg text-xs transition-all border ${
                  isSelected
                    ? 'bg-[#0A1A2F] text-white border-[#0A1A2F] shadow-sm'
                    : 'bg-[#F8F6F2] text-slate-700 border-slate-200/60 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono tracking-tight font-semibold ${isSelected ? 'text-[#C9A86A]' : 'text-slate-400'}`}>
                    {division.slice(0, 2)}
                  </span>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                      isSelected ? 'bg-[#C9A86A] text-[#0A1A2F]' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <div
                    className={`h-3 w-3 rounded border flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'border-[#C9A86A] bg-[#C9A86A] text-[#0A1A2F]'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <Check className="h-2 w-2 stroke-[3]" />}
                  </div>
                  <span className="font-semibold text-xs truncate">{label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sorting Strategy */}
      <div className="bg-white p-5 rounded-xl border border-[#0A1A2F]/10 shadow-xs space-y-3">
        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-heading">
          Wholesale Sort
        </h4>
        <select
          value={filters.sortBy}
          onChange={(e) =>
            onChange({ ...filters, sortBy: e.target.value as FilterState['sortBy'] })
          }
          className="w-full px-3 py-2 bg-[#F8F6F2] border border-slate-200 rounded-lg text-xs font-medium text-[#0A1A2F] focus:outline-none focus:ring-1 focus:ring-[#0A1A2F] focus:bg-white"
        >
          <option value="featured">Featured Sourcing Compendium</option>
          <option value="price-asc">Wholesale FOB: Low to High</option>
          <option value="price-desc">Wholesale FOB: High to Low</option>
          <option value="name-asc">Product Title (A-Z)</option>
          <option value="sku-asc">SKU / Tech-Pack Identifier</option>
        </select>
      </div>

      {/* Material Composition Tags */}
      <div className="bg-white p-5 rounded-xl border border-[#0A1A2F]/10 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-heading">
            Authentic Raw Materials
          </h4>
          <Award className="h-3.5 w-3.5 text-[#C9A86A]" />
        </div>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {availableMaterials.slice(0, 14).map((mat) => {
            const isSelected = filters.selectedMaterials.includes(mat);
            return (
              <button
                key={mat}
                type="button"
                onClick={() => toggleMaterial(mat)}
                className={`text-[10.5px] px-2.5 py-1 rounded-md border font-medium transition-all ${
                  isSelected
                    ? 'bg-[#0A1A2F] text-[#C9A86A] border-[#0A1A2F] shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {mat}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
