'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MOCK_PRODUCTS } from '@/data/mockProducts';
import { Product, ProductCategory, PDFExportPayload } from '@/types/product';
import { useCurrency, CurrencyProvider } from '@/components/CurrencyContext';
import Footer from '@/components/Footer';
import SamplePolicyModal from '@/components/SamplePolicyModal';
import {
  FileText,
  Download,
  BookOpen,
  Eye,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Layers,
  ArrowLeft,
  Loader2,
  Package,
  Calendar,
  Globe,
  Award,
  Filter
} from 'lucide-react';

interface CatalogEdition {
  id: string;
  tier: 'MASTER' | 'COMPENDIUM' | 'LOOKBOOK';
  title: string;
  editionCode: string;
  category?: ProductCategory;
  skuCount: number;
  coverImage: string;
  description: string;
  highlights: string[];
  pdfFileName: string;
  targetCategoryFilter?: ProductCategory;
  targetSearchFilter?: string;
  badge: string;
  badgeBg: string;
  badgeText: string;
  accentBorder: string;
}

const CATALOG_EDITIONS: CatalogEdition[] = [
  // TIER 1: MASTER COMPENDIUM
  {
    id: 'master-compendium-2026',
    tier: 'MASTER',
    title: 'ArielMC Master Export Compendium 2026',
    editionCode: 'AMC-PUB-MST-2026',
    skuCount: 90,
    coverImage: '/images/catalogs/branded-catalogue-page1.jpg',
    description:
      'The comprehensive flagship procurement compendium encompassing all five sovereign Bangladesh manufacturing verticals. Complete technical specifications, FOB volume pricing ladders, master carton logistics, and HS customs tariff codes.',
    highlights: [
      'Complete 90 Export Specifications',
      'All 5 Manufacturing Divisions',
      'Full FOB Pricing & CBM Logistics',
      'Duty-Free UK DCTS & EU GSP Tariff Matrix',
    ],
    pdfFileName: 'ArielMC_Master_Export_Compendium_2026.pdf',
    badge: 'Official Master Compendium',
    badgeBg: 'bg-[#C9A86A]/20',
    badgeText: 'text-[#0A1A2F]',
    accentBorder: 'border-[#C9A86A]',
  },

  // TIER 2: SECTOR COMPENDIUMS (5 Sovereign Divisions)
  {
    id: 'compendium-leather',
    tier: 'COMPENDIUM',
    category: 'Leather',
    title: '01 The Leather Compendium',
    editionCode: 'AMC-PUB-LEA-2026',
    skuCount: 15,
    coverImage: '/images/catalogs/fashionable-bag-catalog-cover.jpg',
    description:
      'Full-grain artisan leather goods crafted in LWG Gold-audited tannery clusters. Everyday carry folios, RFID tech wallets, architectural day-to-night crossbody bags, commuter totes, and English bridle formal belts.',
    highlights: [
      '15 Certified Export SKUs',
      'LWG Audited & Chromium-VI Free',
      'Vegetable-Tanned Cowhide & Buff Calf',
      'FOB Chittagong / DAC Air Cargo Ready',
    ],
    pdfFileName: 'ArielMC_Leather_Compendium_2026.pdf',
    targetCategoryFilter: 'Leather',
    badge: 'Division 01 • Leather',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-900',
    accentBorder: 'border-amber-300',
  },
  {
    id: 'compendium-jute',
    tier: 'COMPENDIUM',
    category: 'Jute',
    title: '02 The Golden Fiber Edit',
    editionCode: 'AMC-PUB-JUT-2026',
    skuCount: 17,
    coverImage: '/products/The_Golden_Fiber_Edit.jpeg',
    description:
      'Contemporary utility in 100% natural river-retted golden jute fiber. Laminated high-capacity market totes, lifestyle canvas commuters, braided home storage baskets, padded laptop folios, and luxury eco-packaging.',
    highlights: [
      '17 Sustainable Export SKUs',
      'Zero-Carbon Natural Fiber',
      'Food-Safe Water-Resistant Lamination',
      'Retail & Hospitality Packaging Suites',
    ],
    pdfFileName: 'ArielMC_Golden_Fiber_Edit_2026.pdf',
    targetCategoryFilter: 'Jute',
    badge: 'Division 02 • Jute',
    badgeBg: 'bg-yellow-100',
    badgeText: 'text-yellow-900',
    accentBorder: 'border-yellow-300',
  },
  {
    id: 'compendium-ceramics',
    tier: 'COMPENDIUM',
    category: 'Ceramics',
    title: '03 The Ceramic Index',
    editionCode: 'AMC-PUB-CER-2026',
    skuCount: 29,
    coverImage: '/images/catalogs/ceramic-catalogue-cover.jpg',
    description:
      'Authentic export-grade bone china, 24K gold filigree porcelain dinner suites, and 1,280°C vitrified reactive glaze stoneware. Food-safe certified under LFGB and FDA 21 CFR 175.300 standards.',
    highlights: [
      '29 Genuine Commercial SKUs',
      '24K Gold Filigree & Vitrified Stoneware',
      'LFGB & FDA 21 CFR 175.300 Certified',
      'Lead & Cadmium Migration Tested',
    ],
    pdfFileName: 'ArielMC_Ceramic_Index_2026.pdf',
    targetCategoryFilter: 'Ceramics',
    badge: 'Division 03 • Ceramics',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-900',
    accentBorder: 'border-blue-300',
  },
  {
    id: 'compendium-textiles',
    tier: 'COMPENDIUM',
    category: 'Textiles',
    title: '04 Thread & Weave',
    editionCode: 'AMC-PUB-TEX-2026',
    skuCount: 16,
    coverImage: '/products/Thread_&_Weave.jpeg',
    description:
      'Ethical RMG, combed organic cotton circular knitwear (160–420 GSM), woven button-down shirts, 300TC–600TC hotel percale and sateen bed suites, and zero-twist spa bath terry goods.',
    highlights: [
      '16 Certified Apparel & Linen SKUs',
      'Sedex & BSCI Audited Living-Wage Mills',
      'GOTS Organic & OEKO-TEX Standard 100',
      '0% Duty UK DCTS & EU GSP Eligible',
    ],
    pdfFileName: 'ArielMC_Thread_and_Weave_2026.pdf',
    targetCategoryFilter: 'Textiles',
    badge: 'Division 04 • RMG & Linens',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-900',
    accentBorder: 'border-emerald-300',
  },
  {
    id: 'compendium-pottery',
    tier: 'COMPENDIUM',
    category: 'Pottery',
    title: '05 Earth & Form',
    editionCode: 'AMC-PUB-POT-2026',
    skuCount: 13,
    coverImage: '/products/Earth_&_Form.jpeg',
    description:
      'Centuries-old Bengal clay traditions refined for modern architectural living. Breathable cylinder planters, evaporative natural wine coolers and water carafes, sculptural amphora floor vases, and clay relief screen blocks.',
    highlights: [
      '13 Heritage Terracotta SKUs',
      'Natural Evaporative Cooling Science',
      'Wheel-Thrown & Architectural Clay',
      'Frost-Resistant Garden & Hospitality Pots',
    ],
    pdfFileName: 'ArielMC_Earth_and_Form_2026.pdf',
    targetCategoryFilter: 'Pottery',
    badge: 'Division 05 • Terracotta',
    badgeBg: 'bg-orange-100',
    badgeText: 'text-orange-900',
    accentBorder: 'border-orange-300',
  },

  // TIER 3: SPECIAL CURATED LOOKBOOKS
  {
    id: 'lookbook-vase-edit',
    tier: 'LOOKBOOK',
    title: 'The Master Vase & Planter Edit',
    editionCode: 'AMC-LKB-VAS-2026',
    skuCount: 12,
    coverImage: '/images/catalogs/vase-edit-catalog-cover.jpg',
    description:
      'A curated hospitality lookbook showcasing architectural terracotta planters, hand-thrown porcelain globe vases, and sculptural centerpiece vessels engineered for luxury hotels, interior projects, and botanical gardens.',
    highlights: [
      'Curated Architectural Vessels',
      'Terracotta & Porcelain Centerpieces',
      'Nesting Saucers & High-Capacity Urns',
      'Hospitality Contract Packaging',
    ],
    pdfFileName: 'ArielMC_Master_Vase_Planter_Edit_2026.pdf',
    targetSearchFilter: 'Vase',
    badge: 'Curated Lookbook',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-900',
    accentBorder: 'border-purple-300',
  },
  {
    id: 'lookbook-leather-totes',
    tier: 'LOOKBOOK',
    title: 'Executive Carry & Leather Tote Edit',
    editionCode: 'AMC-LKB-TOT-2026',
    skuCount: 8,
    coverImage: '/images/catalogs/fashionable-bag-catalog-cover.jpg',
    description:
      'A dedicated commercial lookbook focusing on structured carry: high-capacity commuter totes, architectural day-to-night crossbody bags, padded laptop briefcases, and travel document folios.',
    highlights: [
      'Executive Carry Focus',
      'Reinforced Drop-Tested Handles',
      'Padded Laptop Protection (13"–16")',
      'Private Label Debossing Available',
    ],
    pdfFileName: 'ArielMC_Executive_Carry_Tote_Edit_2026.pdf',
    targetSearchFilter: 'Tote',
    badge: 'Curated Lookbook',
    badgeBg: 'bg-indigo-100',
    badgeText: 'text-indigo-900',
    accentBorder: 'border-indigo-300',
  },
  {
    id: 'lookbook-royal-tableware',
    tier: 'LOOKBOOK',
    title: 'Royal Tableware & Imperial Tea Suite',
    editionCode: 'AMC-LKB-RYL-2026',
    skuCount: 10,
    coverImage: '/images/catalogs/ceramic-catalogue-cover.jpg',
    description:
      'The pinnacle of Bengal ceramics craftsmanship: Athena 24K gold filigree dinner suites, royal cobalt Neelima tea services, hand-enameled Meenakari sets, and sculpted swan-neck banquet tureens.',
    highlights: [
      'Opulent 24K Gold Filigree Details',
      'Hand-Painted Cobalt Flora Brushwork',
      'Palace & Banquet Tableware Sets',
      'Deluxe Satin-Lined Gift Packaging',
    ],
    pdfFileName: 'ArielMC_Royal_Tableware_Suite_2026.pdf',
    targetSearchFilter: 'Tea',
    badge: 'Curated Lookbook',
    badgeBg: 'bg-rose-100',
    badgeText: 'text-rose-900',
    accentBorder: 'border-rose-300',
  },
];

