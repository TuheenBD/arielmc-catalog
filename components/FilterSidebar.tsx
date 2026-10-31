'use client';

import React from 'react';
import { ProductCategory, FilterState } from '@/types/product';
import { Filter, RotateCcw, Check, ChevronDown, ChevronRight, Layers } from 'lucide-react';

interface FilterSidebarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  categoryCounts: Record<ProductCategory, number>;
  availableMaterials?: string[];
  totalResults: number;
}

export interface CompendiumDivision {
  key: ProductCategory;
  num: string;
  officialTitle: string;
  label: string;
  departments: { name: string; count: number }[];
}

export const COMPENDIUM_DIVISIONS: CompendiumDivision[] = [
  {
    key: 'Leather',
    num: '01',
    officialTitle: 'The Leather Compendium',
    label: 'Leather Goods & SLGs',
    departments: [
      { name: 'Everyday Carry & SLGs', count: 3 },
      { name: 'Structured Carry & Bags', count: 3 },
      { name: 'Tech & Workspace', count: 3 },
      { name: 'Travel & Voyage', count: 3 },
      { name: 'Wardrobe Accents', count: 3 },
    ],
  },
  {
    key: 'Jute',
    num: '02',
    officialTitle: 'The Golden Fiber Edit',
    label: 'Golden Jute Textiles',
    departments: [
      { name: 'Everyday Carry & Bags', count: 4 },
      { name: 'Modern Living & Décor', count: 4 },
      { name: 'Tech & Eco-Stationery', count: 4 },
      { name: 'Eco-Packaging & Gifting', count: 5 },
    ],
  },
  {
    key: 'Ceramics',
    num: '03',
    officialTitle: 'The Ceramic Index',
    label: 'Fine Stoneware Ceramics',
    departments: [
      { name: 'Dinnerware & Tabletop', count: 4 },
      { name: 'Drinkware & Café', count: 5 },
      { name: 'Modern Living & Decor', count: 3 },
      { name: 'Culinary Serving & Specialty Tabletop', count: 17 },
    ],
  },
  {
    key: 'Textiles',
    num: '04',
    officialTitle: 'Thread & Weave',
    label: 'Apparel & Weaves',
    departments: [
      { name: 'RMG: Knitwear & Basics', count: 4 },
      { name: 'RMG: Woven Apparel', count: 3 },
      { name: 'Bedding & Sleep Linens', count: 3 },
      { name: 'Bath & Towels', count: 3 },
      { name: 'Dining & Kitchen Textiles', count: 3 },
    ],
  },
  {
    key: 'Pottery',
    num: '05',
    officialTitle: 'Earth & Form',
    label: 'Terracotta Pottery',
    departments: [
      { name: 'Botanical & Garden', count: 3 },
      { name: 'Tabletop & Hospitality', count: 4 },
      { name: 'Home Living & Décor', count: 3 },
      { name: 'Architectural Elements', count: 3 },
    ],
  },
];

export function getDepartmentAnchorId(divisionNum: string, groupName: string): string {
  return `dept-${divisionNum}-${groupName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`;
}

