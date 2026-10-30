'use client';

import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Plane,
  RotateCcw,
  CheckCircle2,
  Lock,
  CreditCard,
  FileText,
  AlertCircle,
  Truck,
  Award,
  Layers,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useCurrency } from './CurrencyContext';

interface SamplePolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedDivision?: string;
}

export default function SamplePolicyModal({
  isOpen,
  onClose,
  preSelectedDivision,
}: SamplePolicyModalProps) {
  const { currentCurrency, formatPrice } = useCurrency();
  const [activeTab, setActiveTab] = useState<'tiers' | 'credit' | 'freight' | 'lifecycle' | 'qadoc'>('tiers');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div
        className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-[#0A1A2F] text-white px-6 py-4 flex items-center justify-between border-b border-[#C9A86A]/40 shrink-0">
          <div className="flex items-center space-x-3">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#C9A86A] text-[#0A1A2F]">
              SOP-B2B-SMP-2026-V1
            </span>
            <span className="text-xs uppercase font-bold tracking-wider text-[#C9A86A] hidden sm:inline">
              Sample Development & Commercial Governance
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-300 hidden md:inline">
              100% Sample Fee Credit Guarantee
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Sub-Header Badges Bar */}
        <div className="bg-[#F8F6F2] border-b border-slate-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1 text-emerald-700 font-bold">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>100% Fee Credited on Bulk PO</span>
            </span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center space-x-1 text-[#0A1A2F] font-semibold">
              <RotateCcw className="h-3.5 w-3.5 text-[#C9A86A]" />
              <span>Zero-Risk Re-make SLA (7-Day)</span>
            </span>
            <span className="text-slate-300 hidden md:inline">|</span>
            <span className="hidden md:flex items-center space-x-1 text-[#0A1A2F] font-semibold">
              <Lock className="h-3.5 w-3.5 text-blue-600" />
              <span>Bilateral NDA Exclusivity</span>
            </span>
          </div>
          <div className="text-slate-500 font-mono text-[11px]">
            Express Dispatch: <strong className="text-[#0A1A2F]">DAC (Dhaka)</strong>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('tiers')}
            className={`py-3 px-4 text-xs font-bold border-b-2 uppercase tracking-wider whitespace-nowrap transition-colors flex items-center space-x-2 ${
              activeTab === 'tiers'
                ? 'border-[#0A1A2F] text-[#0A1A2F] bg-white'
                : 'border-transparent text-slate-500 hover:text-[#0A1A2F]'
            }`}
          >
            <Layers className="h-3.5 w-3.5 text-[#C9A86A]" />
            <span>3 Sampling Tiers</span>
          </button>

          <button
            onClick={() => setActiveTab('credit')}
            className={`py-3 px-4 text-xs font-bold border-b-2 uppercase tracking-wider whitespace-nowrap transition-colors flex items-center space-x-2 ${
              activeTab === 'credit'
                ? 'border-[#0A1A2F] text-[#0A1A2F] bg-white'
                : 'border-transparent text-slate-500 hover:text-[#0A1A2F]'
            }`}
          >
            <CreditCard className="h-3.5 w-3.5 text-[#C9A86A]" />
            <span>100% Bulk Credit Rules</span>
          </button>

          <button
            onClick={() => setActiveTab('freight')}
            className={`py-3 px-4 text-xs font-bold border-b-2 uppercase tracking-wider whitespace-nowrap transition-colors flex items-center space-x-2 ${
              activeTab === 'freight'
                ? 'border-[#0A1A2F] text-[#0A1A2F] bg-white'
                : 'border-transparent text-slate-500 hover:text-[#0A1A2F]'
            }`}
          >
            <Plane className="h-3.5 w-3.5 text-[#C9A86A]" />
            <span>Courier Freight & Waybill</span>
          </button>

          <button
            onClick={() => setActiveTab('lifecycle')}
            className={`py-3 px-4 text-xs font-bold border-b-2 uppercase tracking-wider whitespace-nowrap transition-colors flex items-center space-x-2 ${
              activeTab === 'lifecycle'
                ? 'border-[#0A1A2F] text-[#0A1A2F] bg-white'
                : 'border-transparent text-slate-500 hover:text-[#0A1A2F]'
            }`}
          >
            <FileText className="h-3.5 w-3.5 text-[#C9A86A]" />
            <span>5-Stage Lifecycle (SOP-B2B-LFC)</span>
          </button>

          <button
            onClick={() => setActiveTab('qadoc')}
            className={`py-3 px-4 text-xs font-bold border-b-2 uppercase tracking-wider whitespace-nowrap transition-colors flex items-center space-x-2 ${
              activeTab === 'qadoc'
                ? 'border-[#0A1A2F] text-[#0A1A2F] bg-white'
                : 'border-transparent text-slate-500 hover:text-[#0A1A2F]'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>QA-DOC Compliance</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1 text-slate-800 text-sm">
          {/* TAB 1: 3 SAMPLING TIERS */}
          {activeTab === 'tiers' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-heading text-lg font-bold text-[#0A1A2F]">
                  <strong className="font-black text-[#0A1A2F]">ArielMC</strong> 3-Tier Sampling Architecture
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Engineered to protect master manufacturing line availability while granting friction-free, expedited prototype review for verified Western corporate buyers and procurement directors.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Tier A */}
                <div className="border border-slate-200 rounded-xl p-4 bg-white flex flex-col justify-between shadow-xs hover:border-[#0A1A2F] transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase">
                        Tier A
                      </span>
                      <span className="text-[11px] font-bold text-emerald-600">100% Credited</span>
                    </div>
                    <h4 className="font-bold text-sm text-[#0A1A2F]">
                      Ready Catalog Showroom Samples
                    </h4>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      Off-the-shelf reference models directly from our current production roadmaps without custom structural alterations.
                    </p>
                    <div className="mt-3 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1">
                      <div>• <strong>Unit Fee:</strong> Nominal wholesale price (or complimentary up to 2 units for approved accounts).</div>
                      <div>• <strong>Dispatch:</strong> 24–48 hours from Dhaka stock.</div>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-semibold">
                    Ideal for assessing material hand-feel, stitch density, and hardware caliber.
                  </div>
                </div>

                {/* Tier B */}
                <div className="border-2 border-[#0A1A2F] rounded-xl p-4 bg-white flex flex-col justify-between shadow-md relative">
                  <div className="absolute -top-3 right-4 bg-[#0A1A2F] text-[#C9A86A] text-[9px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wider">
                    Most Popular
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 uppercase">
                        Tier B
                      </span>
                      <span className="text-[11px] font-bold text-emerald-600">100% Rebated on PO</span>
                    </div>
                    <h4 className="font-bold text-sm text-[#0A1A2F]">
                      Custom OEM Tech-Pack Prototypes
                    </h4>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      Custom dimensions, bespoke GSM/leather tannage, Pantone TCX lab dips, and personalized debossed/hot-foil branding dies.
                    </p>
                    <div className="mt-3 text-xs bg-[#0A1A2F]/5 p-2.5 rounded-lg border border-[#0A1A2F]/10 space-y-1">
                      <div>• <strong>Brass Dies:</strong> $35–$65 (Client owned).</div>
                      <div>• <strong>Screen Frames:</strong> $25 / colorway.</div>
                      <div>• <strong>Lead Time:</strong> 7–14 business days.</div>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-600 font-semibold">
                    Includes bilateral Non-Disclosure Agreement (NDA) and design exclusivity guarantee.
                  </div>
                </div>

                {/* Tier C */}
                <div className="border border-slate-200 rounded-xl p-4 bg-white flex flex-col justify-between shadow-xs hover:border-[#0A1A2F] transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 uppercase">
                        Tier C
                      </span>
                      <span className="text-[11px] font-bold text-slate-600">Enterprise</span>
                    </div>
                    <h4 className="font-bold text-sm text-[#0A1A2F]">
                      Corporate Specimen Kits
                    </h4>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      Curated multi-division presentation cases compiled specifically for corporate procurement committees, board reviews, and retail merchandising teams.
                    </p>
                    <div className="mt-3 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1">
                      <div>• <strong>Contents:</strong> Full material swatches, leather cuttings, handle trims, ceramic glaze chips.</div>
                      <div>• <strong>Cost:</strong> Subsidized flat institutional rate.</div>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-semibold">
                    Shipped with pre-authenticated QA-DOC physical compliance certificates.
                  </div>
                </div>
              </div>

              {/* Zero-Risk Re-Make SLA Box */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 flex items-start space-x-3 text-xs text-amber-900">
                <RotateCcw className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold block text-sm">
                    <strong className="font-black text-[#0A1A2F]">ArielMC</strong> Zero-Risk Prototype Re-make SLA
                  </strong>
                  <p className="mt-1 leading-relaxed text-amber-800">
                    If an expedited prototype diverges by more than <strong>1.5mm</strong> from your approved CAD tech-pack, or fails the agreed Pantone delta-E threshold (<strong>ΔE &gt; 1.5</strong>), <strong className="font-extrabold text-[#0A1A2F]">ArielMC</strong> re-engineers, re-inspects, and re-dispatches a revised golden specimen within <strong>7 business days at 100% <strong className="font-extrabold text-[#0A1A2F]">ArielMC</strong> expense</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 100% BULK CREDIT RULES */}
          {activeTab === 'credit' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-heading text-lg font-bold text-[#0A1A2F]">
                  100% Sample Fee Credit & Commercial Reimbursement
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  To eliminate corporate evaluation risk, 100% of physical sample development fees are credited directly toward the final invoice on qualifying commercial production purchase orders.
                </p>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#0A1A2F] text-white">
                      <th className="py-2.5 px-4 font-bold uppercase tracking-wider">Policy Metric</th>
                      <th className="py-2.5 px-4 font-bold uppercase tracking-wider">Qualifying Threshold / Term</th>
                      <th className="py-2.5 px-4 font-bold uppercase tracking-wider text-right">Governing Standard</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    <tr className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-[#0A1A2F]">Qualifying Volume (Jute Line)</td>
                      <td className="py-3 px-4 text-slate-700">Purchase Order (PO) ≥ 1,000 units per style / colorway</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-500">SOP-B2B-SMP-JUT</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-[#0A1A2F]">Qualifying Volume (Leather Line)</td>
                      <td className="py-3 px-4 text-slate-700">PO ≥ 300 units (Bags & Carry) / 500 pcs (SLGs & Small Goods)</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-500">SOP-B2B-SMP-LTH</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-[#0A1A2F]">Minimum Commercial PO Value</td>
                      <td className="py-3 px-4 text-slate-700 font-bold text-emerald-700">
                        ≥ $3,000 USD (or £2,500 GBP / €2,800 EUR / A$4,500 AUD)
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-500">Global Parity</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-[#0A1A2F]">Credit Allocation Mechanism</td>
                      <td className="py-3 px-4 text-slate-700">
                        100% of Sample Fee credited against the final balance invoice against Bill of Lading (B/L) copy.
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-500">Net Invoice Deduction</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-[#0A1A2F]">Claim Validity Window</td>
                      <td className="py-3 px-4 text-slate-700 font-bold text-blue-700">
                        90 Calendar Days from sample dispatch date
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-500">Standard SLA</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-[#0A1A2F]">Partial Order Exception</td>
                      <td className="py-3 px-4 text-slate-700">
                        Orders between 50%–99% of MOQ receive a pro-rata 50% sample development fee credit.
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-500">Pro-Rata</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Instant Micro-Fee Payment Channels */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#0A1A2F] flex items-center space-x-2">
                  <CreditCard className="h-4 w-4 text-[#C9A86A]" />
                  <span>Accelerated Micro-Fee Settlements ($35 – $140)</span>
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  To avoid multi-day international SWIFT banking holds on sample fees, <strong className="font-extrabold text-[#0A1A2F]">ArielMC</strong> provides frictionless digital settlement via <strong>Corporate Visa/Mastercard/Amex, Stripe, and Wise Direct</strong>, reserving formal SWIFT wires strictly for the 50% bulk production deposit.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: COURIER FREIGHT & WAYBILL */}
          {activeTab === 'freight' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-heading text-lg font-bold text-[#0A1A2F]">
                  International Courier & Zero-Tariff Waybill Protocol
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  All prototype and specimen parcels are dispatched via <strong>DHL Express</strong> or <strong>FedEx International Priority</strong> directly from Hazrat Shahjalal International Airport, Dhaka (DAC) with end-to-end milestone tracking.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Option 1 */}
                <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-xs">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase">
                    Option 1 (Recommended)
                  </span>
                  <h4 className="font-bold text-sm text-[#0A1A2F] mt-2">
                    Freight-Collect via Corporate Account
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Provide your enterprise <strong>DHL, FedEx, or UPS</strong> account number during checkout. <strong className="font-extrabold text-[#0A1A2F]">ArielMC</strong> consigns the air waybill directly against your corporate billing code with <strong>zero administrative markup</strong>.
                  </p>
                </div>

                {/* Option 2 */}
                <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-xs">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 uppercase">
                    Option 2
                  </span>
                  <h4 className="font-bold text-sm text-[#0A1A2F] mt-2">
                    Prepaid Net Pass-Through Invoicing
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    <strong className="font-extrabold text-[#0A1A2F]">ArielMC</strong> books priority air freight and bills at institutional partner rates (0.5 kg – 1.0 kg parcel):
                  </p>
                  <ul className="text-xs text-slate-700 mt-2 space-y-1 font-mono">
                    <li>• UK & Western Europe: <strong>$38.00 – $48.00 USD</strong></li>
                    <li>• USA & Canada: <strong>$42.00 – $55.00 USD</strong></li>
                    <li>• Australia & New Zealand: <strong>$48.00 – $60.00 USD</strong></li>
                  </ul>
                </div>
              </div>

              {/* Zero-Tariff Customs Waybill Manifest */}
              <div className="bg-[#0A1A2F] text-white p-4 rounded-xl border border-[#C9A86A]/40 space-y-2">
                <div className="flex items-center space-x-2">
                  <Plane className="h-4 w-4 text-[#C9A86A]" />
                  <span className="text-xs uppercase font-extrabold tracking-wider text-[#C9A86A]">
                    Official Customs Declaration Protocol (Zero-Duty / Zero Brokerage Friction)
                  </span>
                </div>
                <div className="font-mono text-xs bg-slate-900/80 p-3 rounded-lg border border-slate-700 text-emerald-300">
                  &quot;Commercial Mutilated Prototype Samples – No Commercial Value – Value for Customs Purposes Only: $10.00 USD&quot;
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  This standardized air waybill declaration ensures parcels clear UK Border Force, EU Customs, and US CBP seamlessly without incurring speculative import duties, unexpected brokerage hold fees, or VAT assessments.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: 5-STAGE LIFECYCLE */}
          {activeTab === 'lifecycle' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-heading text-lg font-bold text-[#0A1A2F]">
                  Sourcing & Prototyping Lifecycle Framework
                </h3>
                <span className="text-xs font-mono text-[#C9A86A] bg-[#0A1A2F] px-2 py-0.5 rounded">
                  Framework Standard: SOP-B2B-LFC-2026
                </span>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Every order navigates <strong className="font-extrabold text-[#0A1A2F]">ArielMC</strong>’s verified 5-stage institutional workflow with strict milestone gates and deliverables.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    stage: '01',
                    duration: '1–2 Days',
                    title: 'Brief & Feasibility Gate',
                    desc: 'Tech-pack review, Bill of Materials (BOM) cost modeling, factory capacity slotting, and commercial viability clearance.',
                    deliverable: 'Feasibility Matrix & Formal Price Quotation',
                  },
                  {
                    stage: '02',
                    duration: '1–4 Weeks',
                    title: 'Sampling & Physical Prototyping',
                    desc: 'CAD pattern digitization, CNC leather / laser jute cutting, custom brass die machining, and golden specimen crafting.',
                    deliverable: 'Master Golden Specimen + Lab Dips + Courier Dispatch',
                  },
                  {
                    stage: '03',
                    duration: '2–4 Weeks',
                    title: 'Ethical Production & Assembly',
                    desc: 'Bulk cutting, precision stitching, and line assembly conducted exclusively in Sedex/BSCI audited living-wage partner facilities.',
                    deliverable: 'Daily Line Output Reports & Mid-Production In-line Audit',
                  },
                  {
                    stage: '04',
                    duration: '1–2 Weeks',
                    title: 'AQL 1.5/2.5 Audit & Drop Testing',
                    desc: 'Final random inspection per ISO 2859-1 standards (AQL 1.5 Major / 2.5 Minor), 25kg dynamic handle pull test, and carton drop testing.',
                    deliverable: 'Signed Pre-Shipment Quality Inspection Dossier (QA-DOC)',
                  },
                  {
                    stage: '05',
                    duration: '3–5 Days',
                    title: 'Logistics, Customs & Port Clearance',
                    desc: 'Ocean container drayage to Chittagong Port or DAC Air Cargo dispatch, Bill of Lading (B/L), DAE Phytosanitary and GSP/DCTS Form A issuance.',
                    deliverable: 'Full Commercial Shipping Dossier (BL, COO, Phyto, QA-DOC)',
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="border border-slate-200 rounded-xl p-3.5 bg-white flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-[#0A1A2F] transition-all"
                  >
                    <div className="flex items-start space-x-3">
                      <span className="font-heading font-extrabold text-base text-[#0A1A2F] bg-slate-100 px-2.5 py-1 rounded-md shrink-0">
                        {item.stage}
                      </span>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-xs uppercase tracking-wider text-[#0A1A2F]">
                            {item.title}
                          </h4>
                          <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            {item.duration}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                    <div className="md:text-right shrink-0 bg-slate-50 md:bg-transparent p-2 md:p-0 rounded-lg">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Deliverable:</span>
                      <span className="text-xs font-bold text-[#0A1A2F]">{item.deliverable}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: QA-DOC COMPLIANCE */}
          {activeTab === 'qadoc' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-heading text-lg font-bold text-[#0A1A2F]">
                  Pre-Shipment Quality Inspection Dossier (QA-DOC)
                </h3>
                <span className="text-xs font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  Regulatory Standard: SOP-B2B-QAD-2026
                </span>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Every production shipment and sample parcel includes an authenticated QA-DOC certifying destination chemical and mechanical safety standards across the UK, EU, US, and Australia.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Chemical Safety */}
                <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-2">
                  <div className="flex items-center space-x-2 text-emerald-700 font-bold text-xs border-b border-slate-100 pb-2">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Chemical & REACH</span>
                  </div>
                  <ul className="text-xs space-y-1 text-slate-600">
                    <li>• <strong>Cr VI:</strong> &lt; 3.0 mg/kg (Hexavalent Chromium Free)</li>
                    <li>• <strong>Biocides:</strong> Zero DMFu (Dimethyl Fumarate)</li>
                    <li>• <strong>Azo Dyes:</strong> 0% (EU 1907/2006 REACH Annex XVII)</li>
                    <li>• <strong>Heavy Metals:</strong> &lt; 5 ppm (Prop 65 Safe)</li>
                  </ul>
                </div>

                {/* Fiber Safety */}
                <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-2">
                  <div className="flex items-center space-x-2 text-blue-700 font-bold text-xs border-b border-slate-100 pb-2">
                    <Award className="h-4 w-4" />
                    <span>Fibers & Food Contact</span>
                  </div>
                  <ul className="text-xs space-y-1 text-slate-600">
                    <li>• <strong>Batching Oil:</strong> 100% Vegetable Non-Toxic</li>
                    <li>• <strong>Fiber Split:</strong> ±1.2% Accuracy against spec</li>
                    <li>• <strong>Rubbing Fastness:</strong> Grade 4–5 (ISO 105-X12)</li>
                    <li>• <strong>Formaldehyde:</strong> &lt; 16 ppm (OEKO-TEX Class I)</li>
                  </ul>
                </div>

                {/* Mechanical Rigor */}
                <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-2">
                  <div className="flex items-center space-x-2 text-purple-700 font-bold text-xs border-b border-slate-100 pb-2">
                    <Truck className="h-4 w-4" />
                    <span>Structural Rigor</span>
                  </div>
                  <ul className="text-xs space-y-1 text-slate-600">
                    <li>• <strong>Handle Pull:</strong> 22–25 kg dynamic cycle pass</li>
                    <li>• <strong>Seam Strength:</strong> 400+ N tensile test</li>
                    <li>• <strong>Salt Spray:</strong> 48h hardware corrosion proof</li>
                    <li>• <strong>Packaging:</strong> ISTA 1A export carton drop pass</li>
                  </ul>
                </div>
              </div>

              {/* Institutional Audit Summary */}
              <div className="bg-[#0A1A2F]/5 p-4 rounded-xl border border-[#0A1A2F]/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-[#0A1A2F] block">International Audit Credentials:</span>
                  <span className="text-slate-600">
                    All partner facilities maintain active audits for Sedex SMETA, BSCI, GOTS Organic Jute, and LWG Tannery Gold/Silver certification.
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500">
            <span>Ariel Marketing & Communications Limited (<strong className="font-extrabold text-[#0A1A2F]">ArielMC</strong>) • Dhaka, Bangladesh</span>
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#0A1A2F] text-[#C9A86A] hover:bg-slate-900 transition-all shadow-sm"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
}

