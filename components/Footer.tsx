'use client';

import React from 'react';
import { MapPin, Phone, Mail, FileText, Lock, MessageSquare } from 'lucide-react';

interface FooterProps {
  onOpenSamplePolicy?: () => void;
  onSelectCategory?: (category: 'Leather' | 'Jute' | 'Ceramics' | 'Textiles' | 'Pottery') => void;
}

export default function Footer({ onOpenSamplePolicy, onSelectCategory }: FooterProps) {
  const handleCategoryClick = (cat: 'Leather' | 'Jute' | 'Ceramics' | 'Textiles' | 'Pottery') => {
    if (onSelectCategory) {
      onSelectCategory(cat);
      const el = document.getElementById('sourcing-matrix');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-white border-t border-slate-200 pt-14 pb-8 px-4 sm:px-6 lg:px-10 mt-auto">
      <div className="max-w-[1440px] w-full mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
        {/* Brand & Social Column */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/logo.png"
              alt="ArielMC Logo"
              className="h-10 w-auto object-contain"
            />
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-extrabold text-[#0A1A2F] tracking-tight font-heading">
                Ariel Marketing &
              </span>
              <span className="text-sm font-extrabold text-[#0A1A2F] tracking-tight font-heading">
                Communications Limited
              </span>
            </div>
          </div>

          <ul className="space-y-1.5 text-xs text-[#3A3A3A] font-medium">
            <li className="flex items-center">
              <span className="text-[#C9A86A] mr-2 font-bold">•</span> Global Sourcing
            </li>
            <li className="flex items-center">
              <span className="text-[#C9A86A] mr-2 font-bold">•</span> Export Management
            </li>
            <li className="flex items-center">
              <span className="text-[#C9A86A] mr-2 font-bold">•</span> Private Label Development
            </li>
          </ul>

          {/* Social Media Connect */}
          <div className="pt-3 border-t border-slate-100">
            <h5 className="font-bold text-[#0A1A2F] mb-2.5 uppercase tracking-widest text-[10px] font-heading">
              Social Media Connect
            </h5>
            <div className="flex flex-wrap items-center gap-2.5">
              <a
                href="https://www.linkedin.com/company/arielmc/?viewAsMember=true"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-all duration-200 hover:scale-110 hover:opacity-80"
                aria-label="LinkedIn"
                title="Connect on LinkedIn"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/linkedin.png" alt="LinkedIn" className="h-5 w-5 object-contain" />
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61593617982910"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-all duration-200 hover:scale-110 hover:opacity-80"
                aria-label="Facebook"
                title="Follow on Facebook"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/fb.png" alt="Facebook" className="h-5 w-5 object-contain" />
              </a>
              <a
                href="https://www.youtube.com/@ArielMC-BD"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-all duration-200 hover:scale-110 hover:opacity-80"
                aria-label="YouTube"
                title="Watch on YouTube"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/YouTube.jpeg" alt="YouTube" className="h-5 w-5 object-contain" />
              </a>
              <a
                href="https://www.instagram.com/arielmc.bd"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-all duration-200 hover:scale-110 hover:opacity-80"
                aria-label="Instagram"
                title="Follow on Instagram"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/Instagram.jpeg" alt="Instagram" className="h-5 w-5 object-contain" />
              </a>
              <a
                href="https://www.tiktok.com/@arielmc.bd"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-all duration-200 hover:scale-110 hover:opacity-80"
                aria-label="TikTok"
                title="Follow on TikTok"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/Tiktok.jpeg" alt="TikTok" className="h-5 w-5 object-contain" />
              </a>
              <a
                href="https://x.com/arielmc_bd"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-all duration-200 hover:scale-110 hover:opacity-80"
                aria-label="X (Twitter)"
                title="Follow on X"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/X.png" alt="X" className="h-5 w-5 object-contain" />
              </a>
            </div>
          </div>

          {/* WhatsApp 24/7 Direct Message */}
          <div className="pt-2">
            <h5 className="font-bold text-[#0A1A2F] mb-1.5 uppercase tracking-widest text-[10px] flex items-center gap-1.5 font-heading">
              <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" />
              Direct Message 24/7
            </h5>
            <a
              href="https://wa.me/8801819273458?text=Hello%20ArielMC%2C%20I%20am%20interested%20in%20your%20sourcing%20and%20manufacturing%20services."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-700 hover:text-[#25D366] transition group"
              title="Chat on WhatsApp 24/7"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/whatsapp.png"
                alt="WhatsApp"
                className="h-4 w-4 object-contain group-hover:scale-110 transition"
              />
              <span className="group-hover:underline font-mono">+880 1819 2734 58 (WhatsApp)</span>
            </a>
          </div>
        </div>

        {/* Company Links */}
        <div>
          <h4 className="font-bold text-[#0A1A2F] mb-4 uppercase tracking-widest text-xs font-heading">
            Corporate Ecosystem
          </h4>
          <ul className="space-y-2.5 text-xs text-slate-600">
            <li>
              <a href="https://arielmc.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#C9A86A] transition">
                Corporate Homepage &rarr;
              </a>
            </li>
            <li>
              <a href="https://arielmc.com/about.html" target="_blank" rel="noopener noreferrer" className="hover:text-[#C9A86A] transition">
                About ArielMC & Mission
              </a>
            </li>
            <li>
              <a href="https://arielmc.com/capabilities.html" target="_blank" rel="noopener noreferrer" className="hover:text-[#C9A86A] transition">
                OEM / ODM Capabilities
              </a>
            </li>
            <li>
              <a href="https://arielmc.com/sustainability.html" target="_blank" rel="noopener noreferrer" className="hover:text-[#C9A86A] transition">
                ESG & Sustainability Charter
              </a>
            </li>
            <li>
              <a href="https://arielmc.com/blog.html" target="_blank" rel="noopener noreferrer" className="hover:text-[#C9A86A] transition">
                Sourcing Blog & Insights
              </a>
            </li>
            <li>
              <a href="https://arielmc.com/contact.html" target="_blank" rel="noopener noreferrer" className="hover:text-[#C9A86A] transition">
                Global Procurement Contact
              </a>
            </li>
          </ul>
        </div>

        {/* The Compendium Sector Links */}
        <div>
          <h4 className="font-bold text-[#0A1A2F] mb-4 uppercase tracking-widest text-xs font-heading">
            The 5 Compendiums
          </h4>
          <ul className="space-y-2.5 text-xs text-slate-600">
            <li>
              <button
                type="button"
                onClick={() => handleCategoryClick('Leather')}
                className="hover:text-[#C9A86A] transition cursor-pointer text-left"
              >
                01 The Leather Compendium (15 SKUs)
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => handleCategoryClick('Jute')}
                className="hover:text-[#C9A86A] transition cursor-pointer text-left"
              >
                02 The Golden Fiber Edit (17 SKUs)
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => handleCategoryClick('Ceramics')}
                className="hover:text-[#C9A86A] transition cursor-pointer text-left"
              >
                03 The Ceramic Index (13 SKUs)
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => handleCategoryClick('Textiles')}
                className="hover:text-[#C9A86A] transition cursor-pointer text-left"
              >
                04 Thread & Weave (16 SKUs)
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => handleCategoryClick('Pottery')}
                className="hover:text-[#C9A86A] transition cursor-pointer text-left"
              >
                05 Earth & Form Terracotta (13 SKUs)
              </button>
            </li>
            {onOpenSamplePolicy && (
              <li className="pt-1">
                <button
                  type="button"
                  onClick={onOpenSamplePolicy}
                  className="text-xs font-bold text-[#C9A86A] hover:underline cursor-pointer flex items-center space-x-1"
                >
                  <FileText className="h-3 w-3" />
                  <span>Sample Policy (SOP-B2B-SMP-2026-V1)</span>
                </button>
              </li>
            )}
          </ul>
        </div>

        {/* Headquarters & Contact Info */}
        <div>
          <h4 className="font-bold text-[#0A1A2F] mb-4 uppercase tracking-widest text-xs font-heading">
            Headquarters & Desk
          </h4>
          <ul className="space-y-3 text-xs text-slate-600">
            <li className="flex items-start">
              <MapPin className="h-4 w-4 mr-2.5 text-[#C9A86A] mt-0.5 shrink-0" />
              <span className="leading-relaxed">
                House - 30 (1st Floor), Road - 07, Block - C, Niketon, Gulshan, Dhaka-1212, Bangladesh
              </span>
            </li>
            <li className="flex items-center">
              <Phone className="h-4 w-4 mr-2.5 text-[#C9A86A] shrink-0" />
              <span className="font-mono">+880 2410 811 91 / +880 1819 2734 58</span>
            </li>
            <li className="flex items-start">
              <Mail className="h-4 w-4 mr-2.5 text-[#C9A86A] mt-0.5 shrink-0" />
              <div className="space-y-0.5 font-mono">
                <a href="mailto:info@arielmc.com" className="block hover:text-[#C9A86A] transition">
                  info@arielmc.com
                </a>
                <a href="mailto:arielmc.bd@gmail.com" className="block hover:text-[#C9A86A] transition">
                  arielmc.bd@gmail.com
                </a>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Legal & Compliance Strip */}
      <div className="border-t border-slate-100 pt-6 text-center text-slate-400 text-xs flex flex-col sm:flex-row items-center justify-between gap-3 max-w-[1440px] w-full mx-auto">
        <div>
          &copy; {new Date().getFullYear()} Ariel Marketing & Communications Limited. All Rights Reserved.
        </div>
        <div className="flex items-center space-x-4 text-[11px]">
          {onOpenSamplePolicy && (
            <button
              type="button"
              onClick={onOpenSamplePolicy}
              className="hover:text-[#C9A86A] transition font-semibold text-[#C9A86A] cursor-pointer"
            >
              Sample Policy (SOP-B2B)
            </button>
          )}
          <span>•</span>
          <a
            href="https://arielmc.com/portal.html"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#C9A86A] transition font-medium flex items-center gap-1"
          >
            <Lock className="w-3 h-3 text-slate-400" />
            <span>Staff Portal</span>
          </a>
          <span>•</span>
          <a
            href="https://arielmc.com/contact.html"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#C9A86A] transition flex items-center gap-1"
          >
            <MessageSquare className="w-3 h-3 text-slate-400" />
            <span>Direct Inquiries</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
