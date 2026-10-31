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

  // Bespoke Dossier Gated Registration Modal State
  const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);
  const [dossierSuccessData, setDossierSuccessData] = useState<{ quoteNumber: string; email: string } | null>(null);

  const [consignee, setConsignee] = useState<ExportConsigneeInfo>({
    companyName: '',
    contactName: '',
    contactEmail: '',
    targetMarket: 'United Kingdom & European Union',
    targetPort: 'Felixstowe Port (UK DCTS 0% Duty)',
    incoTerm: 'FOB Chittagong Sea Port',
    courierAccount: '',
    deliveryAddress: '',
    notes: '',
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

  // Handle Bespoke Dossier Compilation & Official Email Dispatch
  const handleCompileAndDeliverDossier = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!consignee.companyName.trim() || !consignee.contactName.trim() || !consignee.contactEmail.trim()) {
      setExportError('Please enter your Company Name, Sourcing Officer Name, and Corporate Work Email.');
      return;
    }

    setIsExporting(true);
    setExportError(null);
    setSubmissionSuccess(null);

    try {
      // 1. Dispatch Formal Registration & Lead Notification via Email / CRM Pipeline
      const quoteRes = await fetch('/api/quotes/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestType: 'bespoke_dossier',
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
        }),
      });

      const quoteData = await quoteRes.json().catch(() => ({}));
      const quoteNumber = quoteData.quoteNumber || `DOS-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      // 2. Compile High-Resolution Multi-Page A4 PDF Dossier
      const pdfResponse = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          consignee,
          products: selectedProducts,
          generatedAt: new Date().toISOString(),
          documentTitle: `ArielMC Bespoke Executive Sourcing Dossier — ${consignee.companyName}`,
          selectedCurrency: currentCurrency,
          currencyRate: currencyConfig.rateFromUsd,
          currencySymbol: currencyConfig.symbol,
          incoTerm: consignee.incoTerm,
          totalEstimatedCbm: logisticsSummary.totalCbm,
          totalEstimatedWeightKg: logisticsSummary.totalWeightKg,
          totalEstimatedCartons: logisticsSummary.totalCartons,
        }),
      });

      if (!pdfResponse.ok) {
        const errorData = await pdfResponse.json().catch(() => ({}));
        throw new Error(errorData.error || 'Server failed to compile catalog PDF.');
      }

      // 3. Initiate Immediate Browser Download for Registered Buyer
      const blob = await pdfResponse.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const sanitizedCompany = consignee.companyName.replace(/[^a-zA-Z0-9]/g, '_') || 'Corporate';
      link.download = `ArielMC_Bespoke_Dossier_${sanitizedCompany}_${currentCurrency}_${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      // 4. Update Success State
      setDossierSuccessData({
        quoteNumber,
        email: consignee.contactEmail,
      });

      setSubmissionSuccess(
        `Bespoke Sourcing Dossier Dispatched! Tracking Reference: ${quoteNumber}. An official copy was dispatched to ${consignee.contactEmail} and logged with our Export Desk.`
      );
    } catch (err: unknown) {
      console.error('PDF Generation Failure:', err);
      setExportError(err instanceof Error ? err.message : 'Failed to compile bespoke dossier PDF.');
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

              {/* Bespoke Dossier Action */}
              <button
                type="button"
                disabled={isExporting}
                onClick={() => {
                  setDossierSuccessData(null);
                  setIsDossierModalOpen(true);
                }}
                className="px-4 py-2 bg-[#C9A86A] hover:bg-[#b69557] text-[#0A1A2F] font-bold text-xs uppercase tracking-wider rounded-lg shadow-md transition-all flex items-center space-x-2 disabled:opacity-50 font-heading cursor-pointer"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-[#0A1A2F]" />
                    <span>Compiling...</span>
                  </>
                ) : (
                  <>
                    <FileDown className="h-3.5 w-3.5 stroke-[2.5]" />
                    <span>Request Bespoke Dossier ({currencyConfig.symbol})</span>
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
                  onClick={() => {
                    setActiveMode('linesheet');
                    setIsDossierModalOpen(true);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    activeMode === 'linesheet'
                      ? 'bg-[#C9A86A] text-[#0A1A2F]'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Bespoke Sourcing Dossier (PDF)
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

                {/* Submit Action for Dossier / Sample / RFQ */}
                <div className="pt-2 flex justify-end">
                  {activeMode === 'linesheet' ? (
                    <button
                      type="button"
                      disabled={isExporting}
                      onClick={() => {
                        setDossierSuccessData(null);
                        setIsDossierModalOpen(true);
                      }}
                      className="px-6 py-2.5 bg-[#C9A86A] hover:bg-[#b69557] text-[#0A1A2F] font-bold text-xs uppercase tracking-wider rounded-lg shadow-md transition-all flex items-center space-x-2 disabled:opacity-50 cursor-pointer font-heading"
                    >
                      <FileDown className="h-4 w-4" />
                      <span>Compile & Deliver Bespoke Dossier (A4 PDF)</span>
                    </button>
                  ) : (
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
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ==============================================================
          BESPOKE DOSSIER GATED REGISTRATION MODAL
          Enforces Company Registration before dossier dispatch per user rule
          ============================================================== */}
      {isDossierModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#0A1A2F] border-2 border-[#C9A86A] rounded-2xl max-w-2xl w-full p-6 text-white shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                setIsDossierModalOpen(false);
                setDossierSuccessData(null);
              }}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {dossierSuccessData ? (
              /* Success Confirmation View */
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-950/80 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto shadow-lg">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div className="inline-block px-3 py-1 bg-[#C9A86A]/20 border border-[#C9A86A] text-[#C9A86A] rounded-full text-xs font-bold font-mono tracking-wider">
                  OFFICIAL DOSSIER ISSUED
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight font-heading">
                  Bespoke Sourcing Dossier Dispatched!
                </h3>
                <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-4 max-w-md mx-auto text-left space-y-2 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <span className="text-slate-400">Dossier Tracking ID:</span>
                    <strong className="text-[#C9A86A] font-mono text-sm">{dossierSuccessData.quoteNumber}</strong>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <span className="text-slate-400">Delivered to Email:</span>
                    <strong className="text-white font-mono">{dossierSuccessData.email}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Export Desk:</span>
                    <strong className="text-emerald-400">ArielMC Global Sourcing (Dhaka HQ)</strong>
                  </div>
                </div>
                <p className="text-xs text-slate-300 max-w-lg mx-auto leading-relaxed">
                  Your customized multi-page A4 Sourcing Dossier has been compiled and dispatched to your corporate email. A direct high-resolution PDF copy has also been initiated in your browser download manager.
                </p>
                <div className="pt-2 flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDossierModalOpen(false);
                      setDossierSuccessData(null);
                    }}
                    className="px-6 py-2.5 bg-[#C9A86A] hover:bg-[#b69557] text-[#0A1A2F] font-bold text-xs uppercase tracking-wider rounded-lg shadow-md transition-all cursor-pointer font-heading"
                  >
                    Done & Return to Catalog
                  </button>
                </div>
              </div>
            ) : (
              /* Registration & Request Form */
              <form onSubmit={handleCompileAndDeliverDossier} className="space-y-4">
                <div className="flex items-center space-x-2 text-[#C9A86A] text-xs font-bold uppercase tracking-widest font-mono">
                  <span className="w-2 h-2 rounded-full bg-[#C9A86A]" />
                  <span>Confidential Executive Procurement Protocol</span>
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight font-heading">
                    Request Bespoke Sourcing Dossier (PDF)
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Customized A4 Tech-Pack Compendium with factory dimensions, container CBM volumetrics, and 4-tier volume FOB pricing.
                  </p>
                </div>

                {/* Gated Policy Notice */}
                <div className="bg-slate-900/90 border border-[#C9A86A]/40 rounded-xl p-3.5 text-xs text-slate-300 space-y-1">
                  <div className="flex items-center space-x-1.5 text-[#C9A86A] font-bold text-[11px] uppercase tracking-wide">
                    <Building2 className="h-3.5 w-3.5" />
                    <span>Official Corporate Registration Required</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    To safeguard proprietary factory tooling, export master molds, and volume pricing matrices, bespoke dossiers are compiled on-demand and delivered directly to verified corporate email addresses. An official tracking reference (e.g. <span className="text-[#C9A86A] font-mono font-bold">DOS-2026-XXXX</span>) is registered with our Global Sourcing Desk in Dhaka.
                  </p>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-left">
                  <div className="sm:col-span-2">
                    <label htmlFor="dossier-company" className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                      Company / Organization Name <span className="text-[#C9A86A]">*</span>
                    </label>
                    <input
                      id="dossier-company"
                      type="text"
                      required
                      placeholder="e.g. Nordic Heritage Goods Ltd / Harrods London"
                      value={consignee.companyName}
                      onChange={(e) => setConsignee({ ...consignee, companyName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#C9A86A]"
                    />
                  </div>

                  <div>
                    <label htmlFor="dossier-name" className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                      Sourcing Officer Full Name & Title <span className="text-[#C9A86A]">*</span>
                    </label>
                    <input
                      id="dossier-name"
                      type="text"
                      required
                      placeholder="e.g. Alexander Lind, Head of Buying"
                      value={consignee.contactName}
                      onChange={(e) => setConsignee({ ...consignee, contactName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#C9A86A]"
                    />
                  </div>

                  <div>
                    <label htmlFor="dossier-email" className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                      Corporate Work Email <span className="text-[#C9A86A]">*</span>
                    </label>
                    <input
                      id="dossier-email"
                      type="email"
                      required
                      placeholder="e.g. a.lind@nordicheritage.com"
                      value={consignee.contactEmail}
                      onChange={(e) => setConsignee({ ...consignee, contactEmail: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#C9A86A]"
                    />
                  </div>

                  <div>
                    <label htmlFor="dossier-port" className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                      Destination Sea Port / Country <span className="text-[#C9A86A]">*</span>
                    </label>
                    <input
                      id="dossier-port"
                      type="text"
                      required
                      placeholder="e.g. Felixstowe Port (UK DCTS 0% Duty)"
                      value={consignee.targetPort || consignee.targetMarket}
                      onChange={(e) =>
                        setConsignee({ ...consignee, targetPort: e.target.value, targetMarket: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#C9A86A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                      Commercial IncoTerm Preference
                    </label>
                    <select
                      value={consignee.incoTerm}
                      onChange={(e) => setConsignee({ ...consignee, incoTerm: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-[#C9A86A]"
                    >
                      <option value="FOB Chittagong Sea Port">FOB Chittagong Sea Port (Standard)</option>
                      <option value="DAC Dhaka Air Cargo">DAC Dhaka Airport (Express Air Freight)</option>
                      <option value="CIF Felixstowe / Southampton (UK)">CIF Felixstowe / Southampton (UK)</option>
                      <option value="CIF Rotterdam / Hamburg (EU)">CIF Rotterdam / Hamburg (EU)</option>
                      <option value="CIF Los Angeles / Long Beach (USA)">CIF Los Angeles / Long Beach (USA)</option>
                      <option value="DDP Delivered to Buyer Warehouse">DDP (Turnkey Delivery to Warehouse)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                      Specific OEM/ODM Packaging, Embossing or Timeline Notes (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Custom foil debossing, target delivery Q3 2026, Phytosanitary cert needed"
                      value={consignee.notes || ''}
                      onChange={(e) => setConsignee({ ...consignee, notes: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#C9A86A]"
                    />
                  </div>
                </div>

                {/* Selected Products Footprint */}
                <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 flex items-center justify-between text-xs text-slate-300">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-md bg-[#C9A86A] text-[#0A1A2F] flex items-center justify-center font-black text-xs font-heading">
                      {selectedProducts.length}
                    </span>
                    <span>Selected Products ({logisticsSummary.totalCbm} CBM • {logisticsSummary.totalCartons} Boxes)</span>
                  </div>
                  <span className="text-[#C9A86A] font-mono font-bold">
                    Curated Portfolio ({currentCurrency})
                  </span>
                </div>

                {/* Error Banner inside modal */}
                {exportError && (
                  <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-200 text-xs rounded-lg">
                    {exportError}
                  </div>
                )}

                {/* Submit Button */}
                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsDossierModalOpen(false)}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isExporting}
                    className="px-6 py-2.5 bg-[#C9A86A] hover:bg-[#b69557] text-[#0A1A2F] font-black text-xs uppercase tracking-wider rounded-lg shadow-md transition-all flex items-center space-x-2 disabled:opacity-50 cursor-pointer font-heading"
                  >
                    {isExporting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-[#0A1A2F]" />
                        <span>Compiling & Delivering Dossier...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Register & Deliver Dossier via Email</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
