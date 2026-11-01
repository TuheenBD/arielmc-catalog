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
  onOpenSamplePolicy?: () => void;
}

export default function ProductDetailModal({
  product,
  onClose,
  isSelected,
  onToggleSelect,
  onRequestSample,
  onOpenSamplePolicy,
}: ProductDetailModalProps) {
  const { formatPrice, currentCurrency, currencyConfig } = useCurrency();

  const [activeImage, setActiveImage] = React.useState<string>(product?.imageUrl || '');
  const [activeLabel, setActiveLabel] = React.useState<string>(
    product?.gallery?.[0]?.label || product?.gallery?.[0]?.tag || ''
  );
  const [selectedSizeIndex, setSelectedSizeIndex] = React.useState<number>(0);

  React.useEffect(() => {
    setSelectedSizeIndex(0);
  }, [product?.id]);

  React.useEffect(() => {
    if (product) {
      setActiveImage(product.imageUrl);
      setActiveLabel(product.gallery?.[0]?.label || product.gallery?.[0]?.tag || '');
    }
  }, [product]);

  if (!product) return null;

  const activeSize = product.sizeOptions && product.sizeOptions[selectedSizeIndex]
    ? product.sizeOptions[selectedSizeIndex]
    : null;
  const activeDimensions = activeSize ? activeSize.dimensions : product.dimensions;
  const activeWeight = activeSize?.weightGrams || product.weightGrams;
  const activePrice = activeSize ? activeSize.price : product.price;

  const { heightMm, widthMm, depthMm } = activeDimensions;
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
                  src={activeImage || product.imageUrl}
                  alt={product.name}
                  className="h-full w-full object-cover object-center transition-all duration-300"
                />
                <div className="absolute top-2 left-2">
                  <span className="text-[10px] font-bold px-2 py-1 rounded bg-[#0A1A2F]/90 text-[#C9A86A] backdrop-blur-xs border border-[#C9A86A]/30">
                    {product.category}
                  </span>
                </div>

                {/* Floating Variant Label */}
                {activeLabel && (
                  <div className="absolute bottom-2 left-2 z-10 max-w-[80%]">
                    <span className="inline-block truncate bg-[#0A1A2F]/85 backdrop-blur-xs text-white text-[11px] px-2.5 py-1 rounded font-mono shadow-xs border border-white/10">
                      {activeLabel}
                    </span>
                  </div>
                )}
              </div>

              {/* Multi-Angle / Colorway Gallery Thumbnails (Fixed Uniform 4-Column Grid) */}
              {product.gallery && product.gallery.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.gallery.map((item, idx) => {
                    const isActive = (activeImage || product.imageUrl) === item.src;
                    return (
                      <button
                        key={idx}
                        type="button"
                        title={item.title || item.label}
                        onClick={() => {
                          setActiveImage(item.src);
                          setActiveLabel(item.label || item.tag || '');
                        }}
                        className={`aspect-square rounded-lg overflow-hidden p-0.5 bg-white transition-all cursor-pointer ${
                          isActive
                            ? 'border-2 border-[#C9A86A] shadow-md scale-105'
                            : 'border border-slate-200 opacity-60 hover:opacity-100 hover:border-slate-400'
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.src}
                          alt={item.label || product.name}
                          className="w-full h-full object-cover rounded"
                        />
                      </button>
                    );
                  })}
                </div>
              )}

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
                {product.categoryGroup && (
                  <div className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 font-heading">
                    <span className="text-[#C9A86A]">{product.categoryGroup}</span>
                    {product.subCategory && (
                      <>
                        <span>•</span>
                        <span className="text-slate-600">{product.subCategory}</span>
                      </>
                    )}
                    {product.prodtId && (
                      <>
                        <span>•</span>
                        <span className="font-mono text-slate-400">Roadmap Item #{product.prodtId}</span>
                      </>
                    )}
                  </div>
                )}
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#0A1A2F] font-heading leading-tight">
                  {product.name}
                </h2>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Size & Diameter Specification Selector */}
              {product.sizeOptions && product.sizeOptions.length > 0 && (
                <div className="bg-[#F8F6F2] p-3.5 rounded-xl border border-slate-200/90">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10.5px] uppercase font-bold text-slate-500 tracking-wider">
                      Select Diameter &amp; Sourcing Tier:
                    </span>
                    <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      2 Sizes Available
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {product.sizeOptions.map((opt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedSizeIndex(idx)}
                        className={`p-2.5 rounded-lg text-left transition-all border cursor-pointer ${
                          selectedSizeIndex === idx
                            ? 'bg-[#0A1A2F] text-white border-[#0A1A2F] shadow-md ring-1 ring-[#C9A86A]'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-[#0A1A2F]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold ${selectedSizeIndex === idx ? 'text-[#C9A86A]' : 'text-[#0A1A2F]'}`}>
                            {opt.label}
                          </span>
                          <span className={`text-xs font-extrabold font-mono ${selectedSizeIndex === idx ? 'text-[#C9A86A]' : 'text-[#0A1A2F]'}`}>
                            {formatPrice(opt.price)}
                          </span>
                        </div>
                        <span className={`text-[10px] block mt-0.5 ${selectedSizeIndex === idx ? 'text-slate-300' : 'text-slate-400'}`}>
                          {opt.dimensions.widthMm} mm ({opt.shortLabel}) &bull; {opt.dimensions.heightMm} mm profile
                          {opt.weightGrams && ` &bull; ${(opt.weightGrams / 1000).toFixed(2)} kg`}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Pricing & Commercial Terms Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-[#F8F6F2] p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    Export FOB Chittagong
                  </span>
                  <div className="flex items-baseline space-x-1 mt-0.5">
                    <span className="text-xl font-extrabold text-[#0A1A2F] font-mono">
                      {formatPrice(activePrice)}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">/ unit</span>
                  </div>
                  {activeSize && (
                    <span className="text-[10px] font-bold text-[#C9A86A] block font-mono">
                      For {activeSize.shortLabel}
                    </span>
                  )}
                  {currentCurrency !== 'USD' && (
                    <span className="text-[10px] text-slate-400 block font-mono">
                      (Base: ${activePrice} USD)
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
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center space-x-2">
                  <Truck className="h-4 w-4 text-[#C9A86A]" />
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#0A1A2F]">
                    Commercial Terms & Sample Policy
                  </h4>
                </div>
                {onOpenSamplePolicy && (
                  <button
                    type="button"
                    onClick={onOpenSamplePolicy}
                    className="text-[10px] font-bold text-[#C9A86A] hover:underline flex items-center space-x-1"
                  >
                    <span>Policy SOP</span>
                    <ExternalLink className="h-2.5 w-2.5" />
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Standard baseline quotation is <strong>FOB Chittagong Sea Port</strong> or <strong>DAC Dhaka Air Cargo</strong>. 100% of physical sample fee credited back on qualifying bulk POs per <strong>SOP-B2B-SMP-2026-V1</strong>.
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

          {/* Section 4: Ceramic & Terracotta Engineering & Custom Tooling (from official reference) */}
          {(product.category === 'Ceramics' || product.category === 'Pottery') && (
            <div className="border border-[#C9A86A]/40 rounded-xl p-4 bg-[#F8F6F2] space-y-3">
              <div className="flex items-center justify-between border-b border-[#C9A86A]/20 pb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-base">🏺</span>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#0A1A2F]">
                    {product.category === 'Ceramics' ? 'Ceramics & Stoneware Engineering Protocol' : 'Bengal Terracotta & Earthenware Craftsmanship'}
                  </h4>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  Breakage Guarantee &lt; 1.5%
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[9.5px] uppercase font-bold text-slate-400 block">Firing Vitrification</span>
                  <span className="font-bold text-[#0A1A2F]">1,280°C Tunnel Kiln</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[9.5px] uppercase font-bold text-slate-400 block">Water Absorption</span>
                  <span className="font-mono font-bold text-[#0A1A2F]">&lt; 0.2% – 0.5%</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[9.5px] uppercase font-bold text-slate-400 block">Thermal Durability</span>
                  <span className="font-bold text-[#0A1A2F]">Oven Safe to 220°C</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[9.5px] uppercase font-bold text-slate-400 block">Food Safety Testing</span>
                  <span className="font-bold text-emerald-700">FDA • LFGB • EU 1935</span>
                </div>
              </div>

              <div className="pt-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                  OEM / ODM Custom Tooling Surcharge Schedule:
                </span>
                <div className="text-[10.5px] text-slate-600 font-mono bg-white p-2.5 rounded-lg border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  <div>&bull; <strong>Custom Plaster Mold:</strong>  / shape (3D CAD, min 1k pcs)</div>
                  <div>&bull; <strong>Underglaze Decal Print:</strong>  setup + zsh.18 / unit</div>
                  <div>&bull; <strong>Laser Engraved Backstamp:</strong>  tooling + zsh.05 / unit</div>
                  <div>&bull; <strong>4-Color Window Box:</strong>  plate + zsh.45 / unit</div>
                </div>
              </div>
            </div>
          )}

          {/* Section 4.5: Golden Jute Circularity & Precision Manufacturing Protocol (from official B2B reference) */}
          {product.category === 'Jute' && (
            <div className="border border-emerald-600/30 rounded-xl p-4 bg-emerald-50/40 space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-600/20 pb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-base">🌱</span>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#0A1A2F]">
                    Golden Jute Circularity &amp; Engineering Protocol (Corchorus olitorius)
                  </h4>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">
                    Plant-Based 100% Biodegradable
                  </span>
                  {product.roadMapCode && product.roadMapCode.includes('JLX') && (
                    <span className="text-[9.5px] font-mono font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300" title="Factory Cum Supplier: Jute Luxury Fashion (Gazipur)">
                      FAC-GAZ-02 (JLX)
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[9.5px] uppercase font-bold text-slate-400 block">Carbon Sequestration</span>
                  <span className="font-bold text-[#0A1A2F]">15 MT CO₂ / Hectare</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[9.5px] uppercase font-bold text-slate-400 block">Soil Degradation</span>
                  <span className="font-bold text-emerald-700">60–90 Days Compost</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[9.5px] uppercase font-bold text-slate-400 block">Monthly Bag Output</span>
                  <span className="font-bold text-[#0A1A2F]">250k – 300k Bags / Mo</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[9.5px] uppercase font-bold text-slate-400 block">Quality &amp; Metal Safety</span>
                  <span className="font-bold text-emerald-700">AQL 2.5 • 9-Pt Needle Scan</span>
                </div>
              </div>

              <div className="pt-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                  OEM / ODM Customization &amp; Tooling Surcharges (B2B Export Policy):
                </span>
                <div className="text-[10.5px] text-slate-600 font-mono bg-white p-2.5 rounded-lg border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  <div>&bull; <strong>Silkscreen Printing:</strong> .00 setup / screen + zsh.12 / color / side (MOQ: 500 pcs)</div>
                  <div>&bull; <strong>Custom Pantone Dyeing:</strong> Included if MOQ met, or +zsh.25 / unit (1,000m fabric)</div>
                  <div>&bull; <strong>Embossed Leather Patch:</strong> .00 brass stamp die + zsh.45 / unit (MOQ: 1,000 pcs)</div>
                  <div>&bull; <strong>Custom Woven Outer Label:</strong> .00 loom setup + zsh.08 / unit (MOQ: 2,000 pcs)</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Bar */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500">
            <span>Product Unit Dimension: </span>
            <strong className="text-[#0A1A2F] font-mono">
              {heightMm} × {widthMm} × {depthMm} mm
            </strong>
            {activeWeight && (
              <span className="ml-1.5">({(activeWeight / 1000).toFixed(2)} kg)</span>
            )}
            {activeSize && (
              <span className="ml-2 text-[10px] font-bold font-mono text-[#0A1A2F] bg-amber-100/80 px-2 py-0.5 rounded border border-amber-300">
                {activeSize.shortLabel}
              </span>
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
