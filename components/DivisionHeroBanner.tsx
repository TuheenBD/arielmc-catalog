'use client';

import React from 'react';
import Link from 'next/link';
import { ProductCategory } from '@/types/product';
import { Download, X, ExternalLink, CheckCircle2, Ship } from 'lucide-react';

interface DivisionHeroBannerProps {
  category: ProductCategory;
  productCount: number;
  onClearCategoryFilter: () => void;
}

interface DivisionData {
  number: string;
  officialTitle: string;
  themeTitle: string;
  subtitle: string;
  narrative: string;
  badges: string[];
  imageUrl: string;
  gradient: string;
  accentColor: string;
  catalogDownloadId: string;
  websitePageUrl: string;
  consolidationPartners: string;
}

const DIVISION_DATA: Record<ProductCategory, DivisionData> = {
  Leather: {
    number: '01',
    officialTitle: 'The Leather Compendium',
    themeTitle: 'Master Artistry in Full-Grain Cowhide & Artisan SLGs',
    subtitle: 'Full-Grain Leather Goods for Everyday Transit, Tech & Executive Carry',
    narrative:
      'Engineered to international export standards. Sourced from certified LWG tanneries with zero wastewater discharge protocols, vegetable tannins, and non-toxic edge chemistry. Includes complete FOB Chittagong / Dhaka Air Cargo pricing tiers, tooling matrices, carton packing CBMs, and turnkey OEM/ODM customization protocols.',
    badges: ['LWG Gold Audited', 'Chromium-VI Free', 'REACH SVHC', 'BSCI Certified', 'UK DCTS 0% Duty'],
    imageUrl: '/products/leather-compendium.jpg',
    gradient: 'from-[#0A1A2F] via-[#10243E] to-[#1A385C]',
    accentColor: '#C9A86A',
    catalogDownloadId: 'AMC-PUB-LEA-2026',
    websitePageUrl: 'https://www.arielmc.com/leather-index.html',
    consolidationPartners: 'Jute Totes, Stoneware Ceramics & Organic Linens',
  },
  Jute: {
    number: '02',
    officialTitle: 'The Golden Fiber Edit',
    themeTitle: 'Contemporary Utility in 100% Natural River Jute',
    subtitle: 'Contemporary Utility in Natural Jute: Lifestyle Bags, Living Décor & Sustainable Packaging',
    narrative:
      'Curated export portfolio harnessing Bangladesh’s generational golden fiber. 100% biodegradable and carbon-negative river jute fiber crafted into heavyweight commuter totes, twisted nautical rope handles, and food-grade laminated packaging. Sedex SMETA and BSCI audited partner facilities with living wage dignity.',
    badges: ['100% Biodegradable', 'Carbon Negative', 'Food-Grade Lamination', 'BSCI Audited', 'EU GSP 0% Tariff'],
    imageUrl: '/products/The_Golden_Fiber_Edit.jpeg',
    gradient: 'from-[#14291F] via-[#1B3629] to-[#254A39]',
    accentColor: '#86EFAC',
    catalogDownloadId: 'AMC-PUB-JUT-2026',
    websitePageUrl: 'https://www.arielmc.com/jute-index.html',
    consolidationPartners: 'Fine Leather SLGs, Dinnerware Ceramics & Terracotta Planters',
  },
  Ceramics: {
    number: '03',
    officialTitle: 'The Ceramic Index',
    themeTitle: 'Export-Grade Fine Stoneware, Porcelain & Studio Ceramics',
    subtitle: 'Export-Grade Fine Stoneware, Porcelain & Studio Ceramics: Contemporary Tableware, Hospitality Dinnerware & Living Décor',
    narrative:
      'Engineered with 1280°C high-fire vitrified stoneware and bone china. Non-toxic, lead and cadmium-free artisanal reactive glazes tested to international food-contact safety standards (LFGB & FDA). Fired in computer-controlled tunnel kilns for hospitality thermal shock durability and commercial dishwashing cycles.',
    badges: ['LFGB & FDA Certified Safe', 'Lead & Cadmium 0.0 ppm', '1280°C Vitrified Stoneware', 'Microwave & Dishwasher Safe', 'UK DCTS 0% Duty'],
    imageUrl: '/products/The_Ceramic_Index.jpeg',
    gradient: 'from-[#1B2233] via-[#242E45] to-[#2F3C59]',
    accentColor: '#93C5FD',
    catalogDownloadId: 'AMC-PUB-CER-2026',
    websitePageUrl: 'https://www.arielmc.com/ceramic-index.html',
    consolidationPartners: 'Jute Table Runners, Handcrafted Leather Accessories & Woven Linens',
  },
  Textiles: {
    number: '04',
    officialTitle: 'Thread & Weave',
    themeTitle: 'Ethical RMG, Luxury Bedding & Institutional Linens',
    subtitle: 'Ethical RMG, Luxury Bedding & Institutional Hospital Linens',
    narrative:
      'Precision cut-and-sew apparel, combed organic cotton knitwear, linen-blend camp shirts, and luxury 300TC sateen hotel bedding. Manufactured in LEED Platinum & Gold compliant green garment factories. Certified to OEKO-TEX Standard 100 and GOTS organic standards with complete supply chain transparency.',
    badges: ['GOTS Organic Certified', 'OEKO-TEX Standard 100', 'SEDEX / BSCI Audited', '100% Living Wage Dignity', 'EU GSP 0% Duty'],
    imageUrl: '/products/Thread_&_Weave.jpeg',
    gradient: 'from-[#261E33] via-[#332945] to-[#423559]',
    accentColor: '#D8B4FE',
    catalogDownloadId: 'AMC-PUB-TEX-2026',
    websitePageUrl: 'https://www.arielmc.com/textile-index.html',
    consolidationPartners: 'Jute Bags, Leather Travel Goods & Studio Ceramics',
  },
  Pottery: {
    number: '05',
    officialTitle: 'Earth & Form',
    themeTitle: 'Centuries-Old Bengal Clay Traditions & Terracotta',
    subtitle: 'Centuries-Old Bengal Clay Traditions: Architectural Terracotta, Planters & Artisan Pottery',
    narrative:
      'Centuries of Bengal delta clay craftsmanship brought into modern architectural, botanical, and living spaces. High-porosity terracotta planters fostering healthy root respiration, hand-carved relief wall plates, and authentic Dhamrai artisanal pottery wood-fired in traditional brick kilns.',
    badges: ['100% Natural River Clay', 'Wood-Fired Kiln Firing', 'Dhamrai Heritage Craft', 'Porous Root Respiration', 'Zero Synthetic Additives'],
    imageUrl: '/products/Earth_&_Form.jpeg',
    gradient: 'from-[#2F1D17] via-[#3E261E] to-[#523328]',
    accentColor: '#FDBA74',
    catalogDownloadId: 'AMC-PUB-POT-2026',
    websitePageUrl: 'https://www.arielmc.com/terracotta-index.html',
    consolidationPartners: 'Natural Jute Living Décor & Heavy Ceramic Tableware',
  },
};

