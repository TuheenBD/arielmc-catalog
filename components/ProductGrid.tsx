'use client';

import React from 'react';
import { Product } from '@/types/product';
import ProductCard from './ProductCard';
import { CheckSquare, Square, PackageOpen } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  selectedProducts: Product[];
  onToggleSelect: (product: Product) => void;
  onSelectAllVisible: () => void;
  onClearSelection: () => void;
}

export default function ProductGrid({
  products,
  selectedProducts,
  onToggleSelect,
  onSelectAllVisible,
  onClearSelection,
}: ProductGridProps) {
  const selectedIds = new Set(selectedProducts.map((p) => p.id));
  const areAllVisibleSelected =
    products.length > 0 && products.every((p) => selectedIds.has(p.id));

  return (
    <div className="flex-1 space-y-4">
      {/* Grid Action Toolbar */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Showing <span className="text-slate-900 font-bold">{products.length}</span> Products
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

      {/* Grid Layout */}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isSelected={selectedIds.has(product.id)}
              onToggleSelect={onToggleSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