export default function FilterSidebar({
  filters,
  onChange,
  categoryCounts,
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

  const handleDepartmentClick = (division: CompendiumDivision, deptName: string) => {
    // If division is not selected, select it exclusively
    if (!filters.selectedCategories.includes(division.key)) {
      onChange({ ...filters, selectedCategories: [division.key] });
    }

    // Smooth scroll to the department section in the right window
    setTimeout(() => {
      const anchorId = getDepartmentAnchorId(division.num, deptName);
      const el = document.getElementById(anchorId);
      if (el) {
        const yOffset = -90;
        const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 120);
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
    <aside className="w-full lg:w-72 shrink-0 space-y-5">
      {/* Filter Header Box */}
      <div className="bg-white p-5 rounded-xl border border-[#0A1A2F]/10 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2 text-[#0A1A2F] font-bold text-xs tracking-wider uppercase font-heading">
            <Filter className="h-4 w-4 text-[#C9A86A]" />
            <span>Sourcing Directory</span>
          </div>
          {isFiltered && (
            <button
              onClick={resetFilters}
              className="flex items-center space-x-1 text-xs text-rose-600 hover:text-rose-700 font-medium transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        <div className="mt-3 text-xs text-slate-500 font-medium flex items-center justify-between">
          <span>Active Specifications:</span>
          <span className="font-bold text-[#0A1A2F] bg-slate-100 px-2 py-0.5 rounded font-mono">
            {totalResults} SKUs
          </span>
        </div>
      </div>

      {/* Sourcing Compendiums & Nested Departments Directory */}
      <div className="bg-white p-5 rounded-xl border border-[#0A1A2F]/10 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-heading">
            Compendiums &amp; Departments
          </h4>
          <span className="text-[10px] font-mono text-[#C9A86A] font-bold">5 Divisions</span>
        </div>

        <div className="space-y-2 pt-1">
          {COMPENDIUM_DIVISIONS.map((division) => {
            const isSelected = filters.selectedCategories.includes(division.key);
            const count = categoryCounts[division.key] || 0;

            return (
              <div key={division.key} className="rounded-xl border border-slate-200/80 overflow-hidden transition-all bg-white shadow-2xs">
                {/* Compendium Main Header Button */}
                <button
                  type="button"
                  onClick={() => toggleCategory(division.key)}
                  className={`w-full text-left p-3 text-xs transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-[#0A1A2F] text-white'
                      : 'bg-[#FAF9F6] text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0 flex-1 pr-2">
                    <span className={`font-mono text-xs font-black shrink-0 ${isSelected ? 'text-[#C9A86A]' : 'text-slate-400'}`}>
                      {division.num}
                    </span>
                    <div className="truncate">
                      <div className={`font-bold text-xs truncate ${isSelected ? 'text-white' : 'text-[#0A1A2F]'}`}>
                        {division.officialTitle}
                      </div>
                      <div className={`text-[10px] truncate ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                        {division.label}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <span
                      className={`text-[9.5px] px-2 py-0.5 rounded-full font-bold font-mono ${
                        isSelected
                          ? 'bg-[#C9A86A] text-[#0A1A2F]'
                          : 'bg-slate-200/80 text-slate-600'
                      }`}
                    >
                      {count}
                    </span>
                    {isSelected ? (
                      <ChevronDown className="h-3.5 w-3.5 text-[#C9A86A]" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Nested Departments (Appears directly under Compendium) */}
                {isSelected && (
                  <div className="bg-[#FAF9F6] border-t border-slate-200/70 p-2 space-y-1">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-2 py-1 flex items-center space-x-1.5 font-heading">
                      <Layers className="h-2.5 w-2.5 text-[#C9A86A]" />
                      <span>Departments ({division.departments.length}):</span>
                    </div>

                    <div className="space-y-0.5">
                      {division.departments.map((dept) => (
                        <button
                          key={dept.name}
                          type="button"
                          onClick={() => handleDepartmentClick(division, dept.name)}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-slate-700 hover:text-[#0A1A2F] hover:bg-white hover:shadow-2xs transition-all flex items-center justify-between group cursor-pointer"
                        >
                          <div className="flex items-center space-x-2 truncate pr-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#C9A86A] group-hover:scale-125 transition-transform shrink-0" />
                            <span className="truncate group-hover:font-semibold">{dept.name}</span>
                          </div>
                          <span className="text-[9px] font-mono text-slate-400 font-semibold bg-white px-1.5 py-0.5 rounded border border-slate-200/60 group-hover:border-slate-300">
                            {dept.count}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Wholesale Sorting Strategy */}
      <div className="bg-white p-5 rounded-xl border border-[#0A1A2F]/10 shadow-xs space-y-3">
        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-heading">
          Wholesale Sort
        </h4>
        <select
          value={filters.sortBy}
          onChange={(e) =>
            onChange({ ...filters, sortBy: e.target.value as FilterState['sortBy'] })
          }
          className="w-full px-3 py-2 bg-[#F8F6F2] border border-slate-200 rounded-lg text-xs font-medium text-[#0A1A2F] focus:outline-none focus:ring-1 focus:ring-[#0A1A2F] focus:bg-white cursor-pointer"
        >
          <option value="featured">Featured Sourcing Compendium</option>
          <option value="price-asc">Wholesale FOB: Low to High</option>
          <option value="price-desc">Wholesale FOB: High to Low</option>
          <option value="name-asc">Product Title (A-Z)</option>
          <option value="sku-asc">SKU / Tech-Pack Identifier</option>
        </select>
      </div>
    </aside>
  );
}
