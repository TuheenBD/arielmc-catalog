'use client';

import React, { useState, useMemo } from 'react';
import { Product, ProductCategory } from '@/types/product';
import { useCurrency } from './CurrencyContext';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Minus,
  CheckSquare,
  Square,
  Eye,
  Folder,
  FolderOpen,
  Layers,
  Sparkles,
  Maximize2,
  Minimize2,
  FileText,
  ShieldCheck,
  Check
} from 'lucide-react';

interface ProductTreeProps {
  products: Product[];
  selectedProducts: Product[];
  onToggleSelect: (product: Product) => void;
  onViewDetails?: (product: Product) => void;
}

interface SubCategoryNode {
  subCategory: string;
  count: number;
  products: Product[];
}

interface CategoryGroupNode {
  categoryGroup: string;
  count: number;
  subCategories: SubCategoryNode[];
}

interface DivisionNode {
  divisionTitle: string;
  cleanTitle: string;
  code: string;
  category: ProductCategory;
  count: number;
  groups: CategoryGroupNode[];
}

// Visual theme badges per sovereign division
const DIVISION_CONFIG: Record<
  string,
  { label: string; badgeBg: string; badgeBorder: string; badgeText: string; accentColor: string; icon: string }
> = {
  Leather: {
    label: 'Leather Compendium',
    badgeBg: 'bg-amber-50',
    badgeBorder: 'border-amber-200',
    badgeText: 'text-amber-900',
    accentColor: '#92400E',
    icon: '👜',
  },
  Jute: {
    label: 'Golden Fiber Edit',
    badgeBg: 'bg-yellow-50',
    badgeBorder: 'border-yellow-200',
    badgeText: 'text-yellow-900',
    accentColor: '#B45309',
    icon: '🌾',
  },
  Ceramics: {
    label: 'Ceramic Index',
    badgeBg: 'bg-blue-50',
    badgeBorder: 'border-blue-200',
    badgeText: 'text-blue-900',
    accentColor: '#1E40AF',
    icon: '🏺',
  },
  Textiles: {
    label: 'Thread & Weave',
    badgeBg: 'bg-emerald-50',
    badgeBorder: 'border-emerald-200',
    badgeText: 'text-emerald-900',
    accentColor: '#065F46',
    icon: '🧵',
  },
  Pottery: {
    label: 'Earth & Form',
    badgeBg: 'bg-orange-50',
    badgeBorder: 'border-orange-200',
    badgeText: 'text-orange-900',
    accentColor: '#C2410C',
    icon: '🧱',
  },
};

