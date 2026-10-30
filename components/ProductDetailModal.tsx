'use client';

import React from 'react';
import { Product } from '@/types/product';
import { useCurrency } from './CurrencyContext';
import {
  X,
  Check,
  Package,
  Truck,
  ShieldCheck,
  FileSpreadsheet,
  Globe,
  Clock,
  Layers,
  Ruler,
  Anchor,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  isSelected: boolean;
  onToggleSelect: (product: Product) => void;
  onRequestSample?: (product: Product) => void;
}

export default function ProductDetailModal({
  product,
  onClose,
  isSelected,
  onToggleSelect,
  onRequestSample,
}: ProductDetailModalProps) {
  const { formatPrice, currentCurrency, currencyConfig } = useCurrency();

  if (!product) return null;

  const { heightMm, widthMm, depthMm } = product.dimensions;
  const carton = product.masterCarton;
  const specs = product.technicalSpecs;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div
        className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal Bar */}
        <div className="bg-[#0A1A2F] text-white px-6 py-4 flex items-center justify-between border-b border-[#C9A86A]/40 shrink-0">
          <div className="flex items-center space-x-3">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#C9A86A] text-[#0A1A2F]">
              {product.sku}
            </span>
            <span className="text-xs uppercase font-semibold tracking-wider text-[#C9A86A] hidden sm:inline">
              {product.divisionTitle}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-300 hidden md:inline">
              Enterprise Sourcing Specification
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1 text-slate-800">
          {/* Top Grid: Image + Commercial Summary */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* High Res Photography */}
            <div className="md:col-span-5 flex flex-col space-y-3">
              <div className="relative aspect-4/3 md:aspect-square w-full rounded-xl overflow-hidden bg-[#F8F6F2] border border-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-full w-full object-cover object-center"
                />
                <div className="absolute top-2 left-2">
                  <span className="text-[10px] font-bold px-2 py-1 rounded bg-[#0A1A2F]/90 text-[#C9A86A] backdrop-blur-xs border border-[#C9A86A]/30">
                    {product.category}
                  </span>
                </div>
              </div>

              {/* Origin Hub */}
              {product.originHub && (
                <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-center space-x-2">
                  <Globe className="h-3.5 w-3.5 text-[#C9A86A] shrink-0" />
                  <span>Sourcing Hub: <strong className="text-slate-700">{product.originHub}</strong></span>
                </div>
              )}
            </div>

            {/* Commercial Parameters */}
            <div className="md:col-span-7 flex flex-col justify-between space-y-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#0A1A2F] font-heading leading-tight">
                  {product.name}
                </h2>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Pricing & Commercial Terms Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-[#F8F6F2] p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    Export FOB Chittagong
                  </span>
                  <div className="flex items-baseline space-x-1 mt-0.5">
                    <span className="text-xl font-extrabold text-[#0A1A2F] font-mono">
                      {formatPrice(product.price)}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">/ unit</span>
                  </div>
                  {currentCurrency !== 'USD' && (
                    <span className="text-[10px] text-slate-400 block font-mono">
                      (Base: ${product.price} USD)
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    Minimum Order Qty
                  </span>
                  <span className="text-lg font-bold text-[#0A1A2F] block mt-0.5">
                    {product.moq} units
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold block">
                    OEM/ODM Custom
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    Courier Sample
                  </span>
                  <span className="text-lg font-bold text-[#0A1A2F] block mt-0.5">
                    {product.samplePriceUsd ? formatPrice(product.samplePriceUsd) : 'Complimentary'}
                  </span>
                  <span className="text-[10px] text-[#C9A86A] font-semibold block">
                    {product.sampleLeadTimeDays} Days Dispatch
                  </span>
                </div>
              </div>

              {/* Customs Tariff & Preference Bar */}
              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
                    HS Tariff Code:
                  </span>
                  <span className="font-mono text-xs font-bold bg-white text-emerald-900 px-2 py-0.5 rounded border border-emerald-300">
                    {product.hsCode}
                  </span>
                </div>

                {product.tariffPreferences && (
                  <div className="flex flex-wrap gap-1.5">
                    {product.tariffPreferences.map((pref, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100/90 text-emerald-800"
                      >
                        ✓ {pref}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Material Composition List */}
              <div>
                <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider block mb-1.5">
                  Material Composition & Architecture
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {product.materials.map((mat, i) => (
                    <span
                      key={i}
                      className="text-xs font-medium px-2.5 py-1 bg-slate-100 text-[#0A1A2F] rounded-md border border-slate-200/80"
                    >
                      {mat}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Logistics, Master Carton & Container Loadability */}
          {carton && (
            <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <Package className="h-4 w-4 text-[#C9A86A]" />
                  <h3 className="font-bold text-sm text-[#0A1A2F] uppercase tracking-wide font-heading">
                    Master Carton & International Shipping Logistics
                  </h3>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">
                  Export Packing Standard AMC-PKG-2026
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Units / Master Carton</span>
                  <span className="text-base font-extrabold text-[#0A1A2F] mt-0.5 block">{carton.unitsPerCarton} units</span>
                  <span className="text-[10px] text-slate-400">Export double-wall 5-ply</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Carton Dimensions</span>
                  <span className="text-sm font-bold text-[#0A1A2F] font-mono mt-0.5 block">
                    {carton.heightMm} × {carton.widthMm} × {carton.depthMm} mm
                  </span>
                  <span className="text-[10px] text-slate-400">Carton H × W × D</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Carton Gross Weight</span>
                  <span className="text-base font-extrabold text-[#0A1A2F] mt-0.5 block">{carton.grossWeightKg} kg</span>
                  <span className="text-[10px] text-slate-400">Max manual handling OK</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Volume per Carton</span>
                  <span className="text-base font-extrabold text-[#C9A86A] font-mono mt-0.5 block">{carton.cbm} CBM</span>
                  <span className="text-[10px] text-slate-400">Cubic Meters</span>
                </div>
              </div>

              {/* Container Capacity Estimation */}
              {(carton.unitsPer20ftContainer || carton.unitsPer40ftContainer) && (
                <div className="bg-[#0A1A2F]/5 p-3.5 rounded-lg border border-[#0A1A2F]/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center space-x-2">
                    <Anchor className="h-4 w-4 text-[#0A1A2F]" />
                    <span className="font-bold text-[#0A1A2F]">Estimated Ocean Container Loadability:</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    {carton.unitsPer20ftContainer && (
                      <span className="text-slate-700">
                        <strong>20ft FCL Container:</strong> ~{carton.unitsPer20ftContainer.toLocaleString()} units
                      </span>
                    )}
                    {carton.unitsPer40ftContainer && (
                      <span className="text-slate-700">
                        <strong>40ft High-Cube FCL:</strong> ~{carton.unitsPer40ftContainer.toLocaleString()} units
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Section 3: Technical Specifications, Inspection & ESG */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tech Standards */}
            <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-2.5">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#0A1A2F]">
                  Quality Assurance & QA Standards
                </h4>
              </div>
              <ul className="text-xs space-y-2 text-slate-600">
                {specs?.testStandard && (
                  <li>
                    <strong className="text-slate-800">Inspection Protocol:</strong> {specs.testStandard}
                  </li>
                )}
                {specs?.chemicalCompliance && (
                  <li>
                    <strong className="text-slate-800">Chemical Compliance:</strong> {specs.chemicalCompliance}
                  </li>
                )}
                {specs?.foodSafety && (
                  <li>
                    <strong className="text-slate-800">Food Safety:</strong> {specs.foodSafety}
                  </li>
                )}
                {specs?.colorFastness && (
                  <li>
                    <strong className="text-slate-800">Color Fastness:</strong> {specs.colorFastness}
                  </li>
                )}
                {specs?.seamStrength && (
                  <li>
                    <strong className="text-slate-800">Tensile & Seam:</strong> {specs.seamStrength}
                  </li>
                )}
              </ul>
            </div>

            {/* IncoTerms & Sample Policy */}
            <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-2.5">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
                <Truck className="h-4 w-4 text-[#C9A86A]" />
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#0A1A2F]">
                  International Commercial Terms (IncoTerms 2020)
                </h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Standard baseline quotation is <strong>FOB Chittagong Sea Port</strong> or <strong>DAC Dhaka Air Cargo</strong>. ArielMC offers turnkey landed CIF Felixstowe / Rotterdam / Los Angeles and DDP to client distribution centers upon request.
              </p>
              <div className="flex flex-wrap gap-1 pt-1">
                {product.incoTermsAvailable?.map((term, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200"
                  >
                    {term}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Bar */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500">
            <span>Product Unit Dimension: </span>
            <strong className="text-[#0A1A2F] font-mono">
              {heightMm} × {widthMm} × {depthMm} mm
            </strong>
            {product.weightGrams && (
              <span className="ml-2">({(product.weightGrams / 1000).toFixed(2)} kg)</span>
            )}
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                if (onRequestSample) {
                  onRequestSample(product);
                }
              }}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-white text-[#0A1A2F] border border-[#0A1A2F]/30 hover:bg-slate-100 transition-all flex items-center justify-center space-x-2"
            >
              <Clock className="h-3.5 w-3.5 text-[#C9A86A]" />
              <span>Request Sample ({product.sampleLeadTimeDays}d)</span>
            </button>

            <button
              type="button"
              onClick={() => onToggleSelect(product)}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center space-x-2 ${
                isSelected
                  ? 'bg-[#0A1A2F] text-[#C9A86A] shadow-md'
                  : 'bg-[#0A1A2F] text-white hover:bg-slate-900 shadow-sm'
              }`}
            >
              <Check className={`h-4 w-4 ${isSelected ? 'opacity-100 text-[#C9A86A]' : 'opacity-0'}`} />
              <span>{isSelected ? 'In Export Tray' : 'Add to Export Tray'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
