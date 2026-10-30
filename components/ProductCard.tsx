'use client';

import React from 'react';
import { Product } from '@/types/product';
import { Check, Box, Ruler, MapPin, ShieldCheck } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  isSelected: boolean;
  onToggleSelect: (product: Product) => void;
}

export default function ProductCard({
  product,
  isSelected,
  onToggleSelect,
}: ProductCardProps) {
  const { heightMm, widthMm, depthMm } = product.dimensions;

  // Clean division label: e.g. "03 The Ceramic Index" -> "CERAMIC INDEX" or category name
  const divisionLabel = product.divisionTitle
    ? product.divisionTitle.replace(/^\d+\s+(The\s+)?/i, '').toUpperCase()
    : product.category.toUpperCase();

  return (
    <div
      onClick={() => onToggleSelect(product)}
      className={`group relative flex flex-col bg-white rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden ${
        isSelected
          ? 'border-[#0A1A2F] ring-2 ring-[#C9A86A] shadow-xl'
          : 'border-slate-200/90 hover:border-[#C9A86A] hover:shadow-md'
      }`}
    >
      {/* Visual Asset Container */}
      <div className="relative aspect-4/3 w-full bg-[#F8F6F2] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Selection Checkbox */}
        <div className="absolute top-3 right-3 z-10">
          <div
            className={`h-7 w-7 rounded-lg border-2 flex items-center justify-center transition-all ${
              isSelected
                ? 'bg-[#0A1A2F] border-[#0A1A2F] text-[#C9A86A] shadow-md scale-105'
                : 'bg-white/90 border-slate-300 text-transparent hover:border-[#0A1A2F] hover:bg-white shadow-xs backdrop-blur-xs'
            }`}
          >
            <Check className={`h-4 w-4 stroke-[3] ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
          </div>
        </div>

        {/* Clean Sourcing Division Pill */}
        <div className="absolute top-3 left-3 z-10">
          <span className="inline-block text-[9.5px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-[#0A1A2F]/90 text-[#C9A86A] backdrop-blur-xs border border-[#C9A86A]/40 shadow-xs">
            {divisionLabel}
          </span>
        </div>

        {/* SKU Badge */}
        <div className="absolute bottom-2 left-2 z-10">
          <span className="font-mono text-[9.5px] font-bold px-2 py-0.5 rounded bg-[#0A1A2F] text-white border border-[#C9A86A]/40 shadow-xs">
            {product.sku}
          </span>
        </div>
      </div>

      {/* Specification Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-sm text-[#0A1A2F] line-clamp-1 group-hover:text-[#C9A86A] transition-colors font-heading">
              {product.name}
            </h3>
            <div className="text-right shrink-0">
              <span className="text-sm font-extrabold text-[#0A1A2F] font-mono">
                ${product.price}
              </span>
              <span className="text-[9px] text-slate-400 block -mt-0.5 font-medium">FOB BGD</span>
            </div>
          </div>

          <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Origin & Technical Specs */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          {product.originHub && (
            <div className="flex items-center space-x-1 text-[10px] text-slate-500 truncate">
              <MapPin className="h-3 w-3 text-[#C9A86A] shrink-0" />
              <span className="truncate">{product.originHub}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] text-slate-600">
            <span className="flex items-center space-x-1 font-medium">
              <Ruler className="h-3 w-3 text-slate-400" />
              <span>Dimensions:</span>
            </span>
            <span className="font-mono font-semibold text-[#0A1A2F]">
              {heightMm} × {widthMm} × {depthMm} mm
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-600">
            <span className="flex items-center space-x-1 font-medium">
              <Box className="h-3 w-3 text-slate-400" />
              <span>Export MOQ:</span>
            </span>
            <span className="font-semibold text-[#0A1A2F]">
              {product.moq} units
            </span>
          </div>

          {/* Compliance Certification Badges */}
          {product.complianceCertifications && (
            <div className="flex flex-wrap gap-1 pt-1">
              {product.complianceCertifications.slice(0, 2).map((cert, i) => (
                <span
                  key={i}
                  className="inline-flex items-center space-x-1 text-[9px] font-semibold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200/60"
                >
                  <ShieldCheck className="h-2.5 w-2.5" />
                  <span>{cert}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action Toggle */}
        <div className="pt-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelect(product);
            }}
            className={`w-full py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center space-x-1.5 ${
              isSelected
                ? 'bg-[#0A1A2F] text-[#C9A86A] shadow-sm'
                : 'bg-[#F8F6F2] text-[#0A1A2F] hover:bg-slate-200/80 border border-slate-200'
            }`}
          >
            <Check className={`h-3 w-3 ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
            <span>{isSelected ? 'Curated in Line Sheet' : 'Add to Export Tray'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