function DownloadCenterContent() {
  const { currentCurrency, currencyConfig } = useCurrency();
  const [activeTab, setActiveTab] = useState<'ALL' | 'MASTER' | 'COMPENDIUM' | 'LOOKBOOK'>('ALL');
  const [isSamplePolicyOpen, setIsSamplePolicyOpen] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const filteredEditions = CATALOG_EDITIONS.filter((edition) => {
    if (activeTab === 'ALL') return true;
    return edition.tier === activeTab;
  });

  const handleDownloadPdf = async (edition: CatalogEdition) => {
    setDownloadingId(edition.id);

    try {
      // Determine product subset for this catalog edition
      let targetProducts: Product[] = [];
      if (edition.tier === 'MASTER') {
        targetProducts = MOCK_PRODUCTS;
      } else if (edition.category) {
        targetProducts = MOCK_PRODUCTS.filter((p) => p.category === edition.category);
      } else if (edition.targetSearchFilter) {
        const q = edition.targetSearchFilter.toLowerCase();
        targetProducts = MOCK_PRODUCTS.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.categoryGroup?.toLowerCase().includes(q) ||
            p.subCategory?.toLowerCase().includes(q)
        );
      }

      if (targetProducts.length === 0) {
        targetProducts = MOCK_PRODUCTS.slice(0, 15);
      }

      const payload: PDFExportPayload = {
        consignee: {
          companyName: 'Official Commercial Buyer',
          contactName: 'Procurement Director',
          contactEmail: 'buyer@enterprise.com',
          targetMarket: 'Global Export Markets',
          incoTerm: 'FOB Chittagong Sea Port / DAC Dhaka Air Cargo',
          notes: `Official Publication: ${edition.title} (${edition.editionCode})`,
          requestType: 'linesheet',
        },
        products: targetProducts,
        generatedAt: new Date().toISOString(),
        documentTitle: edition.title,
        selectedCurrency: currentCurrency,
        currencyRate: currencyConfig.rateFromUsd,
        currencySymbol: currencyConfig.symbol,
        incoTerm: 'FOB Chittagong Sea Port',
      };

      const response = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('PDF generation server responded with error');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = edition.pdfFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Generating high-resolution catalog PDF. If this takes a moment, please retry or view online specifications.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F2] flex flex-col font-sans">
      {/* Top Corporate Dispatch Microbar */}
      <div className="bg-[#0A1A2F] text-white py-1.5 px-4 text-[10px] tracking-wider font-semibold border-b border-[#C9A86A]/30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-[#C9A86A]">
              <span className="uppercase">Crafted in Bangladesh. Curated by </span>
              <strong style={{ textTransform: 'none' }} className="font-black text-white inline-block">
                ArielMC
              </strong>
              <span className="uppercase">. Delivered Worldwide.</span>
            </span>
            <span className="hidden lg:inline text-slate-400">|</span>
            <span className="hidden lg:inline text-slate-300 uppercase">
              Official Institutional Publications & PDF Downloads
            </span>
          </div>
          <div className="flex items-center space-x-4 text-slate-300 uppercase">
            <button
              type="button"
              onClick={() => setIsSamplePolicyOpen(true)}
              className="text-[#C9A86A] hover:underline flex items-center space-x-1 cursor-pointer"
            >
              <span>Sample Policy SOP-B2B-SMP-2026-V1</span>
            </button>
            <span className="hidden md:inline">|</span>
            <span className="text-white font-bold hidden sm:inline">LWG • GOTS • BSCI • LFGB</span>
          </div>
        </div>
      </div>

      {/* Corporate Header */}
      <header className="bg-white border-b border-slate-200/90 shadow-2xs sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:text-[#0A1A2F] hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Catalog</span>
            </Link>

            <Link href="/" className="flex items-center space-x-3 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/logo.png"
                alt="ArielMC Logo"
                className="h-10 sm:h-11 w-auto object-contain"
              />
              <div className="hidden sm:flex flex-col border-l border-slate-200 pl-3">
                <span className="text-[11px] font-bold text-[#0A1A2F] uppercase tracking-wider font-heading leading-tight">
                  Catalog Download Center
                </span>
                <span className="text-[10px] text-[#C9A86A] font-semibold leading-tight">
                  Official Trade Publications & Sector Lookbooks
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <a
              href="https://www.arielmc.com"
              className="hidden md:inline-flex items-center space-x-1 text-slate-500 hover:text-[#0A1A2F] transition-colors"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>Corporate Website</span>
            </a>
            <span className="hidden md:inline text-slate-300">|</span>
            <span className="text-xs font-bold text-[#0A1A2F] bg-slate-100 px-3 py-1 rounded-md border border-slate-200">
              Active Currency: <strong className="text-[#C9A86A]">{currentCurrency}</strong>
            </span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#0A1A2F] to-[#0E243E] text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-[#C9A86A]/30">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#C9A86A]/20 border border-[#C9A86A]/40 text-[#C9A86A] text-xs font-bold tracking-wide uppercase">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Digital Line Sheet & Export Catalog Repository</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white font-heading">
            Official Catalog Download Center
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto font-light leading-relaxed">
            Download print-ready, high-resolution B2B catalogs compiled with verified factory cluster data,
            volume FOB pricing tiers, master carton CBM volume metrics, and tariff preference certificates.
          </p>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 max-w-3xl mx-auto text-center">
            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <span className="text-xl sm:text-2xl font-black text-[#C9A86A] block">90</span>
              <span className="text-[10px] text-slate-300 uppercase tracking-wider">Export SKUs</span>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <span className="text-xl sm:text-2xl font-black text-white block">5</span>
              <span className="text-[10px] text-slate-300 uppercase tracking-wider">Sovereign Verticals</span>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <span className="text-xl sm:text-2xl font-black text-emerald-400 block">0%</span>
              <span className="text-[10px] text-slate-300 uppercase tracking-wider">UK & EU Duty</span>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <span className="text-xl sm:text-2xl font-black text-[#C9A86A] block">24/7</span>
              <span className="text-[10px] text-slate-300 uppercase tracking-wider">Instant PDF Export</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content & Navigation Tabs */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        {/* Tier Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 text-xs font-semibold shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveTab('ALL')}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeTab === 'ALL'
                  ? 'bg-[#0A1A2F] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Editions (9)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('MASTER')}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeTab === 'MASTER'
                  ? 'bg-[#0A1A2F] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Master Catalog (1)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('COMPENDIUM')}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeTab === 'COMPENDIUM'
                  ? 'bg-[#0A1A2F] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sector Compendiums (5)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('LOOKBOOK')}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeTab === 'LOOKBOOK'
                  ? 'bg-[#0A1A2F] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Curated Lookbooks (3)
            </button>
          </div>

          <span className="text-xs text-slate-500 font-medium">
            Showing <strong className="text-slate-900">{filteredEditions.length}</strong> official publications
          </span>
        </div>

        {/* Catalog Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredEditions.map((edition) => {
            const isDownloading = downloadingId === edition.id;
            const isMaster = edition.tier === 'MASTER';

            return (
              <div
                key={edition.id}
                className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-xl ${
                  isMaster ? 'ring-2 ring-[#C9A86A] border-[#0A1A2F] md:col-span-2 lg:col-span-3' : 'border-slate-200'
                }`}
              >
                <div className={isMaster ? 'grid grid-cols-1 md:grid-cols-12 gap-6' : ''}>
                  {/* Cover Artwork Container */}
                  <div
                    className={`relative overflow-hidden bg-slate-100 ${
                      isMaster ? 'md:col-span-5 h-72 md:h-full min-h-[260px]' : 'aspect-4/3 w-full'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={edition.coverImage}
                      alt={edition.title}
                      className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
                      loading="lazy"
                    />

                    <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-xs ${edition.badgeBg} ${edition.badgeText}`}
                      >
                        {edition.badge}
                      </span>
                    </div>

                    <div className="absolute bottom-3 right-3 bg-[#0A1A2F]/85 backdrop-blur-sm text-white px-2.5 py-1 rounded-md text-[10px] font-mono font-bold shadow">
                      {edition.editionCode}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className={`p-6 flex flex-col justify-between ${isMaster ? 'md:col-span-7' : 'flex-1'}`}>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono font-bold text-[#C9A86A] uppercase tracking-wider">
                          Official Export Issue
                        </span>
                        <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                          {edition.skuCount} Specifications
                        </span>
                      </div>

                      <h3
                        className={`font-black text-[#0A1A2F] font-heading tracking-tight ${
                          isMaster ? 'text-2xl sm:text-3xl' : 'text-lg sm:text-xl'
                        }`}
                      >
                        {edition.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-600 font-light leading-relaxed">
                        {edition.description}
                      </p>

                      {/* Bullet Highlights */}
                      <div className="pt-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                          Publication Highlights:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                          {edition.highlights.map((h, i) => (
                            <div key={i} className="flex items-center space-x-1.5">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                              <span className="truncate">{h}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Download & Explore Actions */}
                    <div className="pt-6 border-t border-slate-100 mt-6 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleDownloadPdf(edition)}
                        disabled={isDownloading}
                        className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-[#0A1A2F] hover:bg-[#132c4e] text-white rounded-xl text-xs font-bold tracking-wide uppercase transition-all shadow-sm hover:shadow disabled:opacity-50 cursor-pointer"
                      >
                        {isDownloading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin text-[#C9A86A]" />
                            <span>Compiling PDF...</span>
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4 text-[#C9A86A]" />
                            <span>Download PDF Linesheet</span>
                          </>
                        )}
                      </button>

                      {edition.targetCategoryFilter ? (
                        <Link
                          href={`/?category=${edition.targetCategoryFilter}`}
                          className="inline-flex items-center space-x-1 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
                          title="Explore specifications online in interactive tree"
                        >
                          <span>Explore Online</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      ) : edition.targetSearchFilter ? (
                        <Link
                          href={`/?search=${edition.targetSearchFilter}`}
                          className="inline-flex items-center space-x-1 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
                          title="Explore specifications online in interactive tree"
                        >
                          <span>Explore Online</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      ) : (
                        <Link
                          href="/"
                          className="inline-flex items-center space-x-1 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
                        >
                          <span>Explore All 90</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Corporate Sourcing Assurance Banner */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="space-y-2 max-w-2xl text-center md:text-left">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#C9A86A]">
              Corporate Procurement & Custom Lookbooks
            </span>
            <h4 className="text-xl font-bold text-[#0A1A2F]">
              Need a Custom Line Sheet or Brand-Specific Compilation?
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed font-light">
              Our enterprise merchandising team can compile bespoke buyer lookbooks featuring your target FOB price
              brackets, private label embossing specifications, and custom master carton pack-outs.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsSamplePolicyOpen(true)}
              className="px-5 py-2.5 rounded-xl border border-[#0A1A2F] text-[#0A1A2F] hover:bg-slate-50 text-xs font-bold transition-colors"
            >
              Review Sample Policy SOP
            </button>
            <a
              href="https://www.arielmc.com/contact.html"
              className="px-5 py-2.5 rounded-xl bg-[#C9A86A] hover:bg-[#b59458] text-[#0A1A2F] text-xs font-bold transition-colors shadow-xs"
            >
              Request Custom Linesheet
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer onSelectCategory={(cat) => (window.location.href = `/?category=${cat}`)} />

      {/* Sample Policy SOP Modal */}
      <SamplePolicyModal
        isOpen={isSamplePolicyOpen}
        onClose={() => setIsSamplePolicyOpen(false)}
      />
    </div>
  );
}

export default function DownloadsPage() {
  return (
    <CurrencyProvider>
      <DownloadCenterContent />
    </CurrencyProvider>
  );
}

