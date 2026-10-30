'use client';

import React, { useState } from 'react';
import { Product, ExportConsigneeInfo } from '@/types/product';
import { FileDown, Trash2, X, ChevronUp, ChevronDown, Loader2, Building2, Anchor } from 'lucide-react';

interface ExportTrayProps {
  selectedProducts: Product[];
  onRemoveProduct: (productId: string) => void;
  onClearAll: () => void;
}

export default function ExportTray({
  selectedProducts,
  onRemoveProduct,
  onClearAll,
}: ExportTrayProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const [consignee, setConsignee] = useState<ExportConsigneeInfo>({
    companyName: 'Nordic Heritage Goods Ltd',
    contactName: 'Alexander Lind',
    contactEmail: 'a.lind@nordicheritage.com',
    targetMarket: 'European Union',
    targetPort: 'Rotterdam Port (CIF Terms)',
    notes: 'Require DAE Phytosanitary and Fumigation clearance certificates with consignment.',
  });

  if (selectedProducts.length === 0) {
    return null;
  }

  const handleGeneratePdf = async () => {
    setIsExporting(true);
    setExportError(null);

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
          documentTitle: 'ArielMC Master Sourcing Line Sheet — 2026/2027',
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
      const sanitizedCompany = consignee.companyName.replace(/[^a-zA-Z0-9]/g, '_') || 'ArielMC_Catalog';
      link.download = `ArielMC_${sanitizedCompany}_LineSheet_${new Date().toISOString().slice(0, 10)}.pdf`;
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

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 pointer-events-none">
      <div className="max-w-5xl mx-auto pointer-events-auto">
        <div className="bg-[#0A1A2F] text-white rounded-2xl shadow-2xl border border-[#C9A86A]/40 overflow-hidden transition-all duration-300">
          {/* Main Action Bar */}
          <div className="p-4 sm:px-6 flex items-center justify-between gap-4">
            {/* Left: Summary */}
            <div className="flex items-center space-x-4 min-w-0">
              <div className="h-10 w-10 rounded-xl bg-[#C9A86A] text-[#0A1A2F] flex items-center justify-center font-bold text-sm shrink-0 shadow-sm font-heading">
                {selectedProducts.length}
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-2">
                  <h4 className="font-bold text-sm text-white truncate font-heading uppercase tracking-wide">
                    ArielMC Export Tray Active
                  </h4>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#C9A86A]/20 text-[#C9A86A] rounded border border-[#C9A86A]/30 hidden sm:inline-block">
                    A4 Printable Line Sheet
                  </span>
                </div>
                <p className="text-xs text-slate-300 truncate">
                  {selectedProducts.map((p) => p.name).join(', ')}
                </p>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-lg flex items-center space-x-1 transition-colors border border-slate-700"
              >
                <span>Consignee Details</span>
                {isExpanded ? (
                  <ChevronDown className="h-3.5 w-3.5" />
                ) : (
                  <ChevronUp className="h-3.5 w-3.5" />
                )}
              </button>

              <button
                type="button"
                onClick={onClearAll}
                className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                title="Clear tray"
              >
                <Trash2 className="h-4 w-4" />
              </button>

              <button
                type="button"
                disabled={isExporting}
                onClick={handleGeneratePdf}
                className="px-5 py-2.5 bg-[#C9A86A] hover:bg-[#b69557] text-[#0A1A2F] font-bold text-xs uppercase tracking-wider rounded-lg shadow-md transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed font-heading"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-[#0A1A2F]" />
                    <span>Compiling Line Sheet...</span>
                  </>
                ) : (
                  <>
                    <FileDown className="h-4 w-4 stroke-[2.5]" />
                    <span>Generate PDF Catalog</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {exportError && (
            <div className="px-6 py-2 bg-rose-900/60 border-t border-rose-800 text-rose-200 text-xs flex items-center justify-between">
              <span>{exportError}</span>
              <button onClick={() => setExportError(null)} className="hover:text-white">
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* Expanded Consignee & Details Drawer */}
          {isExpanded && (
            <div className="border-t border-[#C9A86A]/20 bg-[#060f1c] p-5 space-y-4 max-h-[60vh] overflow-y-auto">
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
                      <p className="font-mono text-[9px] text-[#C9A86A]">
                        {item.sku}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Consignee Dossier Fields */}
              <div className="pt-3 border-t border-slate-800">
                <h5 className="text-[10px] font-bold text-[#C9A86A] uppercase tracking-wider mb-3 flex items-center space-x-1.5 font-heading">
                  <Building2 className="h-3.5 w-3.5 text-[#C9A86A]" />
                  <span>Buyer Consignee & International Port Allocation</span>
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                      Consignee / Entity Name
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
                      Procurement Officer / Contact
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
                      Destination Port Routing
                    </label>
                    <div className="relative">
                      <select
                        value={consignee.targetPort}
                        onChange={(e) =>
                          setConsignee({ ...consignee, targetPort: e.target.value })
                        }
                        className="w-full px-3 py-1.5 bg-[#0A1A2F] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-[#C9A86A]"
                      >
                        <option value="Rotterdam Port (CIF Terms)">EU — Rotterdam / Hamburg Port</option>
                        <option value="Felixstowe Port (CIF Terms)">UK — Felixstowe / Southampton</option>
                        <option value="Los Angeles Port (CIF Terms)">US — Los Angeles / Long Beach</option>
                        <option value="New York / Newark (CIF Terms)">US — New York / Newark Gateway</option>
                        <option value="Sydney Port (CIF Terms)">AU — Sydney / Melbourne Hub</option>
                        <option value="Chittagong Port (FOB Terms)">Chittagong Port (FOB Bangladesh)</option>
                      </select>
                    </div>
                  </div>

                  <div className="sm:col-span-2 md:col-span-3">
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                      Custom Packaging & Certification Instructions
                    </label>
                    <input
                      type="text"
                      value={consignee.notes || ''}
                      onChange={(e) =>
                        setConsignee({ ...consignee, notes: e.target.value })
                      }
                      className="w-full px-3 py-1.5 bg-[#0A1A2F] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-[#C9A86A]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