export default function ProductTree({
  products,
  selectedProducts,
  onToggleSelect,
  onViewDetails,
}: ProductTreeProps) {
  const { formatPrice } = useCurrency();
  const selectedIds = useMemo(() => new Set(selectedProducts.map((p) => p.id)), [selectedProducts]);

  // Build the hierarchical tree data structure
  const treeData = useMemo(() => {
    // Defined division priority order
    const divisionOrder: ProductCategory[] = ['Leather', 'Jute', 'Ceramics', 'Textiles', 'Pottery'];

    const divMap = new Map<string, {
      divisionTitle: string;
      category: ProductCategory;
      groupMap: Map<string, Map<string, Product[]>>;
    }>();

    products.forEach((p) => {
      const divKey = p.divisionTitle || `${p.category} Division`;
      if (!divMap.has(divKey)) {
        divMap.set(divKey, {
          divisionTitle: divKey,
          category: p.category,
          groupMap: new Map(),
        });
      }

      const divEntry = divMap.get(divKey)!;
      const grpKey = p.categoryGroup || 'General Collection';
      const subKey = p.subCategory || 'General Specifications';

      if (!divEntry.groupMap.has(grpKey)) {
        divEntry.groupMap.set(grpKey, new Map());
      }
      const subMap = divEntry.groupMap.get(grpKey)!;
      if (!subMap.has(subKey)) {
        subMap.set(subKey, []);
      }
      subMap.get(subKey)!.push(p);
    });

    const result: DivisionNode[] = [];

    // Convert map to structured nodes
    divMap.forEach((entry) => {
      const groups: CategoryGroupNode[] = [];
      let totalDivProducts = 0;

      entry.groupMap.forEach((subMap, groupName) => {
        const subCategories: SubCategoryNode[] = [];
        let totalGroupProducts = 0;

        subMap.forEach((prods, subName) => {
          subCategories.push({
            subCategory: subName,
            count: prods.length,
            products: prods,
          });
          totalGroupProducts += prods.length;
        });

        groups.push({
          categoryGroup: groupName,
          count: totalGroupProducts,
          subCategories,
        });

        totalDivProducts += totalGroupProducts;
      });

      // Extract clean division title e.g. "01 The Leather Compendium" -> "Leather Compendium"
      const cleanTitle = entry.divisionTitle.replace(/^\d+\s+/, '').replace(/^The\s+/, '');
      const codeMatch = entry.divisionTitle.match(/^(\d+)/);
      const code = codeMatch ? codeMatch[1] : '';

      result.push({
        divisionTitle: entry.divisionTitle,
        cleanTitle,
        code,
        category: entry.category,
        count: totalDivProducts,
        groups,
      });
    });

    // Sort by sovereign pillar order
    result.sort((a, b) => {
      const idxA = divisionOrder.indexOf(a.category);
      const idxB = divisionOrder.indexOf(b.category);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      return a.divisionTitle.localeCompare(b.divisionTitle);
    });

    return result;
  }, [products]);

  // Expansion state for divisions, groups, and subcategories
  // Key format: 'div:divisionTitle', 'grp:divisionTitle:categoryGroup', 'sub:divisionTitle:categoryGroup:subCategory'
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    // Pre-expand all divisions and category groups by default
    treeData.forEach((div) => {
      initial.add(`div:${div.divisionTitle}`);
      div.groups.forEach((grp) => {
        initial.add(`grp:${div.divisionTitle}:${grp.categoryGroup}`);
        grp.subCategories.forEach((sub) => {
          initial.add(`sub:${div.divisionTitle}:${grp.categoryGroup}:${sub.subCategory}`);
        });
      });
    });
    return initial;
  });

  const toggleKey = (key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleExpandAll = () => {
    const all = new Set<string>();
    treeData.forEach((div) => {
      all.add(`div:${div.divisionTitle}`);
      div.groups.forEach((grp) => {
        all.add(`grp:${div.divisionTitle}:${grp.categoryGroup}`);
        grp.subCategories.forEach((sub) => {
          all.add(`sub:${div.divisionTitle}:${grp.categoryGroup}:${sub.subCategory}`);
        });
      });
    });
    setExpandedKeys(all);
  };

  const handleCollapseAll = () => {
    setExpandedKeys(new Set());
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden mb-6 transition-all duration-300">
      {/* Header Toolbar */}
      <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-[#0A1A2F] to-slate-900 text-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-lg bg-[#C9A86A]/20 border border-[#C9A86A]/40 flex items-center justify-center text-[#C9A86A]">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold tracking-wide uppercase text-white">
                Product Hierarchy Tree
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#C9A86A] text-[#0A1A2F]">
                {products.length} Specifications
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-light">
              Hierarchical taxonomy: Division → Category Group → Subcategory → Product Specifications
            </p>
          </div>
        </div>

        {/* Global Expand / Collapse Controls */}
        <div className="flex items-center space-x-2 text-xs">
          <button
            type="button"
            onClick={handleExpandAll}
            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-colors text-[11px] font-medium"
            title="Expand All Branches"
          >
            <Maximize2 className="h-3 w-3" />
            <span>Expand All</span>
          </button>
          <button
            type="button"
            onClick={handleCollapseAll}
            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-colors text-[11px] font-medium"
            title="Collapse All Branches"
          >
            <Minimize2 className="h-3 w-3" />
            <span>Collapse All</span>
          </button>
        </div>
      </div>

      {/* Tree Content Area */}
      <div className="p-4 sm:p-6 space-y-4 font-sans text-sm bg-slate-50/50">
        {treeData.map((div) => {
          const divKey = `div:${div.divisionTitle}`;
          const isDivExpanded = expandedKeys.has(divKey);
          const config = DIVISION_CONFIG[div.category] || {
            label: div.cleanTitle,
            badgeBg: 'bg-slate-100',
            badgeBorder: 'border-slate-300',
            badgeText: 'text-slate-900',
            accentColor: '#0A1A2F',
            icon: '📦',
          };

          return (
            <div
              key={div.divisionTitle}
              className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden"
            >
              {/* Level 1: Division Header (e.g. Leather Compendium) */}
              <div
                onClick={() => toggleKey(divKey)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-100/90 to-slate-50 hover:bg-slate-100 border-b border-slate-200/80 cursor-pointer select-none transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    aria-label="Toggle Division"
                    className="h-6 w-6 rounded flex items-center justify-center bg-white border border-slate-300 text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    {isDivExpanded ? (
                      <Minus className="h-3.5 w-3.5 font-bold" />
                    ) : (
                      <Plus className="h-3.5 w-3.5 font-bold" />
                    )}
                  </button>

                  <span className="text-base" role="img" aria-label={div.cleanTitle}>
                    {config.icon}
                  </span>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                      {div.code || '0' + (div.category === 'Leather' ? '1' : div.category === 'Jute' ? '2' : div.category === 'Ceramics' ? '3' : div.category === 'Textiles' ? '4' : '5')}
                    </span>
                    <h4 className="text-sm sm:text-base font-extrabold text-[#0A1A2F] tracking-tight">
                      {div.cleanTitle}
                    </h4>
                    <span className="hidden sm:inline-block text-xs text-slate-400 font-normal">
                      ({div.divisionTitle})
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${config.badgeBg} ${config.badgeBorder} ${config.badgeText}`}
                  >
                    {div.count} Products
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                      isDivExpanded ? 'rotate-0' : '-rotate-90'
                    }`}
                  />
                </div>
              </div>

              {/* Level 2: Category Groups */}
              {isDivExpanded && (
                <div className="p-3 sm:p-5 space-y-4">
                  {div.groups.map((grp) => {
                    const grpKey = `grp:${div.divisionTitle}:${grp.categoryGroup}`;
                    const isGrpExpanded = expandedKeys.has(grpKey);

                    return (
                      <div
                        key={grp.categoryGroup}
                        className="border-l-2 border-[#C9A86A]/60 pl-3 sm:pl-4 space-y-3"
                      >
                        {/* Group Header (+ Everyday Carry & SLGs) */}
                        <div
                          onClick={() => toggleKey(grpKey)}
                          className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-slate-100/80 cursor-pointer select-none transition-colors group"
                        >
                          <div className="flex items-center space-x-2">
                            <span className="h-5 w-5 rounded bg-amber-50 border border-amber-300 text-amber-800 flex items-center justify-center text-xs font-bold">
                              {isGrpExpanded ? '−' : '+'}
                            </span>
                            <span className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#C9A86A] transition-colors">
                              + {grp.categoryGroup}
                            </span>
                          </div>
                          <span className="text-[10px] font-semibold text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded-full">
                            {grp.count} {grp.count === 1 ? 'Product' : 'Products'}
                          </span>
                        </div>

                        {/* Level 3: Subcategories */}
                        {isGrpExpanded && (
                          <div className="pl-4 sm:pl-6 space-y-3">
                            {grp.subCategories.map((sub) => {
                              const subKey = `sub:${div.divisionTitle}:${grp.categoryGroup}:${sub.subCategory}`;
                              const isSubExpanded = expandedKeys.has(subKey);

                              return (
                                <div
                                  key={sub.subCategory}
                                  className="border-l-2 border-slate-200 pl-3 sm:pl-4 space-y-2"
                                >
                                  {/* SubCategory Header (+ Wallets & Small Leather Goods) */}
                                  <div
                                    onClick={() => toggleKey(subKey)}
                                    className="flex items-center justify-between py-1 px-2 rounded-md hover:bg-slate-100/70 cursor-pointer select-none transition-colors group"
                                  >
                                    <div className="flex items-center space-x-2">
                                      <span className="h-4 w-4 rounded bg-slate-100 border border-slate-300 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                                        {isSubExpanded ? '−' : '+'}
                                      </span>
                                      <span className="text-xs font-semibold text-slate-800 group-hover:text-slate-950">
                                        + {sub.subCategory}
                                      </span>
                                    </div>
                                    <span className="text-[10px] font-medium text-slate-400">
                                      ({sub.count})
                                    </span>
                                  </div>

                                  {/* Level 4: Products List (- Product) */}
                                  {isSubExpanded && (
                                    <div className="pl-5 sm:pl-7 space-y-1.5 pt-1">
                                      {sub.products.map((product) => {
                                        const isSelected = selectedIds.has(product.id);

                                        return (
                                          <div
                                            key={product.id}
                                            className={`flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 p-2 rounded-lg border transition-all text-xs ${
                                              isSelected
                                                ? 'bg-amber-50/70 border-amber-300 shadow-xs'
                                                : 'bg-white border-slate-200/70 hover:border-slate-300 hover:bg-slate-50/80 shadow-xs'
                                            }`}
                                          >
                                            {/* Product Identity */}
                                            <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                                              {/* Checkbox for Export Tray */}
                                              <button
                                                type="button"
                                                onClick={() => onToggleSelect(product)}
                                                className="text-slate-400 hover:text-slate-900 transition-colors shrink-0"
                                                title={isSelected ? 'Deselect product' : 'Select for linesheet export'}
                                              >
                                                {isSelected ? (
                                                  <CheckSquare className="h-4 w-4 text-[#C9A86A]" />
                                                ) : (
                                                  <Square className="h-4 w-4 text-slate-300 hover:text-slate-500" />
                                                )}
                                              </button>

                                              <span className="text-slate-400 font-bold shrink-0">
                                                -
                                              </span>

                                              {/* Small Thumbnail Preview */}
                                              <div className="h-7 w-7 rounded overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                  src={product.imageUrl}
                                                  alt={product.name}
                                                  className="h-full w-full object-cover"
                                                  loading="lazy"
                                                />
                                              </div>

                                              {/* Product Name & Code */}
                                              <div className="min-w-0 flex-1">
                                                <button
                                                  type="button"
                                                  onClick={() => onViewDetails && onViewDetails(product)}
                                                  className="text-left font-semibold text-slate-900 hover:text-[#C9A86A] transition-colors truncate block max-w-md"
                                                >
                                                  {product.name}
                                                </button>
                                                <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                                                  <span className="font-mono font-medium text-slate-600">
                                                    {product.roadMapCode || product.sku}
                                                  </span>
                                                  <span>•</span>
                                                  <span>MOQ: {product.moq} pcs</span>
                                                  {product.originHub && (
                                                    <>
                                                      <span className="hidden md:inline">•</span>
                                                      <span className="hidden md:inline truncate">
                                                        {product.originHub}
                                                      </span>
                                                    </>
                                                  )}
                                                </div>
                                              </div>
                                            </div>

                                            {/* Price & Actions */}
                                            <div className="flex items-center space-x-2 shrink-0 ml-auto pl-2">
                                              <div className="text-right">
                                                <span className="text-xs font-bold text-slate-900 block">
                                                  {formatPrice(product.price)}
                                                </span>
                                                <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-medium">
                                                  Base FOB
                                                </span>
                                              </div>

                                              {/* View Spec Modal Button */}
                                              {onViewDetails && (
                                                <button
                                                  type="button"
                                                  onClick={() => onViewDetails(product)}
                                                  className="inline-flex items-center space-x-1 px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-semibold transition-colors shadow-xs"
                                                >
                                                  <Eye className="h-3 w-3 text-slate-500" />
                                                  <span className="hidden md:inline">Spec</span>
                                                </button>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

