'use client';

import React from 'react';
import { Search, SlidersHorizontal, BookOpen } from 'lucide-react';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCount: number;
  totalCount: number;
  onToggleMobileFilter: () => void;
}

export default function Navbar({
  searchQuery,
  onSearchChange,
  selectedCount,
  totalCount,
  onToggleMobileFilter,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#0A1A2F]/10 bg-white/95 backdrop-blur-md transition-all shadow-xs">
      {/* Top Corporate Dispatch Microbar */}
      <div className="bg-[#0A1A2F] text-white py-1 px-4 text-[10px] tracking-wider uppercase font-semibold border-b border-[#C9A86A]/30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-[#C9A86A]">Crafted in Bangladesh. Curated by ArielMC. Delivered Worldwide.</span>
          </div>
          <div className="hidden md:flex items-center space-x-4 text-slate-300">
            <span>The Master Export Compendium • 2026/2027</span>
            <span>|</span>
            <span className="text-[#C9A86A]">LWG • GOTS • BSCI • LFGB</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* ArielMC Official Brand Logo & Identity */}
          <div className="flex items-center space-x-3 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/logo.png"
              alt="ArielMC Logo"
              className="h-12 w-auto object-contain"
            />
            <div className="hidden lg:block pl-2 border-l border-slate-200">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#0A1A2F] block">
                Ariel Marketing & Communications Limited
              </span>
              <span className="text-[9px] uppercase tracking-wider text-[#C9A86A] font-semibold block">
                Global Sourcing • Export Management • Private Label
              </span>
            </div>
          </div>

          {/* Primary High-Visibility Search Bar */}
          <div className="flex-1 max-w-2xl mx-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="h-4 w-4 text-[#0A1A2F]" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search master catalog by SKU, tech-pack code, materials, or product name..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#F8F6F2] border border-[#0A1A2F]/15 rounded-lg text-sm text-[#0A1A2F] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0A1A2F] focus:bg-white transition-all shadow-inner"
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

          {/* Header Controls & Selection Status */}
          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={onToggleMobileFilter}
              className="lg:hidden flex items-center space-x-2 px-3 py-2 border border-[#0A1A2F]/20 rounded-lg text-xs font-semibold text-[#0A1A2F] hover:bg-slate-50"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Filters</span>
            </button>

            <div className="hidden sm:flex items-center space-x-2 px-3.5 py-1.5 bg-[#0A1A2F]/5 rounded-full border border-[#0A1A2F]/10 text-xs font-medium text-[#0A1A2F]">
              <BookOpen className="h-3.5 w-3.5 text-[#C9A86A]" />
              <span>
                Catalog: <strong className="text-[#0A1A2F]">{totalCount}</strong> items
              </span>
              {selectedCount > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0A1A2F] text-[#C9A86A] ml-1">
                  {selectedCount} selected
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
