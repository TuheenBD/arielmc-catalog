'use client';

import React from 'react';
import { Product } from '@/types/product';
import { Check, Box, Ruler, MapPin, ShieldCheck, Eye, Package, Clock } from 'lucide-react';
import { useCurrency } from './CurrencyContext';

interface ProductCardProps {
  product: Product;
  isSelected: boolean;
  onToggleSelect: (product: Product) => void;
  onViewDetails?: (product: Product) => void;
}

export default function ProductCard({
  product,
  isSelected,
  onToggleSelect,
  onViewDetails,
}: ProductCardProps) {
  const { formatPrice, currentCurrency } = useCurrency();
  const { heightMm, widthMm, depthMm } = product.dimensions;
  const carton = product.masterCarton;

  // Clean division label: e.g. "03 The Ceramic Index" -> "CERAMIC INDEX"
  const divisionLabel = product.divisionTitle
    ? product.divisionTitle.replace(/^\d+\s+(The\s+)?/i, '').toUpperCase()
    : product.category.toUpperCase();

  const handleCardClick = () => {
    if (onViewDetails) {
      onViewDetails(product);
    } else {
      onToggleSelect(product);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative flex flex-col bg-white rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden ${
        isSelected
          ? 'border-[#0A1A2F] ring-2 ring-[#C9A86A] shadow-xl'
          : 'border-slate-200/90 hover:border-[#C9A86A] hover:shadow-lg'
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
        <div
          className="absolute top-3 right-3 z-10"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect(product);
          }}
        >
          <div
            className={`h-7 w-7 rounded-lg border-2 flex items-center justify-center transition-all ${
              isSelected
                ? 'bg-[#0A1A2F] border-[#0A1A2F] text-[#C9A86A] shadow-md scale-105'
                : 'bg-white/95 border-slate-300 text-transparent hover:border-[#0A1A2F] hover:bg-white shadow-xs backdrop-blur-xs'
            }`}
          >
            <Check className={`h-4 w-4 stroke-[3] ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
          </div>
        </div>

        {/* Clean Sourcing Division Pill */}
        <div className="absolute top-3 left-3 z-10">
          <span className="inline-block text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#0A1A2F]/90 text-[#C9A86A] backdrop-blur-xs border border-[#C9A86A]/40 shadow-xs">
            {divisionLabel}
          </span>
        </div>

        {/* SKU Badge + HS Tariff Code */}
        <div className="absolute bottom-2 left-2 z-10 flex items-center space-x-1">
          <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#0A1A2F] text-white border border-[#C9A86A]/40 shadow-xs">
            {product.sku}
          </span>
          <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-900/90 text-emerald-200 border border-emerald-500/40 shadow-xs">
            HS {product.hsCode}
          </span>
        </div>

        {/* Quick View Hover Prompt */}
        <div className="absolute inset-0 bg-[#0A1A2F]/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="bg-white/95 text-[#0A1A2F] text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-lg flex items-center space-x-1.5 border border-slate-200">
            <Eye className="h-3.5 w-3.5 text-[#C9A86A]" />
            <span>Inspect Tech-Pack</span>
          </span>
        </div>
      </div>

      {/* Specification Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              {product.subCategory && (
                <span className="text-[10px] font-bold text-[#C9A86A] uppercase tracking-wider truncate block mb-0.5">
                  {product.subCategory}
                </span>
              )}
              <h3 className="font-bold text-sm text-[#0A1A2F] line-clamp-1 group-hover:text-[#C9A86A] transition-colors font-heading">
                {product.name}
              </h3>
            </div>
            <div className="text-right shrink-0">
              <span className="text-sm font-extrabold text-[#0A1A2F] font-mono">
                {formatPrice(product.price)}
              </span>
              <span className="text-[9px] text-slate-400 block -mt-0.5 font-medium">FOB BGD</span>
            </div>
          </div>

          <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Corporate Procurement & Logistics Specs */}
        <div className="pt-2 border-t border-slate-100 space-y-1.5">
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

          {/* Master Carton Logistics */}
          {carton && (
            <div className="flex items-center justify-between text-[11px] text-slate-600">
              <span className="flex items-center space-x-1 font-medium">
                <Package className="h-3 w-3 text-[#C9A86A]" />
                <span>Master Carton:</span>
              </span>
              <span className="font-semibold text-slate-700">
                {carton.unitsPerCarton} pcs • <strong className="font-mono text-[#0A1A2F]">{carton.cbm} CBM</strong>
              </span>
            </div>
          )}

          {/* Sample Dispatch Lead Time */}
          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
            <span className="flex items-center space-x-1">
              <Clock className="h-3 w-3 text-emerald-600" />
              <span>Courier Sample:</span>
            </span>
            <span className="font-semibold text-emerald-700">
              {product.sampleLeadTimeDays}d DHL Express
            </span>
          </div>

          {/* International Compliance Badges */}
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

        {/* Dual Actions: Inspect Specs vs Add to Line Sheet */}
        <div className="pt-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onViewDetails) onViewDetails(product);
            }}
            className="py-1.5 px-2 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-[#0A1A2F] hover:bg-slate-200 border border-slate-200 transition-all flex items-center justify-center space-x-1"
          >
            <Eye className="h-3 w-3 text-[#C9A86A]" />
            <span>Tech-Pack</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelect(product);
            }}
            className={`py-1.5 px-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-center space-x-1 ${
              isSelected
                ? 'bg-[#0A1A2F] text-[#C9A86A] shadow-xs'
                : 'bg-[#F8F6F2] text-[#0A1A2F] hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <Check className={`h-3 w-3 ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
            <span>{isSelected ? 'Curated' : 'Add to Tray'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
