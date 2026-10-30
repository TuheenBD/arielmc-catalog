'use client';

import React, { useState, useMemo } from 'react';
import { Product, ExportConsigneeInfo } from '@/types/product';
import { useCurrency } from './CurrencyContext';
import {
  FileDown,
  Trash2,
  X,
  ChevronUp,
  ChevronDown,
  Loader2,
  Building2,
  Anchor,
  Package,
  Truck,
  Send,
  CheckCircle2,
  Globe,
  Clock,
  ExternalLink,
} from 'lucide-react';

interface ExportTrayProps {
  selectedProducts: Product[];
  onRemoveProduct: (productId: string) => void;
  onClearAll: () => void;
  activeTab?: 'linesheet' | 'sample' | 'rfq';
  onOpenSamplePolicy?: () => void;
}

export default function ExportTray({
  selectedProducts,
  onRemoveProduct,
  onClearAll,
  onOpenSamplePolicy,
}: ExportTrayProps) {
  const { currentCurrency, currencyConfig, formatPrice } = useCurrency();
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeMode, setActiveMode] = useState<'linesheet' | 'sample' | 'rfq'>('linesheet');
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState<string | null>(null);

  const [consignee, setConsignee] = useState<ExportConsigneeInfo>({
    companyName: 'Nordic Heritage Goods Ltd',
    contactName: 'Alexander Lind',
    contactEmail: 'a.lind@nordicheritage.com',
    targetMarket: 'United Kingdom & European Union',
    targetPort: 'Felixstowe Port (UK DCTS 0% Duty)',
    incoTerm: 'FOB Chittagong Sea Port',
    courierAccount: 'DHL Express Account #968341902',
    deliveryAddress: '44 Commercial Road, London E1 1LN, United Kingdom',
    notes: 'Require DAE Phytosanitary and Fumigation certificates with GOTS certification.',
  });

  // Calculate container loadability metrics
  const logisticsSummary = useMemo(() => {
    let totalCbm = 0;
    let totalWeightKg = 0;
    let totalCartons = 0;
    let totalSampleUsd = 0;

    selectedProducts.forEach((p) => {
      totalSampleUsd += p.samplePriceUsd || 30;
      if (p.masterCarton) {
        const cartonsForMoq = Math.ceil(p.moq / p.masterCarton.unitsPerCarton);
        totalCartons += cartonsForMoq;
        totalCbm += cartonsForMoq * p.masterCarton.cbm;
        totalWeightKg += cartonsForMoq * p.masterCarton.grossWeightKg;
      }
    });

    return {
      totalCbm: Math.round(totalCbm * 100) / 100,
      totalWeightKg: Math.round(totalWeightKg),
      totalCartons,
      totalSampleUsd,
      pct20ft: Math.min(100, Math.round((totalCbm / 33.2) * 100)),
      pct40ft: Math.min(100, Math.round((totalCbm / 67.7) * 100)),
    };
  }, [selectedProducts]);

  if (selectedProducts.length === 0) {
    return null;
  }

  // Handle PDF Generation
  const handleGeneratePdf = async () => {
    setIsExporting(true);
    setExportError(null);
    setSubmissionSuccess(null);

    try {
      const response = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          consignee,
          products: selectedProducts,
          generatedAt: new Date().toISOString(),
          documentTitle: `ArielMC Commercial Line Sheet — Corporate Sourcing Edition`,
          selectedCurrency: currentCurrency,
          currencyRate: currencyConfig.rateFromUsd,
          currencySymbol: currencyConfig.symbol,
          incoTerm: consignee.incoTerm,
          totalEstimatedCbm: logisticsSummary.totalCbm,
          totalEstimatedWeightKg: logisticsSummary.totalWeightKg,
          totalEstimatedCartons: logisticsSummary.totalCartons,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Server failed to compile catalog PDF.');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const sanitizedCompany = consignee.companyName.replace(/[^a-zA-Z0-9]/g, '_') || 'ArielMC_Corporate';
      link.download = `ArielMC_${sanitizedCompany}_LineSheet_${currentCurrency}_${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: unknown) {
      console.error('PDF Generation Failure:', err);
      setExportError(err instanceof Error ? err.message : 'Failed to compile line sheet PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  // Handle Courier Sample Dispatch or Formal RFQ
  const handleCourierSampleOrRfq = async (type: 'sample_dispatch' | 'rfq_quote') => {
    setIsExporting(true);
    setExportError(null);
    setSubmissionSuccess(null);

    try {
      const payload = {
        requestType: type,
        consignee,
        products: selectedProducts.map((p) => ({
          id: p.id,
          sku: p.sku,
          name: p.name,
          category: p.category,
          moq: p.moq,
          priceUsd: p.price,
          samplePriceUsd: p.samplePriceUsd,
          hsCode: p.hsCode,
        })),
        currency: currentCurrency,
        currencyRate: currencyConfig.rateFromUsd,
        logistics: logisticsSummary,
        submittedAt: new Date().toISOString(),
      };

      const res = await fetch('/api/quotes/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit request');
      }

      setSubmissionSuccess(
        type === 'sample_dispatch'
          ? `Sample Order Confirmed! Tracking Ref: ${data.quoteNumber || 'REQ-AMC-2026'}. Courier dispatch scheduled within 7-10 business days.`
          : `Formal RFQ Dispatched! Reference: ${data.quoteNumber || 'REQ-AMC-2026'}. Our commercial export desk will reply within 24 hours.`
      );
    } catch (err: unknown) {
      setExportError(err instanceof Error ? err.message : 'Failed to dispatch request.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-2 sm:p-4 pointer-events-none">
      <div className="max-w-6xl mx-auto pointer-events-auto">
        <div className="bg-[#0A1A2F] text-white rounded-2xl shadow-2xl border border-[#C9A86A]/40 overflow-hidden transition-all duration-300">
          {/* Main Action Bar */}
          <div className="p-3 sm:p-4 sm:px-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Left: Summary & CBM indicator */}
            <div className="flex items-center space-x-3 min-w-0">
              <div className="h-10 w-10 rounded-xl bg-[#C9A86A] text-[#0A1A2F] flex items-center justify-center font-extrabold text-sm shrink-0 shadow-sm font-heading">
                {selectedProducts.length}
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-2">
                  <h4 className="font-bold text-xs sm:text-sm text-white truncate font-heading uppercase tracking-wide">
                    Corporate Export Tray
                  </h4>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#C9A86A]/20 text-[#C9A86A] rounded border border-[#C9A86A]/30 hidden sm:inline-block">
                    {currentCurrency} ({currencyConfig.symbol}) Active
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-[11px] text-slate-300 truncate">
                  <span>
                    Est. Vol: <strong className="text-[#C9A86A] font-mono">{logisticsSummary.totalCbm} CBM</strong>
                  </span>
                  <span>•</span>
                  <span>{logisticsSummary.totalCartons} Cartons</span>
                  <span>•</span>
                  <span>{logisticsSummary.totalWeightKg} kg Gross</span>
                </div>
              </div>
            </div>

            {/* Right: Procurement Mode Actions */}
            <div className="flex items-center space-x-2 shrink-0 justify-end flex-wrap gap-y-1">
              {/* Drawer Toggle */}
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-lg flex items-center space-x-1.5 transition-colors border border-slate-700"
              >
                <Building2 className="h-3.5 w-3.5 text-[#C9A86A]" />
                <span className="hidden sm:inline">Consignee Specs</span>
                {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
              </button>

              {/* Sample Dispatch Action */}
              <button
                type="button"
                disabled={isExporting}
                onClick={() => {
                  if (!isExpanded) setIsExpanded(true);
                  setActiveMode('sample');
                }}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg border border-slate-600 transition-all flex items-center space-x-1.5"
              >
                <Clock className="h-3.5 w-3.5 text-[#C9A86A]" />
                <span>Request Sample</span>
              </button>

              {/* PDF Line Sheet Action */}
              <button
                type="button"
                disabled={isExporting}
                onClick={handleGeneratePdf}
                className="px-4 py-2 bg-[#C9A86A] hover:bg-[#b69557] text-[#0A1A2F] font-bold text-xs uppercase tracking-wider rounded-lg shadow-md transition-all flex items-center space-x-2 disabled:opacity-50 font-heading"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-[#0A1A2F]" />
                    <span>Compiling...</span>
                  </>
                ) : (
                  <>
                    <FileDown className="h-3.5 w-3.5 stroke-[2.5]" />
                    <span>A4 Line Sheet ({currencyConfig.symbol})</span>
                  </>
                )}
              </button>

              {/* Clear Tray */}
              <button
                type="button"
                onClick={onClearAll}
                className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                title="Clear tray"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Feedback Alerts */}
          {exportError && (
            <div className="px-6 py-2 bg-rose-900/70 border-t border-rose-800 text-rose-200 text-xs flex items-center justify-between">
              <span>{exportError}</span>
              <button onClick={() => setExportError(null)} className="hover:text-white">
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {submissionSuccess && (
            <div className="px-6 py-2.5 bg-emerald-900/80 border-t border-emerald-700 text-emerald-200 text-xs flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>{submissionSuccess}</span>
              </div>
              <button onClick={() => setSubmissionSuccess(null)} className="hover:text-white">
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* Expanded Consignee & International Shipping Logistics Drawer */}
          {isExpanded && (
            <div className="border-t border-[#C9A86A]/20 bg-[#060f1c] p-4 sm:p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Sourcing Mode Switcher */}
              <div className="flex border-b border-slate-800 pb-3 gap-2">
                <button
                  type="button"
                  onClick={() => setActiveMode('linesheet')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    activeMode === 'linesheet'
                      ? 'bg-[#C9A86A] text-[#0A1A2F]'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Commercial Line Sheet (PDF)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMode('sample')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-1.5 ${
                    activeMode === 'sample'
                      ? 'bg-[#C9A86A] text-[#0A1A2F]'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Clock className="h-3.5 w-3.5" />
                  <span>Order Express Samples (7-10d)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMode('rfq')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    activeMode === 'rfq'
                      ? 'bg-[#C9A86A] text-[#0A1A2F]'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Request Formal RFQ
                </button>
              </div>

              {/* Sample Dispatch Banner if in Sample Mode */}
              {activeMode === 'sample' && (
                <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span><strong style={{ textTransform: 'none' }} className="font-black text-white inline-block">ArielMC</strong> Sample Development Governance (SOP-B2B-SMP-2026-V1)</span>
                    </div>
                    {onOpenSamplePolicy && (
                      <button
                        type="button"
                        onClick={onOpenSamplePolicy}
                        className="text-[10px] text-[#C9A86A] hover:underline font-bold uppercase tracking-wider flex items-center space-x-1 cursor-pointer"
                      >
                        <span>View Full SOP & Credit Rules</span>
                        <ExternalLink className="h-2.5 w-2.5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px] text-slate-300">
                    <div className="bg-slate-900/70 p-2.5 rounded-lg border border-slate-800">
                      <strong className="text-emerald-300 block mb-0.5">100% Fee Credited</strong>
                      Credited against final invoice on qualifying bulk POs (≥1,000 pcs jute / ≥300 pcs leather / ≥$3,000 value).
                    </div>
                    <div className="bg-slate-900/70 p-2.5 rounded-lg border border-slate-800">
                      <strong className="text-[#C9A86A] block mb-0.5">Zero-Tariff Waybill</strong>
                      Manifested as &quot;Mutilated Prototype – Value for Customs: $10 USD&quot; to prevent import brokerage hold-ups.
                    </div>
                    <div className="bg-slate-900/70 p-2.5 rounded-lg border border-slate-800">
                      <strong className="text-blue-300 block mb-0.5">Courier Options</strong>
                      Freight-Collect via your DHL/FedEx account, or Net Pass-Through ($38–$48 UK/EU, $42–$55 USA).
                    </div>
                  </div>
                </div>
              )}

              {/* Items in Tray Mini-Matrix */}
              <div>
                <h5 className="text-[10px] font-bold text-[#C9A86A] uppercase tracking-wider mb-2 font-heading">
                  Curated Line Items ({selectedProducts.length})
                </h5>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {selectedProducts.map((item) => (
                    <div
                      key={item.id}
                      className="group relative p-2 bg-[#0A1A2F] rounded-lg border border-slate-700/60 text-left"
                    >
                      <button
                        type="button"
                        onClick={() => onRemoveProduct(item.id)}
                        className="absolute top-1 right-1 p-1 bg-slate-800 text-slate-300 hover:text-rose-400 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove item"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      <div className="aspect-square rounded bg-slate-800 overflow-hidden mb-1.5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <p className="font-semibold text-[11px] text-white truncate font-heading">
                        {item.name}
                      </p>
                      <div className="flex items-center justify-between text-[9px] text-[#C9A86A] font-mono">
                        <span>{item.sku}</span>
                        <span>{formatPrice(item.price)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Container Logistics Summary */}
              <div className="bg-[#0A1A2F] p-3.5 rounded-xl border border-slate-700 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Volume</span>
                  <span className="text-base font-extrabold text-[#C9A86A] font-mono mt-0.5 block">
                    {logisticsSummary.totalCbm} CBM
                  </span>
                  <span className="text-[10px] text-slate-400">
                    ~{logisticsSummary.pct20ft}% of 20ft FCL
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Master Cartons</span>
                  <span className="text-base font-extrabold text-white mt-0.5 block">
                    {logisticsSummary.totalCartons} Boxes
                  </span>
                  <span className="text-[10px] text-slate-400">5-ply export double-wall</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Gross Weight</span>
                  <span className="text-base font-extrabold text-white mt-0.5 block">
                    {logisticsSummary.totalWeightKg} kg
                  </span>
                  <span className="text-[10px] text-slate-400">Air / Sea cargo</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Sample Package Cost</span>
                  <span className="text-base font-extrabold text-emerald-400 font-mono mt-0.5 block">
                    {formatPrice(logisticsSummary.totalSampleUsd)}
                  </span>
                  <span className="text-[10px] text-slate-400">DHL/FedEx express dispatch</span>
                </div>
              </div>

              {/* Consignee Dossier Fields */}
              <div className="pt-2 border-t border-slate-800 space-y-3">
                <h5 className="text-[10px] font-bold text-[#C9A86A] uppercase tracking-wider flex items-center space-x-1.5 font-heading">
                  <Globe className="h-3.5 w-3.5 text-[#C9A86A]" />
                  <span>Buyer Consignee & IncoTerm Port Routing</span>
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                      Company / Retail Entity
                    </label>
                    <input
                      type="text"
                      value={consignee.companyName}
                      onChange={(e) =>
                        setConsignee({ ...consignee, companyName: e.target.value })
                      }
                      className="w-full px-3 py-1.5 bg-[#0A1A2F] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-[#C9A86A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                      Sourcing Officer / Contact
                    </label>
                    <input
                      type="text"
                      value={consignee.contactName}
                      onChange={(e) =>
                        setConsignee({ ...consignee, contactName: e.target.value })
                      }
                      className="w-full px-3 py-1.5 bg-[#0A1A2F] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-[#C9A86A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                      Corporate Work Email
                    </label>
                    <input
                      type="email"
                      value={consignee.contactEmail}
                      onChange={(e) =>
                        setConsignee({ ...consignee, contactEmail: e.target.value })
                      }
                      className="w-full px-3 py-1.5 bg-[#0A1A2F] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-[#C9A86A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                      Preferred IncoTerm
                    </label>
                    <select
                      value={consignee.incoTerm}
                      onChange={(e) =>
                        setConsignee({ ...consignee, incoTerm: e.target.value })
                      }
                      className="w-full px-3 py-1.5 bg-[#0A1A2F] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-[#C9A86A]"
                    >
                      <option value="FOB Chittagong Sea Port">FOB Chittagong Sea Port (Default)</option>
                      <option value="DAC Dhaka Air Cargo">DAC Dhaka Hazrat Shahjalal Airport (Air Freight)</option>
                      <option value="CIF Felixstowe (UK)">CIF Felixstowe / Southampton (UK)</option>
                      <option value="CIF Rotterdam (EU)">CIF Rotterdam / Hamburg (EU)</option>
                      <option value="CIF Los Angeles (USA)">CIF Los Angeles / Long Beach (USA)</option>
                      <option value="CIF Sydney (Australia)">CIF Sydney / Melbourne (Australia)</option>
                      <option value="DDP Buyer Warehouse">DDP (Turnkey Delivered Duty Paid to Warehouse)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                      Destination Port Routing
                    </label>
                    <input
                      type="text"
                      value={consignee.targetPort || ''}
                      onChange={(e) =>
                        setConsignee({ ...consignee, targetPort: e.target.value })
                      }
                      placeholder="e.g. Felixstowe Port / Rotterdam Port"
                      className="w-full px-3 py-1.5 bg-[#0A1A2F] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-[#C9A86A]"
                    />
                  </div>

                  {activeMode === 'sample' ? (
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                        Courier Account # (DHL / FedEx / UPS)
                      </label>
                      <input
                        type="text"
                        value={consignee.courierAccount || ''}
                        onChange={(e) =>
                          setConsignee({ ...consignee, courierAccount: e.target.value })
                        }
                        placeholder="DHL #123456789 or ArielMC Prepaid"
                        className="w-full px-3 py-1.5 bg-[#0A1A2F] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-[#C9A86A]"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                        Target Market / Distribution Territory
                      </label>
                      <input
                        type="text"
                        value={consignee.targetMarket}
                        onChange={(e) =>
                          setConsignee({ ...consignee, targetMarket: e.target.value })
                        }
                        className="w-full px-3 py-1.5 bg-[#0A1A2F] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-[#C9A86A]"
                      />
                    </div>
                  )}

                  <div className="sm:col-span-2 md:col-span-3">
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                      {activeMode === 'sample'
                        ? 'Physical Delivery Address for Courier Dispatch'
                        : 'Packaging, Private Label & Compliance Instructions'}
                    </label>
                    <input
                      type="text"
                      value={
                        activeMode === 'sample'
                          ? consignee.deliveryAddress || ''
                          : consignee.notes || ''
                      }
                      onChange={(e) => {
                        if (activeMode === 'sample') {
                          setConsignee({ ...consignee, deliveryAddress: e.target.value });
                        } else {
                          setConsignee({ ...consignee, notes: e.target.value });
                        }
                      }}
                      className="w-full px-3 py-1.5 bg-[#0A1A2F] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-[#C9A86A]"
                    />
                  </div>
                </div>

                {/* Submit Action for Sample / RFQ */}
                {activeMode !== 'linesheet' && (
                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      disabled={isExporting}
                      onClick={() =>
                        handleCourierSampleOrRfq(
                          activeMode === 'sample' ? 'sample_dispatch' : 'rfq_quote'
                        )
                      }
                      className="px-6 py-2.5 bg-[#C9A86A] hover:bg-[#b69557] text-[#0A1A2F] font-bold text-xs uppercase tracking-wider rounded-lg shadow-md transition-all flex items-center space-x-2 disabled:opacity-50"
                    >
                      {isExporting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-[#0A1A2F]" />
                          <span>Transmitting...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          <span>
                            {activeMode === 'sample'
                              ? 'Submit Courier Sample Request (7-10d)'
                              : 'Submit Formal Enterprise RFQ'}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
