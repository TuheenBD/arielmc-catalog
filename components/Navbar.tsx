'use client';

import React from 'react';
import { Search, SlidersHorizontal, BookOpen, ChevronDown, Globe } from 'lucide-react';
import { useCurrency } from './CurrencyContext';
import { CurrencyCode, SUPPORTED_CURRENCIES } from '@/types/product';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCount: number;
  totalCount: number;
  onToggleMobileFilter: () => void;
  onOpenSamplePolicy?: () => void;
}

export default function Navbar({
  searchQuery,
  onSearchChange,
  selectedCount,
  totalCount,
  onToggleMobileFilter,
  onOpenSamplePolicy,
}: NavbarProps) {
  const { currentCurrency, setCurrency } = useCurrency();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#0A1A2F]/10 bg-white/95 backdrop-blur-md transition-all shadow-xs">
      {/* Top Corporate Dispatch Microbar - Western Enterprise Focus */}
      <div className="bg-[#0A1A2F] text-white py-1.5 px-4 text-[10px] tracking-wider uppercase font-semibold border-b border-[#C9A86A]/30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-[#C9A86A]">
              Crafted in Bangladesh. Curated by <strong className="font-black text-white">ArielMC</strong>. Delivered Worldwide.
            </span>
            <span className="hidden lg:inline text-slate-400">|</span>
            <span className="hidden lg:inline text-slate-300">
              UK DCTS & EU GSP Duty-Free Sourcing Partner
            </span>
          </div>
          <div className="flex items-center space-x-4 text-slate-300">
            {onOpenSamplePolicy && (
              <button
                type="button"
                onClick={onOpenSamplePolicy}
                className="text-[#C9A86A] hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <span>Sample Policy SOP-B2B-SMP-2026-V1</span>
              </button>
            )}
            <span className="hidden md:inline">|</span>
            <span className="text-white font-bold hidden sm:inline">LWG • GOTS • BSCI • LFGB Certified</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-3">
          {/* ArielMC Official Brand Logo & Corporate Credentials */}
          <div className="flex items-center space-x-3 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/logo.png"
              alt="ArielMC Logo"
              className="h-11 sm:h-12 w-auto object-contain"
            />
            <div className="hidden lg:block pl-2.5 border-l border-slate-200">
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#0A1A2F] block">
                Ariel Marketing & Communications Limited • <strong className="font-black text-[#0A1A2F]">ArielMC</strong>
              </span>
              <span className="text-[9px] uppercase tracking-wider text-[#C9A86A] font-bold block">
                Western Corporate Sourcing • Export Management • Private Label
              </span>
            </div>
          </div>

          {/* Primary High-Visibility Search Bar */}
          <div className="flex-1 max-w-xl mx-1 sm:mx-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="h-4 w-4 text-[#0A1A2F]" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search by SKU, HS Code, material, or keyword..."
                className="w-full pl-10 pr-12 py-2 bg-[#F8F6F2] border border-[#0A1A2F]/15 rounded-lg text-xs sm:text-sm text-[#0A1A2F] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0A1A2F] focus:bg-white transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-[#0A1A2F]"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Western Currency Switcher & Procurement Tools */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            {/* Currency Selector Pill */}
            <div className="flex items-center bg-[#F8F6F2] border border-slate-200 rounded-lg p-0.5 text-xs">
              {(Object.keys(SUPPORTED_CURRENCIES) as CurrencyCode[]).map((code) => {
                const conf = SUPPORTED_CURRENCIES[code];
                const isActive = currentCurrency === code;
                return (
                  <button
                    key={code}
                    onClick={() => setCurrency(code)}
                    title={conf.name}
                    className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all flex items-center space-x-1 ${
                      isActive
                        ? 'bg-[#0A1A2F] text-[#C9A86A] shadow-xs'
                        : 'text-slate-600 hover:text-[#0A1A2F] hover:bg-slate-200/60'
                    }`}
                  >
                    <span>{conf.flag}</span>
                    <span>{conf.code}</span>
                  </button>
                );
              })}
            </div>

            {/* Sample Policy & SOP Button */}
            {onOpenSamplePolicy && (
              <button
                type="button"
                onClick={onOpenSamplePolicy}
                className="hidden md:flex items-center space-x-1.5 px-2.5 py-1.5 bg-[#0A1A2F]/5 hover:bg-[#0A1A2F]/10 border border-[#0A1A2F]/15 rounded-lg text-xs font-bold text-[#0A1A2F] transition-all cursor-pointer"
                title="View Official Sample Policy & SOP-B2B-SMP-2026-V1"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Sample Policy</span>
                <span className="font-mono text-[9px] px-1 py-0.5 rounded bg-[#C9A86A]/20 text-[#0A1A2F] font-extrabold">SOP</span>
              </button>
            )}

            {/* Mobile Filter Toggle */}
            <button
              onClick={onToggleMobileFilter}
              className="lg:hidden flex items-center space-x-1 px-2.5 py-1.5 border border-[#0A1A2F]/20 rounded-lg text-xs font-semibold text-[#0A1A2F] hover:bg-slate-50"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Filters</span>
            </button>

            {/* Catalog Item Counter */}
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-[#0A1A2F]/5 rounded-lg border border-[#0A1A2F]/10 text-xs font-medium text-[#0A1A2F]">
              <BookOpen className="h-3.5 w-3.5 text-[#C9A86A]" />
              <span>
                <strong className="text-[#0A1A2F]">{totalCount}</strong> items
              </span>
              {selectedCount > 0 && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#0A1A2F] text-[#C9A86A] ml-1">
                  {selectedCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