export default function DivisionHeroBanner({
  category,
  productCount,
  onClearCategoryFilter,
}: DivisionHeroBannerProps) {
  const data = DIVISION_DATA[category];
  if (!data) return null;

  return (
    <div
      className={`relative rounded-3xl overflow-hidden bg-gradient-to-br ${data.gradient} text-white shadow-xl border border-white/10 mb-6 transition-all`}
    >
      {/* Background Graphic Watermark */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-15 mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: `url(${data.imageUrl})` }}
      />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#C9A86A]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
        {/* Top Control Bar: Active Division Pill + Clear Filter */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-[#C9A86A] animate-pulse" />
            <span className="text-[#C9A86A]">{data.number}</span>
            <span className="text-white/40">|</span>
            <span className="text-white font-mono tracking-wider">Active Division Focus</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClearCategoryFilter}
              className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-xs font-semibold transition-all border border-white/15 cursor-pointer"
              title="Show all 5 export divisions"
            >
              <X className="h-3 w-3" />
              <span>Show All Compendiums</span>
            </button>
          </div>
        </div>

        {/* Center: Major Division Title & Subtitle from Website */}
        <div className="space-y-3 max-w-3xl">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight uppercase font-heading leading-none">
            {data.officialTitle}
          </h1>

          <p className="text-sm sm:text-base font-semibold text-[#C9A86A] leading-snug">
            {data.subtitle}
          </p>

          <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed pt-1">
            {data.narrative}
          </p>
        </div>

        {/* Institutional Multi-Category Freight Advantage (Refinement C) */}
        <div className="inline-flex flex-wrap items-center gap-2 px-3.5 py-2 rounded-xl bg-black/30 border border-white/15 backdrop-blur-xs text-xs">
          <div className="flex items-center space-x-1.5 text-emerald-400 font-bold uppercase tracking-wider text-[11px]">
            <Ship className="h-3.5 w-3.5" />
            <span>Blended Container Eligible:</span>
          </div>
          <span className="text-slate-200">
            Combine this division with <strong className="text-white font-semibold">{data.consolidationPartners}</strong> in 1x20&#39; or 1x40&#39;HQ ocean container from Chittagong Port.
          </span>
        </div>

        {/* Bottom Strip: Authentic Accreditations & Actions */}
        <div className="pt-2 border-t border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Compliance & Standard Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {data.badges.map((badge, idx) => (
              <span
                key={idx}
                className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white/10 text-slate-200 border border-white/15 backdrop-blur-xs"
              >
                <CheckCircle2 className="h-3 w-3 text-[#C9A86A]" />
                <span>{badge}</span>
              </span>
            ))}
          </div>

          {/* Quick Line Sheet Download Link */}
          <div className="flex items-center space-x-2 shrink-0">
            <Link
              href="/downloads"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#C9A86A] hover:bg-[#dbba7a] text-[#0A1A2F] text-xs font-bold uppercase tracking-wider transition-all shadow-md"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download Line Sheet</span>
            </Link>
            <a
              href={data.websitePageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all border border-white/20"
              title="Open full institutional sector dossier on arielmc.com"
            >
              <span>Sector Dossier</span>
              <ExternalLink className="h-3 w-3 opacity-70" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
