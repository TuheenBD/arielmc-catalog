'use client';

import React, { useState } from 'react';
import { ProductCategory } from '@/types/product';
import { ArrowUpRight, Check, Sparkles } from 'lucide-react';

interface HeroShowcaseProps {
  selectedCategories: ProductCategory[];
  onSelectCategory: (category: ProductCategory) => void;
  categoryCounts: Record<ProductCategory, number>;
}

interface HeroSector {
  id: ProductCategory;
  num: string;
  title: string;
  subtitle: string;
  tagline: string;
  badge: string;
  color: string;
  accentBg: string;
  borderColor: string;
  textColor: string;
  imageUrl: string;
  flagshipSku: string;
  flagshipName: string;
  keySpec: string;
}

const HERO_SECTORS: HeroSector[] = [
  {
    id: 'Leather',
    num: '01',
    title: 'The Leather Compendium',
    subtitle: 'Leather Goods',
    tagline: 'Full-Grain Artisan Craftsmanship',
    badge: 'LWG Audited',
    color: '#3B2219',
    accentBg: 'bg-[#3B2219]',
    borderColor: 'border-[#3B2219]',
    textColor: 'text-[#C9A86A]',
    imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=800',
    flagshipSku: 'LD-TRV-15',
    flagshipName: 'Handcrafted Executive Leather Tote',
    keySpec: 'Chromium VI Free (< 3.0 mg/kg)',
  },
  {
    id: 'Jute',
    num: '02',
    title: 'The Golden Fiber Edit',
    subtitle: 'Golden Jute Textiles',
    tagline: '100% Biodegradable Bengal River Fiber',
    badge: 'GOTS Organic',
    color: '#B88B4A',
    accentBg: 'bg-[#B88B4A]',
    borderColor: 'border-[#B88B4A]',
    textColor: 'text-[#0A1A2F]',
    imageUrl: '/products/The_Golden_Fiber_Edit.jpeg',
    flagshipSku: 'JD-EDC-16',
    flagshipName: 'Laminated High-Capacity Market Tote',
    keySpec: 'Hydrocarbon-Free Vegetable Oil',
  },
  {
    id: 'Ceramics',
    num: '03',
    title: 'The Ceramic Index',
    subtitle: 'Fine Ceramics & Tableware',
    tagline: 'Export-Grade Bone China & Stoneware',
    badge: 'FDA / LFGB Food Safe',
    color: '#4A5568',
    accentBg: 'bg-[#4A5568]',
    borderColor: 'border-[#4A5568]',
    textColor: 'text-white',
    imageUrl: '/products/The_Ceramic_Index.jpeg',
    flagshipSku: 'CR-TBL-48',
    flagshipName: 'Architectural Matte Stoneware Set',
    keySpec: '1280°C High-Fired Non-Porous',
  },
  {
    id: 'Textiles',
    num: '04',
    title: 'Thread & Weave',
    subtitle: 'Export Apparel & Linens',
    tagline: 'Sedex/BSCI Audited Living-Wage Production',
    badge: 'OEKO-TEX 100',
    color: '#2B4C42',
    accentBg: 'bg-[#2B4C42]',
    borderColor: 'border-[#2B4C42]',
    textColor: 'text-emerald-300',
    imageUrl: '/products/Thread_&_Weave.jpeg',
    flagshipSku: 'TX-APP-32',
    flagshipName: '400 GSM Combed Heavyweight Fleece',
    keySpec: 'Pre-Shrunk Ring-Spun Cotton',
  },
  {
    id: 'Pottery',
    num: '05',
    title: 'Earth & Form',
    subtitle: 'Bengal Pottery & Terracotta',
    tagline: 'Centuries-Old Architectural Clay Heritage',
    badge: 'Hand-Thrown Terracotta',
    color: '#A04A2C',
    accentBg: 'bg-[#A04A2C]',
    borderColor: 'border-[#A04A2C]',
    textColor: 'text-amber-200',
    imageUrl: '/products/Earth_&_Form.jpeg',
    flagshipSku: 'PT-PLT-64',
    flagshipName: 'Bengal Fluted Terracotta Planter',
    keySpec: 'Frost-Resistant River Silt Clay',
  },
];

