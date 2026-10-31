'use client';

import React, { useMemo } from 'react';
import { Product, ProductCategory } from '@/types/product';
import ProductCard from './ProductCard';
import DivisionHeroBanner from './DivisionHeroBanner';
import { getDepartmentAnchorId, COMPENDIUM_DIVISIONS } from './FilterSidebar';
import { CheckSquare, Square, PackageOpen } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  selectedProducts: Product[];
  activeCategory?: ProductCategory | null;
  onClearCategoryFilter?: () => void;
  onToggleSelect: (product: Product) => void;
  onSelectAllVisible: () => void;
  onClearSelection: () => void;
  onViewDetails?: (product: Product) => void;
}

const DIVISION_NUMBERS: Record<string, string> = {
  Leather: '01',
  Jute: '02',
  Ceramics: '03',
  Textiles: '04',
  Pottery: '05',
};

export default function ProductGrid({
  products,
  selectedProducts,
  activeCategory,
  onClearCategoryFilter,
  onToggleSelect,
  onSelectAllVisible,
  onClearSelection,
  onViewDetails,
}: ProductGridProps) {
  const selectedIds = new Set(selectedProducts.map((p) => p.id));
  const areAllVisibleSelected =
    products.length > 0 && products.every((p) => selectedIds.has(p.id));

  // Canonical Division & Department Serialization (Strict Order: 01 -> 02 -> 03 -> 04 -> 05)
  const structuredSections = useMemo(() => {
    const sections: {
      key: string;
      anchorId: string;
      divisionNum: string;
      divisionTitle: string;
      groupName: string;
      items: Product[];
    }[] = [];

    const normalize = (s: string) =>
      (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

    const claimedProductIds = new Set<string>();

    // 1. Iterate strictly over the 5 Canonical Compendium Divisions in sequential order (01 -> 02 -> 03 -> 04 -> 05)
    COMPENDIUM_DIVISIONS.forEach((div) => {
      div.departments.forEach((dept) => {
        const matchingProducts = products.filter(
          (p) =>
            p.category === div.key &&
            normalize(p.categoryGroup || '') === normalize(dept.name)
        );

        if (matchingProducts.length > 0) {
          matchingProducts.forEach((p) => claimedProductIds.add(p.id));
          const anchorId = getDepartmentAnchorId(div.num, dept.name);
          sections.push({
            key: `${div.num}__${div.officialTitle}__${dept.name}`,
            anchorId,
            divisionNum: div.num,
            divisionTitle: `${div.num} ${div.officialTitle.toUpperCase()}`,
            groupName: dept.name,
            items: matchingProducts,
          });
        }
      });
    });

    // 2. Unclaimed fallback (ensures any dynamically filtered or custom-curated items are never lost)
    const unclaimedProducts = products.filter((p) => !claimedProductIds.has(p.id));
    if (unclaimedProducts.length > 0) {
      const fallbackMap = new Map<string, Product[]>();
      unclaimedProducts.forEach((p) => {
        const grp = p.categoryGroup || 'Additional Curations';
        const k = `${p.category || 'General'}__${grp}`;
        if (!fallbackMap.has(k)) fallbackMap.set(k, []);
        fallbackMap.get(k)!.push(p);
      });

      fallbackMap.forEach((items, k) => {
        const [cat, grp] = k.split('__');
        const divNum = DIVISION_NUMBERS[cat] || '06';
        sections.push({
          key: k,
          anchorId: getDepartmentAnchorId(divNum, grp),
          divisionNum: divNum,
          divisionTitle: cat,
          groupName: grp,
          items,
        });
      });
    }

    const uniqueDivisions = Array.from(new Set(sections.map((s) => s.divisionNum)));
    const isMultiDivision = uniqueDivisions.length > 1;

    return { sections, isMultiDivision };
  }, [products]);

  // Refinement B: 1-Click Select / Deselect entire Department
  const handleToggleDepartmentSelect = (departmentProducts: Product[]) => {
    const allSelected = departmentProducts.every((p) => selectedIds.has(p.id));
    if (allSelected) {
      departmentProducts.forEach((p) => {
        if (selectedIds.has(p.id)) {
          onToggleSelect(p);
        }
      });
    } else {
      departmentProducts.forEach((p) => {
        if (!selectedIds.has(p.id)) {
          onToggleSelect(p);
        }
      });
    }
  };

  return (
    <div className="flex-1 min-w-0 w-full space-y-6">
      {/* 
        When visitors select a Hero Section (Leather, Jute, Ceramics, Textiles, Pottery),
        The corresponding Division Page (from website) appears at the top of Section 3 [Right Window]!
      */}
      {activeCategory && onClearCategoryFilter && (
        <DivisionHeroBanner
          category={activeCategory}
          productCount={products.length}
          onClearCategoryFilter={onClearCategoryFilter}
        />
      )}

      {/* Clean Grid Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 w-full min-w-0">
        <div className="flex items-center space-x-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Showing <span className="text-slate-900 font-bold">{products.length}</span> Products across{' '}
            <span className="text-slate-900 font-bold">{structuredSections.sections.length}</span> Departments
          </div>
        </div>

        {products.length > 0 && (
          <div className="flex items-center space-x-3 text-xs">
            <button
              type="button"
              onClick={areAllVisibleSelected ? onClearSelection : onSelectAllVisible}
              className="flex items-center space-x-1.5 font-semibold text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
            >
              {areAllVisibleSelected ? (
                <>
                  <CheckSquare className="h-4 w-4 text-[#0A1A2F]" />
                  <span>Deselect All Visible</span>
                </>
              ) : (
                <>
                  <Square className="h-4 w-4 text-slate-400" />
                  <span>Select All Visible ({products.length})</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Main Content: Department Sections */}
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-dashed border-slate-300 text-center space-y-3">
          <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
            <PackageOpen className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">No Matching Specifications</h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              No products found matching your current search parameters. Try broadening your category or material filters.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-12">
          {structuredSections.sections.map((section, idx) => {
            const isFirstOfDivision =
              structuredSections.isMultiDivision &&
              (idx === 0 || structuredSections.sections[idx - 1].divisionNum !== section.divisionNum);

            const allDeptSelected = section.items.every((p) => selectedIds.has(p.id));
            const someDeptSelected = section.items.some((p) => selectedIds.has(p.id));

            return (
              <section key={section.key} className="space-y-5 scroll-mt-28" id={section.anchorId}>
                {/* 
                  HEADING: Major Compendium Heading (BIGGER, as requested)
                  Displayed when transitioning between divisions in full-catalog view
                */}
                {isFirstOfDivision && (
                  <div className="pt-8 pb-3 border-b-2 border-[#0A1A2F]/15 first:pt-2">
                    <div className="inline-flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-[#C9A86A] mb-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#C9A86A]" />
                      <span>Export Sourcing Division</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0A1A2F] tracking-tight uppercase font-heading">
                      {section.divisionTitle}
                    </h2>
                  </div>
                )}

                {/* 
                  SUB-HEADING ROW: Department Sub-Heading (Small & Refined) + 1-Click Sourcing Action
                */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1.5 pb-2 border-b border-slate-200/60">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-5 h-0.5 bg-[#C9A86A] rounded-full shrink-0" />
                    <div className="flex items-baseline space-x-2">
                      <h3 className="text-sm sm:text-base font-semibold text-[#0A1A2F] tracking-tight font-heading">
                        {section.groupName}
                      </h3>
                      <span className="text-[11px] font-mono text-slate-400 font-normal">
                        ({section.items.length} {section.items.length === 1 ? 'item' : 'items'})
                      </span>
                    </div>
                  </div>

                  {/* 1-Click Select / Deselect All for Department */}
                  <button
                    type="button"
                    onClick={() => handleToggleDepartmentSelect(section.items)}
                    className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
                      allDeptSelected
                        ? 'bg-[#0A1A2F] text-[#C9A86A] border-[#0A1A2F] shadow-xs'
                        : someDeptSelected
                        ? 'bg-amber-50 text-amber-900 border-amber-300 shadow-2xs hover:bg-amber-100'
                        : 'bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-50 border-slate-200 shadow-2xs'
                    }`}
                    title={`Select or deselect all ${section.items.length} items in ${section.groupName}`}
                  >
                    {allDeptSelected ? (
                      <>
                        <CheckSquare className="h-3.5 w-3.5 text-[#C9A86A]" />
                        <span>All {section.items.length} Selected</span>
                      </>
                    ) : (
                      <>
                        <Square className="h-3.5 w-3.5 text-slate-400" />
                        <span>+ Select Department ({section.items.length})</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Visual Product Grid for this Department */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {section.items.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isSelected={selectedIds.has(product.id)}
                      onToggleSelect={onToggleSelect}
                      onViewDetails={onViewDetails}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
