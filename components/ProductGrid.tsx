'use client';

import React, { useState } from 'react';
import { Product } from '@/types/product';
import ProductCard from './ProductCard';
import ProductTree from './ProductTree';
import { CheckSquare, Square, PackageOpen, LayoutGrid, ListTree, Columns } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  selectedProducts: Product[];
  onToggleSelect: (product: Product) => void;
  onSelectAllVisible: () => void;
  onClearSelection: () => void;
  onViewDetails?: (product: Product) => void;
}

export default function ProductGrid({
  products,
  selectedProducts,
  onToggleSelect,
  onSelectAllVisible,
  onClearSelection,
  onViewDetails,
}: ProductGridProps) {
  // Default to 'tree' view as requested: displays product tree right after "Showing 74 Products" line
  const [viewMode, setViewMode] = useState<'tree' | 'grid' | 'both'>('tree');

  const selectedIds = new Set(selectedProducts.map((p) => p.id));
  const areAllVisibleSelected =
    products.length > 0 && products.every((p) => selectedIds.has(p.id));

  return (
    <div className="flex-1 space-y-4">
      {/* Grid Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div className="flex flex-wrap items-center gap-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Showing <span className="text-slate-900 font-bold">{products.length}</span> Products
          </div>

          {/* View Mode Switcher Pills */}
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs font-medium">
            <button
              type="button"
              onClick={() => setViewMode('tree')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-md transition-all ${
                viewMode === 'tree'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Hierarchical Category & Product Tree"
            >
              <ListTree className="h-3.5 w-3.5 text-[#C9A86A]" />
              <span>Product Tree</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-md transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Visual Product Cards Grid"
            >
              <LayoutGrid className="h-3.5 w-3.5 text-slate-500" />
              <span>Grid Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('both')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-md transition-all ${
                viewMode === 'both'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Display Tree and Grid Together"
            >
              <Columns className="h-3.5 w-3.5 text-slate-500" />
              <span>Both</span>
            </button>
          </div>
        </div>

        {products.length > 0 && (
          <div className="flex items-center space-x-3 text-xs">
            <button
              type="button"
              onClick={areAllVisibleSelected ? onClearSelection : onSelectAllVisible}
              className="flex items-center space-x-1.5 font-semibold text-slate-700 hover:text-slate-900 transition-colors"
            >
              {areAllVisibleSelected ? (
                <>
                  <CheckSquare className="h-4 w-4 text-slate-900" />
                  <span>Deselect Visible</span>
                </>
              ) : (
                <>
                  <Square className="h-4 w-4 text-slate-400" />
                  <span>Select All Visible</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Main Content Layout */}
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
        <>
          {/* Product Tree: rendered right after SHOWING PRODUCTS line */}
          {(viewMode === 'tree' || viewMode === 'both') && (
            <ProductTree
              products={products}
              selectedProducts={selectedProducts}
              onToggleSelect={onToggleSelect}
              onViewDetails={onViewDetails}
            />
          )}

          {/* Grid Layout Cards */}
          {(viewMode === 'grid' || viewMode === 'both') && (
            <div>
              {viewMode === 'both' && (
                <div className="pt-2 pb-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-2">
                    Visual Product Card Showcase ({products.length} Specifications)
                  </h4>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isSelected={selectedIds.has(product.id)}
                    onToggleSelect={onToggleSelect}
                    onViewDetails={onViewDetails}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