export default function HeroShowcase({
  selectedCategories,
  onSelectCategory,
  categoryCounts,
}: HeroShowcaseProps) {
  const [hoveredSector, setHoveredSector] = useState<HeroSector | null>(null);

  const scrollToMatrix = () => {
    const el = document.getElementById('sourcing-matrix');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCardClick = (cat: ProductCategory) => {
    onSelectCategory(cat);
    scrollToMatrix();
  };

  return (
    <div className="w-full space-y-6">
      {/* Upper Composite Stage for Desktop Hero Right Side */}
      <div className="relative bg-gradient-to-br from-[#0A1A2F] via-[#0d223f] to-[#0A1A2F] rounded-2xl p-4 sm:p-5 border border-[#C9A86A]/40 shadow-xl overflow-hidden">
        {/* Subtle Luxury Pattern Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#C9A86A_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

        {/* Header Bar within Hero Stage */}
        <div className="relative z-10 flex items-center justify-between pb-3 border-b border-white/10 text-xs">
          <div className="flex items-center space-x-2">
            <span className="flex h-2 w-2 rounded-full bg-[#C9A86A] animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#C9A86A] font-heading">
              5-Sector Master Showcase
            </span>
          </div>
          <span className="text-[10px] uppercase font-semibold text-slate-300">
            One Source. Five Strengths.
          </span>
        </div>

        {/* 5-Item Interactive Mosaic Deck */}
        <div className="relative z-10 mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {HERO_SECTORS.map((sector) => {
            const isSelected = selectedCategories.includes(sector.id);
            const count = categoryCounts[sector.id] || 0;

            return (
              <button
                key={sector.id}
                type="button"
                onClick={() => handleCardClick(sector.id)}
                onMouseEnter={() => setHoveredSector(sector)}
                onMouseLeave={() => setHoveredSector(null)}
                className={`group relative text-left rounded-xl overflow-hidden border transition-all duration-300 flex flex-col justify-between ${
                  isSelected
                    ? 'ring-2 ring-[#C9A86A] border-[#C9A86A] shadow-lg scale-[1.02]'
                    : 'border-white/15 hover:border-[#C9A86A]/60 bg-white/5 hover:bg-white/10'
                }`}
              >
                {/* Image Container with Aspect Ratio */}
                <div className="relative aspect-4/5 w-full overflow-hidden bg-slate-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={sector.imageUrl}
                    alt={sector.title}
                    className="h-full w-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                  />
                  {/* Gradient shade */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Top Sector Number Badge */}
                  <div className="absolute top-2 left-2 flex items-center space-x-1.5">
                    <span className="font-mono text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[#C9A86A] border border-[#C9A86A]/30">
                      {sector.num}
                    </span>
                  </div>

                  {/* Selected Tick Indicator */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 h-4 w-4 rounded-full bg-[#C9A86A] text-[#0A1A2F] flex items-center justify-center">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </div>
                  )}

                  {/* Bottom Image Micro-Label */}
                  <div className="absolute bottom-2 inset-x-2">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-white block truncate drop-shadow-md">
                      {sector.subtitle}
                    </span>
                    <span className="text-[8px] font-mono text-[#C9A86A] block">
                      {count} active styles
                    </span>
                  </div>
                </div>

                {/* Footer Micro-Pill */}
                <div className="p-1.5 bg-slate-900/90 border-t border-white/10 flex items-center justify-between text-[9px]">
                  <span className="text-slate-300 font-medium truncate">{sector.badge}</span>
                  <ArrowUpRight className="h-3 w-3 text-[#C9A86A] opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Dynamic Micro-Dossier Bar (Shows on Hover or Selected) */}
        <div className="relative z-10 mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300 min-h-[28px]">
          {hoveredSector ? (
            <div className="flex items-center space-x-2 truncate">
              <span className="font-bold text-[#C9A86A] font-heading">{hoveredSector.title}:</span>
              <span className="text-white truncate">{hoveredSector.flagshipName}</span>
              <span className="text-slate-400 font-mono hidden sm:inline">({hoveredSector.flagshipSku})</span>
              <span className="text-[#C9A86A] hidden md:inline">• {hoveredSector.keySpec}</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-slate-400 text-[10px]">
              <Sparkles className="h-3.5 w-3.5 text-[#C9A86A]" />
              <span>Click any sector card above to filter the 74-item commercial roadmap instantly.</span>
            </div>
          )}
          <span className="text-[10px] text-[#C9A86A] font-semibold hidden sm:inline shrink-0 pl-2">
            Direct Factory OEM / ODM
          </span>
        </div>
      </div>

      {/* "One Source. Five Strengths." 5-Division Interactive Cards Strip */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#0A1A2F] font-heading">
              Our 5 Manufacturing Divisions
            </h3>
            <span className="text-[10px] text-slate-500 font-medium">
              — One Source. Five Strengths.
            </span>
          </div>
          <span className="text-[10px] text-[#C9A86A] font-bold font-mono">
            74 Total Export SKUs
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {HERO_SECTORS.map((sector) => {
            const isSelected = selectedCategories.includes(sector.id);
            const count = categoryCounts[sector.id] || 0;

            return (
              <div
                key={sector.id}
                onClick={() => handleCardClick(sector.id)}
                className={`cursor-pointer rounded-xl p-3 border transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#0A1A2F] text-white border-[#C9A86A] shadow-md ring-1 ring-[#C9A86A]'
                    : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 hover:border-[#0A1A2F]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        isSelected
                          ? 'bg-[#C9A86A] text-[#0A1A2F]'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {sector.num}
                    </span>
                    <span
                      className={`text-[10px] font-bold font-mono ${
                        isSelected ? 'text-[#C9A86A]' : 'text-slate-500'
                      }`}
                    >
                      {count} Items
                    </span>
                  </div>

                  <h4
                    className={`font-bold text-xs uppercase tracking-wider font-heading leading-tight ${
                      isSelected ? 'text-white' : 'text-[#0A1A2F]'
                    }`}
                  >
                    {sector.title}
                  </h4>
                  <p
                    className={`text-[10px] mt-1 leading-snug line-clamp-2 ${
                      isSelected ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    {sector.tagline}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100/20 flex items-center justify-between text-[9px] font-bold">
                  <span className={isSelected ? 'text-[#C9A86A]' : 'text-slate-600'}>
                    {sector.badge}
                  </span>
                  <span className={isSelected ? 'text-white' : 'text-[#0A1A2F]'}>
                    {isSelected ? 'Active Filter' : 'Filter &rarr;'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
