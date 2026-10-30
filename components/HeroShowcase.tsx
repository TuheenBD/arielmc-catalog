'use client';

import React from 'react';
import { ProductCategory } from '@/types/product';
import { Check, ShieldCheck, Sparkles } from 'lucide-react';

interface HeroShowcaseProps {
  selectedCategories: ProductCategory[];
  onSelectCategory: (category: ProductCategory) => void;
  categoryCounts: Record<ProductCategory, number>;
}

interface HeroPillar {
  id: ProductCategory;
  num: string;
  title: string;
  shortTitle: string;
  imageUrl: string;
}

const HERO_PILLARS: HeroPillar[] = [
  {
    id: 'Leather',
    num: '01',
    title: 'The Leather Compendium',
    shortTitle: 'Leather Compendium',
    imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'Jute',
    num: '02',
    title: 'The Golden Fiber Edit',
    shortTitle: 'Golden Fiber Edit',
    imageUrl: '/products/The_Golden_Fiber_Edit.jpeg',
  },
  {
    id: 'Ceramics',
    num: '03',
    title: 'The Ceramic Index',
    shortTitle: 'Ceramic Index',
    imageUrl: '/products/The_Ceramic_Index.jpeg',
  },
  {
    id: 'Textiles',
    num: '04',
    title: 'Thread & Weave',
    shortTitle: 'Thread & Weave',
    imageUrl: '/products/Thread_&_Weave.jpeg',
  },
  {
    id: 'Pottery',
    num: '05',
    title: 'Earth & Form',
    shortTitle: 'Earth & Form',
    imageUrl: '/products/Earth_&_Form.jpeg',
  },
];

const CERTIFICATION_LOGOS = [
  {
    name: 'LWG Audited',
    src: '/certifications/lwg-audited.png',
    alt: 'LWG Leather Working Group Audited',
  },
  {
    name: 'GOTS Organic',
    src: '/certifications/gots-organic.png',
    alt: 'Global Organic Textile Standard GOTS',
  },
  {
    name: 'OEKO-TEX 100',
    src: '/certifications/OEKO-TEX.jpg',
    alt: 'OEKO-TEX Standard 100 Safe & Tested',
  },
  {
    name: 'BSCI & Sedex',
    src: '/certifications/bsci-sedex.jpg',
    alt: 'BSCI & Sedex SMETA Ethical Production',
  },
  {
    name: 'FDA & LFGB',
    src: '/certifications/fda-lfgb-safe.png',
    alt: 'FDA 21 CFR & LFGB Food Safe',
  },
];

export default function HeroShowcase({
  selectedCategories,
  onSelectCategory,
  categoryCounts,
}: HeroShowcaseProps) {
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
    <div className="w-full space-y-3.5">
      {/* Top Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#C9A86A] font-heading block">
            Our 5 Product Divisions
          </span>
          <h2 className="text-base sm:text-lg font-extrabold text-[#0A1A2F] font-heading">
            One Source. Five Strengths.
          </h2>
        </div>
        <span className="text-[11px] font-mono font-bold text-slate-500 bg-[#0A1A2F]/5 px-2.5 py-1 rounded-md border border-[#0A1A2F]/10">
          74 Export Specifications
        </span>
      </div>

      {/* 5 Hero Pillars - Minimal, Breathable, Cohesive Luxury Palette (No multi-color clash) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3">
        {HERO_PILLARS.map((pillar) => {
          const isSelected = selectedCategories.includes(pillar.id);
          const count = categoryCounts[pillar.id] || 0;

          return (
            <button
              key={pillar.id}
              type="button"
              onClick={() => handleCardClick(pillar.id)}
              className={`group text-left rounded-2xl p-2.5 sm:p-3 transition-all duration-300 flex flex-col justify-between border cursor-pointer ${
                isSelected
                  ? 'bg-[#0A1A2F] text-white border-[#C9A86A] shadow-lg ring-2 ring-[#C9A86A] scale-[1.02]'
                  : 'bg-white hover:bg-[#FAF9F6] text-[#0A1A2F] border-slate-200/90 hover:border-[#0A1A2F]/40 shadow-xs hover:shadow-md'
              }`}
            >
              {/* Pillar Header: Number + Division Title */}
              <div className="mb-2">
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`font-mono text-xs font-black ${
                      isSelected ? 'text-[#C9A86A]' : 'text-[#C9A86A]'
                    }`}
                  >
                    {pillar.num}
                  </span>
                  {isSelected ? (
                    <span className="h-4 w-4 rounded-full bg-[#C9A86A] text-[#0A1A2F] flex items-center justify-center">
                      <Check className="h-2.5 w-2.5 stroke-[3]" />
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono text-slate-400 group-hover:text-slate-600 font-semibold">
                      {count} SKUs
                    </span>
                  )}
                </div>

                <h3
                  className={`font-heading font-extrabold text-xs sm:text-[13px] leading-tight line-clamp-2 ${
                    isSelected ? 'text-white' : 'text-[#0A1A2F]'
                  }`}
                >
                  {pillar.title}
                </h3>
              </div>

              {/* Product Photograph Area with Studio Framing */}
              <div className="relative aspect-3/4 w-full rounded-xl overflow-hidden bg-slate-100 border border-black/5 mt-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={pillar.imageUrl}
                  alt={pillar.title}
                  className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Bottom Subtle Indicator */}
              <div className="mt-2 pt-1.5 border-t border-slate-100/30 flex items-center justify-between text-[10px]">
                <span
                  className={`font-medium truncate ${
                    isSelected ? 'text-[#C9A86A]' : 'text-slate-500'
                  }`}
                >
                  {isSelected ? 'Active Filter' : 'Explore'}
                </span>
                <span
                  className={`font-mono text-[9px] ${
                    isSelected ? 'text-white font-bold' : 'text-slate-400'
                  }`}
                >
                  &rarr;
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Interactive Helper Guidance Prompt */}
      <div className="flex items-center justify-between text-[11px] text-slate-600 bg-white/80 px-3.5 py-2 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-3.5 w-3.5 text-[#C9A86A] shrink-0" />
          <span>
            Click any sector card above to filter the <strong>74-item commercial roadmap</strong> instantly. Curated by <strong className="font-extrabold text-[#0A1A2F]">ArielMC</strong>.
          </span>
        </div>
        <span className="font-mono text-[10px] text-[#C9A86A] font-extrabold hidden sm:inline uppercase tracking-wider">
          1-Click Filter
        </span>
      </div>

      {/* Certified International Standards - Original High-Res Logos */}
      <div className="bg-[#FAF9F6] rounded-2xl p-3 sm:p-3.5 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center space-x-2 shrink-0">
            <ShieldCheck className="h-4 w-4 text-[#C9A86A] shrink-0" />
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0A1A2F] font-heading block">
                Certified International Standards
              </span>
              <span className="text-[10px] text-slate-500 block">
                Direct factory audits & destination compliance certificates
              </span>
            </div>
          </div>

          {/* Authentic Logo Strip */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {CERTIFICATION_LOGOS.map((cert, idx) => (
              <div
                key={idx}
                className="h-9 px-2 py-1 bg-white rounded-lg border border-slate-200 shadow-2xs flex items-center justify-center hover:border-slate-400 transition-colors"
                title={cert.alt}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cert.src}
                  alt={cert.alt}
                  className="h-full w-auto max-w-[70px] sm:max-w-[85px] object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
