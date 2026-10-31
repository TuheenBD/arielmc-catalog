import { NextRequest, NextResponse } from 'next/server';
import puppeteer, { Browser } from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { PDFExportPayload, Product } from '@/types/product';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Resolves local image assets directly to base64 data URIs
 * ensuring deterministic, zero-latency PDF rendering without network lag.
 */
function resolveAssetSrc(src: string): string {
  if (!src) return '';
  if (src.startsWith('/')) {
    const localFilePath = path.join(process.cwd(), 'public', src);
    if (fs.existsSync(localFilePath)) {
      const ext = path.extname(localFilePath).replace('.', '') || 'jpeg';
      const fileBuffer = fs.readFileSync(localFilePath);
      return `data:image/${ext === 'jpg' ? 'jpeg' : ext};base64,${fileBuffer.toString('base64')}`;
    }
  }
  return src;
}

/**
 * Resolves the Chromium binary path defensively across Vercel serverless (Linux)
 * and local environments (macOS, Linux, Windows).
 */
async function getBrowserInstance(): Promise<Browser> {
  const isVercelOrLinux = Boolean(process.env.VERCEL) || process.platform === 'linux';

  if (isVercelOrLinux) {
    return await puppeteer.launch({
      args: [...chromium.args, '--hide-scrollbars', '--disable-web-security', '--disable-dev-shm-usage', '--no-sandbox'],
      defaultViewport: {
        width: 1200,
        height: 1600,
        deviceScaleFactor: 2,
      },
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  }

  // Local workstation environment (macOS / Windows)
  const localPaths = [
    process.env.CHROME_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  ].filter(Boolean) as string[];

  let executablePath = '';
  for (const p of localPaths) {
    if (fs.existsSync(p)) {
      executablePath = p;
      break;
    }
  }

  if (!executablePath) {
    try {
      executablePath = await chromium.executablePath();
    } catch {
      throw new Error(
        'Chrome executable not detected. Set CHROME_PATH environment variable for local development.'
      );
    }
  }

  return await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    executablePath,
    headless: true,
  });
}

/**
 * Compiles a bespoke A4 Executive Sourcing Dossier & Tech-Pack.
 * Structure:
 * - Page 1: Fixed Cover Page (Corporate Navy, Gold Seal, Personalized Buyer Demographic)
 * - Page 2: Corporate Profile, Mission/Vision, 5 Industrial Clusters & Governance SOPs
 * - Pages 3 to N: Dedicated 1 Full A4 Page per Selected Product (Photo, Tech-Pack, Carton CBM, 4-Tier Pricing)
 * - Final Page: IncoTerms, Payment Protocols, NDA & Executive Contacts
 */
function generateArielBespokeDossierHtml(payload: PDFExportPayload): string {
  const {
    consignee,
    products,
    generatedAt,
    currencySymbol = '$',
    currencyRate = 1.0,
    selectedCurrency = 'USD',
    incoTerm = 'FOB Chittagong Sea Port',
    totalEstimatedCbm,
    totalEstimatedWeightKg,
    totalEstimatedCartons,
  } = payload;

  const formattedDate = new Date(generatedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const yearStr = new Date(generatedAt).getFullYear();
  const catalogId = `AMC-DOS-${yearStr}-${Math.floor(1000 + Math.random() * 9000)}`;
  const logoDataUri = resolveAssetSrc('/brand/logo.png');

  // Format currency helper
  const formatVal = (usdPrice: number): string => {
    const converted = usdPrice * currencyRate;
    return converted >= 100
      ? `${currencySymbol}${Math.round(converted).toLocaleString('en-US')}`
      : `${currencySymbol}${(Math.round(converted * 10) / 10).toFixed(2)}`;
  };

  const totalPagesCount = products.length + 3; // Cover (1) + Profile (1) + Products (N) + Contacts (1)

  // =========================================================================
  // Render Individual Product Tech-Pack Pages (1 Dedicated Page Per Product)
  // =========================================================================
  const productPagesHtml = products
    .map((item: Product, index: number) => {
      const pageNum = index + 3;
      const { heightMm, widthMm, depthMm } = item.dimensions;
      const carton = item.masterCarton;
      const resolvedImg = resolveAssetSrc(item.imageUrl);

      const tier1Price = item.price;
      const tier2Price = item.price * 0.95; // -5% volume incentive
      const tier3Price = item.price * 0.90; // -10% preferred partner
      const tier4Price = item.price * 0.85; // -15% master contract

      const estUnits20ft = carton?.unitsPer20ftContainer || Math.floor((33.2 / (carton?.cbm || 0.05)) * (carton?.unitsPerCarton || 20));
      const estUnits40ft = carton?.unitsPer40ftContainer || Math.floor((67.7 / (carton?.cbm || 0.05)) * (carton?.unitsPerCarton || 20));
      const estCartons40ft = Math.floor(67.7 / (carton?.cbm || 0.05));

      return `
      <!-- PRODUCT TECH-PACK PAGE ${pageNum} -->
      <div class="a4-page product-page">
        <!-- Top Running Header -->
        <div class="page-top-header">
          <div class="header-left">
            <span class="sector-tag">${item.divisionTitle || item.category}</span>
            <span class="sep">/</span>
            <span class="group-tag">${item.categoryGroup || item.subCategory || 'Export Collection'}</span>
          </div>
          <div class="header-right font-mono">
            <span>Dossier: ${catalogId}</span>
            <span class="sep">•</span>
            <span class="page-indicator">Page ${pageNum} of ${totalPagesCount}</span>
          </div>
        </div>

        <!-- Product Identity Banner -->
        <div class="product-banner">
          <div class="product-banner-main">
            <div class="sku-badge font-mono">${item.sku}</div>
            <h2 class="product-headline">${item.name}</h2>
            <div class="tariff-status font-mono">
              <span class="hs-code">HS Code: ${item.hsCode}</span>
              <span class="tariff-pref">UK DCTS 0% Duty • EU GSP 0% Duty-Free</span>
            </div>
          </div>
          <div class="product-banner-origin">
            <div class="origin-label">Industrial Cluster</div>
            <div class="origin-val">${item.originHub || 'Dhaka Export Processing Zone'}</div>
          </div>
        </div>

        <!-- Main Product Content: 2-Column Split -->
        <div class="product-grid">
          <!-- Left Column: Hero Visual, Dimensions & Materials -->
          <div class="col-visual">
            <div class="hero-image-box">
              <img src="${resolvedImg}" alt="${item.name}" />
            </div>

            <div class="spec-card">
              <div class="spec-card-title">Physical Dimensions & Weight</div>
              <div class="dim-grid font-mono">
                <div class="dim-item">
                  <span class="dim-label">Height</span>
                  <span class="dim-val">${heightMm} mm</span>
                </div>
                <div class="dim-item">
                  <span class="dim-label">Width</span>
                  <span class="dim-val">${widthMm} mm</span>
                </div>
                <div class="dim-item">
                  <span class="dim-label">Depth</span>
                  <span class="dim-val">${depthMm} mm</span>
                </div>
                <div class="dim-item">
                  <span class="dim-label">Unit Weight</span>
                  <span class="dim-val">${item.weightGrams ? `${item.weightGrams} g` : 'Variable'}</span>
                </div>
              </div>
            </div>

            <div class="spec-card">
              <div class="spec-card-title">Raw Material Composition</div>
              <div class="material-pills">
                ${item.materials.map((m) => `<span class="mat-pill">${m}</span>`).join('')}
              </div>
            </div>

            <div class="spec-card">
              <div class="spec-card-title">Production & Sample Lead Times</div>
              <div class="lead-row">
                <span class="lead-k">Express Counter-Sample:</span>
                <span class="lead-v font-mono">${item.sampleLeadTimeDays || 7}–10 Days (via DHL/FedEx)</span>
              </div>
              <div class="lead-row">
                <span class="lead-k">Commercial Bulk PO:</span>
                <span class="lead-v font-mono">${item.leadTimeWeeks || 5}–6 Weeks (Ex-Factory)</span>
              </div>
            </div>
          </div>

          <!-- Right Column: Tech-Pack, Master Carton Packaging & 4-Tier Volume Pricing -->
          <div class="col-techpack">
            <div class="techpack-desc">
              <div class="section-label">Commercial Overview & Sourcing Notes</div>
              <p>${item.description}</p>
            </div>

            <!-- Master Carton Packaging & Freight Log -->
            <div class="spec-card">
              <div class="spec-card-title gold">Master Carton Packaging & Container Logistics</div>
              <table class="carton-table font-mono">
                <tbody>
                  <tr>
                    <td class="lbl">Units per Carton:</td>
                    <td class="val"><strong>${carton?.unitsPerCarton || 20} pcs / carton</strong></td>
                    <td class="lbl">Carton CBM:</td>
                    <td class="val"><strong>${carton?.cbm || 0.05} CBM</strong></td>
                  </tr>
                  <tr>
                    <td class="lbl">Carton Dimensions:</td>
                    <td class="val">${carton?.heightMm || 300} × ${carton?.widthMm || 400} × ${carton?.depthMm || 500} mm</td>
                    <td class="lbl">Gross Weight:</td>
                    <td class="val">${carton?.grossWeightKg || 12} kg</td>
                  </tr>
                  <tr>
                    <td class="lbl">20ft FCL Capacity:</td>
                    <td class="val">~${estUnits20ft.toLocaleString()} pcs</td>
                    <td class="lbl">40ft HQ Capacity:</td>
                    <td class="val">~${estUnits40ft.toLocaleString()} pcs (~${estCartons40ft} ctns)</td>
                  </tr>
                  <tr>
                    <td class="lbl">Packing Spec:</td>
                    <td class="val" colspan="3">ISTA 1A Drop-Test Certified 5-Ply Corrugated Box, Moisture Desiccant, GS1 Master Label</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- 4-Tier Volume Export Pricing Policy -->
            <div class="spec-card">
              <div class="spec-card-title gold">Tiered Volume Pricing & Quantity Policy (${selectedCurrency} ${incoTerm.split(' ')[0]})</div>
              <table class="pricing-table font-mono">
                <thead>
                  <tr>
                    <th>Volume Tier</th>
                    <th>Order Quantity</th>
                    <th>FOB Chittagong</th>
                    <th>Sample Credit</th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="tier-row">
                    <td><strong>Tier 1 (MOQ)</strong></td>
                    <td>${item.moq} pcs</td>
                    <td class="price-val">${formatVal(tier1Price)}</td>
                    <td class="credit-val">Standard</td>
                  </tr>
                  <tr class="tier-row">
                    <td><strong>Tier 2 (Volume)</strong></td>
                    <td>${item.moq * 2} pcs</td>
                    <td class="price-val">${formatVal(tier2Price)} <span class="discount">(-5%)</span></td>
                    <td class="credit-val">100% Credited</td>
                  </tr>
                  <tr class="tier-row">
                    <td><strong>Tier 3 (Commercial)</strong></td>
                    <td>${item.moq * 5} pcs</td>
                    <td class="price-val">${formatVal(tier3Price)} <span class="discount">(-10%)</span></td>
                    <td class="credit-val">100% Credited</td>
                  </tr>
                  <tr class="tier-row highlight">
                    <td><strong>Tier 4 (Master FCL)</strong></td>
                    <td>FCL / Annual Contract</td>
                    <td class="price-val">${formatVal(tier4Price)} <span class="discount">(-15%)</span></td>
                    <td class="credit-val">100% Credited + Free Air Sample</td>
                  </tr>
                </tbody>
              </table>
              <div class="pricing-note">
                * Sample development protocol per <strong>SOP-B2B-SMP-2026-V1</strong>: Counter-sample cost (${formatVal(item.samplePriceUsd || 30)}) is 100% credited against initial qualifying bulk commercial order.
              </div>
            </div>

            <!-- Quality & Technical Standards Checklist -->
            <div class="spec-card">
              <div class="spec-card-title">Technical Compliance & Quality Assurance Checklist</div>
              <div class="compliance-bullets">
                <div class="c-item">
                  <span class="c-dot">✔</span>
                  <span><strong>ISO 2859-1 AQL 1.5/2.5</strong> Pre-shipment physical inspection with digital QA-DOC.</span>
                </div>
                <div class="c-item">
                  <span class="c-dot">✔</span>
                  <span><strong>UK REACH Annex XVII & EU SVHC</strong> chemical safety certified (Cr VI &lt; 3mg/kg, Azo-free).</span>
                </div>
                <div class="c-item">
                  <span class="c-dot">✔</span>
                  <span><strong>Container Sealing Protocol:</strong> Barcoded tamper-evident bolt seal with GPS tracking.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Page Footer -->
        <div class="page-footer">
          <div>Ariel Marketing & Communications Limited • Factory Tech-Pack Compendium</div>
          <div class="font-mono">${item.sku} // Confidential OEM Specification</div>
        </div>
      </div>
      `;
    })
    .join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <title>ArielMC Bespoke Sourcing Dossier - ${catalogId}</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 0;
        }

        *, *::before, *::after {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        body {
          margin: 0;
          padding: 0;
          background: #ffffff;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          color: #1e293b;
          font-size: 10px;
          line-height: 1.4;
        }

        .font-mono {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
        }

        /* A4 Page Geometry */
        .a4-page {
          width: 210mm;
          height: 297mm;
          max-height: 297mm;
          padding: 15mm 16mm 13mm 16mm;
          box-sizing: border-box;
          page-break-after: always;
          break-after: page;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          background: #ffffff;
          overflow: hidden;
        }

        .a4-page:last-child {
          page-break-after: avoid;
          break-after: avoid;
        }

        /* ----------------------------------------------------
           PAGE 1: LUXURY COVER PAGE
           ---------------------------------------------------- */
        .cover-page {
          background-color: #0A1A2F !important;
          color: #ffffff;
          padding: 20mm 20mm 16mm 20mm;
          border: 10px solid #071221;
        }

        .cover-inner-border {
          border: 1.5px solid #C9A86A;
          height: 100%;
          padding: 16mm 16mm 14mm 16mm;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
        }

        .cover-top-crest {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(201, 168, 106, 0.4);
          padding-bottom: 12px;
        }

        .cover-logo-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .cover-logo-img {
          height: 48px;
          width: auto;
          object-fit: contain;
        }

        .cover-brand-title {
          font-size: 15px;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin: 0;
        }

        .cover-brand-sub {
          font-size: 8px;
          color: #C9A86A;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 700;
          margin-top: 2px;
        }

        .cover-seal-pill {
          background: rgba(201, 168, 106, 0.15);
          border: 1px solid #C9A86A;
          color: #C9A86A;
          padding: 5px 10px;
          border-radius: 4px;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .cover-hero-title-box {
          margin: 18mm 0 10mm 0;
        }

        .cover-doc-badge {
          display: inline-block;
          font-size: 9px;
          font-weight: 800;
          color: #0A1A2F;
          background: #C9A86A;
          padding: 3px 10px;
          border-radius: 3px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 10px;
        }

        .cover-main-title {
          font-size: 32px;
          font-weight: 900;
          color: #ffffff;
          letter-spacing: -0.02em;
          line-height: 1.1;
          margin: 0 0 8px 0;
          text-transform: uppercase;
        }

        .cover-main-sub {
          font-size: 13px;
          color: #94a3b8;
          font-weight: 500;
          letter-spacing: 0.02em;
          margin: 0;
          max-width: 90%;
          line-height: 1.4;
        }

        /* Consignee Dossier Card on Cover */
        .cover-client-box {
          background: #061325;
          border: 1px solid #C9A86A;
          border-radius: 8px;
          padding: 16px 20px;
          margin-bottom: 15mm;
        }

        .client-box-header {
          font-size: 9px;
          font-weight: 800;
          color: #C9A86A;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          margin-bottom: 10px;
          border-bottom: 1px solid rgba(201, 168, 106, 0.3);
          padding-bottom: 6px;
        }

        .client-box-grid {
          display: grid;
          grid-template-columns: 1.3fr 1.1fr;
          gap: 12px 20px;
          font-size: 10.5px;
        }

        .client-item-lbl {
          font-size: 8px;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 2px;
        }

        .client-item-val {
          font-weight: 700;
          color: #ffffff;
        }

        .client-item-val.highlight {
          color: #C9A86A;
        }

        .cover-bottom-bar {
          border-top: 1px solid rgba(201, 168, 106, 0.4);
          padding-top: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .cover-cert-pills {
          display: flex;
          gap: 6px;
        }

        .cover-cert-pills span {
          font-size: 7.5px;
          font-weight: 700;
          color: #e2e8f0;
          background: rgba(255, 255, 255, 0.08);
          padding: 3px 7px;
          border-radius: 3px;
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .cover-slogan {
          font-size: 8px;
          font-weight: 700;
          color: #C9A86A;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        /* ----------------------------------------------------
           PAGE 2: CORPORATE PROFILE & GOVERNANCE
           ---------------------------------------------------- */
        .page-top-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1.5px solid #0A1A2F;
          padding-bottom: 8px;
          margin-bottom: 12px;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .sector-tag {
          font-size: 9px;
          font-weight: 800;
          color: #0A1A2F;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .group-tag {
          font-size: 9px;
          font-weight: 700;
          color: #C9A86A;
          text-transform: uppercase;
        }

        .sep {
          color: #cbd5e1;
          font-size: 9px;
        }

        .header-right {
          font-size: 8px;
          color: #64748b;
        }

        .page-indicator {
          font-weight: 700;
          color: #0A1A2F;
        }

        .corp-hero {
          margin-bottom: 14px;
        }

        .corp-title {
          font-size: 18px;
          font-weight: 800;
          color: #0A1A2F;
          text-transform: uppercase;
          letter-spacing: -0.01em;
          margin: 0 0 4px 0;
        }

        .corp-sub {
          font-size: 10px;
          color: #C9A86A;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin: 0;
        }

        .mission-vision-box {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 14px;
        }

        .mv-card {
          background: #F8F6F2;
          border: 1px solid #E8D8B8;
          border-radius: 6px;
          padding: 10px 14px;
        }

        .mv-card h4 {
          margin: 0 0 5px 0;
          font-size: 10px;
          font-weight: 800;
          color: #0A1A2F;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .mv-card p {
          margin: 0;
          font-size: 9px;
          color: #334155;
          line-height: 1.45;
        }

        .clusters-section-title {
          font-size: 11px;
          font-weight: 800;
          color: #0A1A2F;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 4px;
          margin-bottom: 10px;
        }

        .clusters-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 8px;
          margin-bottom: 14px;
        }

        .cluster-box {
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 8px;
          background: #ffffff;
        }

        .cluster-num {
          font-size: 9px;
          font-weight: 800;
          color: #C9A86A;
          font-family: ui-monospace, monospace;
        }

        .cluster-name {
          font-size: 9.5px;
          font-weight: 800;
          color: #0A1A2F;
          margin: 2px 0 4px 0;
          line-height: 1.2;
        }

        .cluster-hub {
          font-size: 7.5px;
          color: #64748b;
          line-height: 1.3;
        }

        .governance-block {
          background: #0A1A2F;
          color: #ffffff;
          border-radius: 6px;
          padding: 12px 14px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-bottom: 12px;
        }

        .gov-col h5 {
          margin: 0 0 4px 0;
          font-size: 9px;
          font-weight: 800;
          color: #C9A86A;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .gov-col p {
          margin: 0;
          font-size: 8px;
          color: #cbd5e1;
          line-height: 1.4;
        }

        /* ----------------------------------------------------
           PAGES 3 to N: PRODUCT TECH-PACK PAGES
           ---------------------------------------------------- */
        .product-banner {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          background: #F8F6F2;
          border: 1px solid #E8D8B8;
          border-radius: 6px;
          padding: 10px 14px;
          margin-bottom: 12px;
        }

        .sku-badge {
          display: inline-block;
          font-size: 8.5px;
          font-weight: 800;
          color: #0A1A2F;
          background: #ffffff;
          padding: 2px 6px;
          border-radius: 3px;
          border: 1px solid #cbd5e1;
          margin-bottom: 3px;
        }

        .product-headline {
          font-size: 16px;
          font-weight: 800;
          color: #0A1A2F;
          letter-spacing: -0.01em;
          margin: 0 0 3px 0;
        }

        .tariff-status {
          font-size: 8px;
          display: flex;
          gap: 8px;
        }

        .hs-code {
          color: #065f46;
          font-weight: 700;
          background: #ecfdf5;
          padding: 1px 4px;
          border-radius: 2px;
        }

        .tariff-pref {
          color: #047857;
          font-weight: 600;
        }

        .product-banner-origin {
          text-align: right;
        }

        .origin-label {
          font-size: 7.5px;
          text-transform: uppercase;
          color: #64748b;
          font-weight: 700;
        }

        .origin-val {
          font-size: 9.5px;
          font-weight: 800;
          color: #0A1A2F;
        }

        /* Product 2-Column Grid */
        .product-grid {
          display: grid;
          grid-template-columns: 82mm 1fr;
          gap: 14px;
          flex: 1;
        }

        .hero-image-box {
          width: 100%;
          height: 72mm;
          border-radius: 6px;
          overflow: hidden;
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          margin-bottom: 10px;
        }

        .hero-image-box img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .spec-card {
          border: 1px solid #e2e8f0;
          border-radius: 5px;
          padding: 8px 10px;
          margin-bottom: 8px;
          background: #ffffff;
        }

        .spec-card-title {
          font-size: 8px;
          font-weight: 800;
          color: #0A1A2F;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 6px;
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 3px;
        }

        .spec-card-title.gold {
          color: #92400e;
          border-bottom-color: #fef3c7;
        }

        .dim-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
          font-size: 8.5px;
        }

        .dim-label {
          color: #64748b;
          display: block;
          font-size: 7px;
          text-transform: uppercase;
        }

        .dim-val {
          font-weight: 700;
          color: #0A1A2F;
        }

        .material-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }

        .mat-pill {
          font-size: 7.5px;
          background: #F8F6F2;
          color: #334155;
          padding: 2px 5px;
          border-radius: 3px;
          border: 1px solid #e2e8f0;
          font-weight: 500;
        }

        .lead-row {
          display: flex;
          justify-content: space-between;
          font-size: 8px;
          margin-bottom: 3px;
        }

        .lead-k {
          color: #64748b;
        }

        .lead-v {
          font-weight: 700;
          color: #0A1A2F;
        }

        .techpack-desc {
          margin-bottom: 10px;
        }

        .section-label {
          font-size: 8px;
          font-weight: 800;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 3px;
        }

        .techpack-desc p {
          margin: 0;
          font-size: 8.5px;
          color: #334155;
          line-height: 1.45;
        }

        /* Carton Logistics Table */
        .carton-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 7.8px;
        }

        .carton-table td {
          padding: 3px 4px;
          border-bottom: 1px solid #f1f5f9;
        }

        .carton-table .lbl {
          color: #64748b;
          width: 25%;
        }

        .carton-table .val {
          color: #0A1A2F;
          width: 25%;
        }

        /* Pricing Table */
        .pricing-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 8px;
          margin-top: 4px;
        }

        .pricing-table th {
          background: #0A1A2F;
          color: #ffffff;
          padding: 4px 6px;
          font-size: 7.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          text-align: left;
        }

        .pricing-table td {
          padding: 4px 6px;
          border-bottom: 1px solid #f1f5f9;
        }

        .pricing-table .price-val {
          font-weight: 800;
          color: #0A1A2F;
        }

        .pricing-table .discount {
          font-size: 7px;
          color: #059669;
          font-weight: 700;
        }

        .pricing-table .credit-val {
          font-size: 7.5px;
          color: #92400e;
          font-weight: 600;
        }

        .pricing-table .highlight {
          background-color: #fffbeb;
        }

        .pricing-note {
          font-size: 7px;
          color: #64748b;
          margin-top: 5px;
          line-height: 1.3;
        }

        .compliance-bullets {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .c-item {
          display: flex;
          align-items: flex-start;
          gap: 6px;
          font-size: 7.8px;
          color: #334155;
          line-height: 1.35;
        }

        .c-dot {
          color: #059669;
          font-weight: 800;
        }

        .page-footer {
          border-top: 1px solid #cbd5e1;
          padding-top: 6px;
          display: flex;
          justify-content: space-between;
          font-size: 7.5px;
          color: #94a3b8;
        }

        /* ----------------------------------------------------
           FINAL PAGE: COMMERCIAL TERMS & CONTACTS
           ---------------------------------------------------- */
        .contact-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }

        .protocol-box {
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 10px 12px;
          margin-bottom: 10px;
          background: #ffffff;
        }

        .protocol-box h5 {
          margin: 0 0 4px 0;
          font-size: 9px;
          font-weight: 800;
          color: #0A1A2F;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .protocol-box p {
          margin: 0;
          font-size: 8px;
          color: #475569;
          line-height: 1.4;
        }

        .executive-contact-card {
          background: #0A1A2F;
          color: #ffffff;
          border-radius: 8px;
          padding: 16px;
          border: 1.5px solid #C9A86A;
        }

        .contact-crest {
          font-size: 8px;
          color: #C9A86A;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 12px;
          border-bottom: 1px solid rgba(201, 168, 106, 0.4);
          padding-bottom: 6px;
        }

        .exec-name {
          font-size: 14px;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 2px;
        }

        .exec-role {
          font-size: 8.5px;
          color: #C9A86A;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 12px;
        }

        .exec-info-row {
          margin-bottom: 8px;
          font-size: 8.5px;
        }

        .exec-info-lbl {
          font-size: 7px;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .exec-info-val {
          font-weight: 700;
          color: #ffffff;
        }

        .exec-info-val.gold {
          color: #C9A86A;
        }

        .signoff-box {
          border-top: 1.5px solid #0A1A2F;
          padding-top: 12px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-top: 10px;
        }

        .seal-box {
          border: 1.5px dashed #C9A86A;
          padding: 8px 14px;
          border-radius: 4px;
          text-align: center;
          font-size: 7.5px;
          font-weight: 800;
          color: #0A1A2F;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          background: #F8F6F2;
        }
      </style>
    </head>
    <body>

      <!-- ==============================================================
           PAGE 1: FIXED LUXURY COVER PAGE
           ============================================================== -->
      <div class="a4-page cover-page">
        <div class="cover-inner-border">
          <!-- Top Crest & Logo -->
          <div class="cover-top-crest">
            <div class="cover-logo-row">
              ${logoDataUri ? `<img src="${logoDataUri}" alt="ArielMC" class="cover-logo-img" />` : ''}
              <div>
                <h1 class="cover-brand-title">Ariel Marketing & Communications Limited</h1>
                <div class="cover-brand-sub">Global Sourcing • Export Management • Private Label Development</div>
              </div>
            </div>
            <div class="cover-seal-pill font-mono">CONFIDENTIAL B2B SOURCING DOSSIER</div>
          </div>

          <!-- Hero Title Block -->
          <div class="cover-hero-title-box">
            <div class="cover-doc-badge font-mono">Factory Tech-Pack Compendium & Commercial Roadmap</div>
            <h2 class="cover-main-title">Bespoke Executive Sourcing Dossier</h2>
            <p class="cover-main-sub">
              Customized manufacturing roadmap, physical dimensions, master carton packaging volumetrics, and multi-tier volume pricing across Bangladesh's certified industrial clusters.
            </p>
          </div>

          <!-- Consignee Dossier Box -->
          <div class="cover-client-box font-mono">
            <div class="client-box-header">Verified Consignee & Sourcing Demographics</div>
            <div class="client-box-grid">
              <div>
                <div class="client-item-lbl">Client Entity / Company</div>
                <div class="client-item-val highlight">${consignee.companyName}</div>
              </div>
              <div>
                <div class="client-item-lbl">Dossier Tracking Serial</div>
                <div class="client-item-val highlight">${catalogId}</div>
              </div>
              <div>
                <div class="client-item-lbl">Authorized Sourcing Lead</div>
                <div class="client-item-val">${consignee.contactName} (${consignee.contactEmail})</div>
              </div>
              <div>
                <div class="client-item-lbl">Date of Issue</div>
                <div class="client-item-val">${formattedDate}</div>
              </div>
              <div>
                <div class="client-item-lbl">Destination Port / Target Market</div>
                <div class="client-item-val">${consignee.targetPort || consignee.targetMarket}</div>
              </div>
              <div>
                <div class="client-item-lbl">Commercial IncoTerm</div>
                <div class="client-item-val">${incoTerm}</div>
              </div>
              <div>
                <div class="client-item-lbl">Curated Portfolio Footprint</div>
                <div class="client-item-val">${products.length} Selected OEM/ODM Products</div>
              </div>
              <div>
                <div class="client-item-lbl">Logistics Volumetrics</div>
                <div class="client-item-val">${totalEstimatedCbm || '0.00'} CBM • ~${totalEstimatedWeightKg || 0} kg Gross</div>
              </div>
            </div>
          </div>

          <!-- Bottom Accreditations -->
          <div class="cover-bottom-bar">
            <div class="cover-cert-pills">
              <span>UK DCTS 0% Duty</span>
              <span>EU GSP Duty-Free</span>
              <span>ISO 2859-1 AQL 1.5/2.5</span>
              <span>SOP-B2B-SMP-2026-V1 100% Credit</span>
            </div>
            <div class="cover-slogan">Crafted in Bangladesh. Curated by ArielMC. Delivered Worldwide.</div>
          </div>
        </div>
      </div>

      <!-- ==============================================================
           PAGE 2: CORPORATE PROFILE, MISSION/VISION & INDUSTRIAL HUBS
           ============================================================== -->
      <div class="a4-page profile-page">
        <!-- Top Running Header -->
        <div class="page-top-header">
          <div class="header-left">
            <span class="sector-tag">ArielMC Enterprise Hub</span>
            <span class="sep">/</span>
            <span class="group-tag">Corporate Governance & Industrial Clusters</span>
          </div>
          <div class="header-right font-mono">
            <span>Dossier: ${catalogId}</span>
            <span class="sep">•</span>
            <span class="page-indicator">Page 2 of ${totalPagesCount}</span>
          </div>
        </div>

        <!-- Corporate Hero -->
        <div class="corp-hero">
          <h2 class="corp-title">Corporate Profile & Manufacturing Governance</h2>
          <p class="corp-sub">Championing Bangladesh's Generational Pride Sectors for Global Enterprise Sourcing</p>
        </div>

        <!-- Mission & Vision -->
        <div class="mission-vision-box">
          <div class="mv-card">
            <h4>Institutional Mission</h4>
            <p>
              Ariel Marketing & Communications Limited (<strong>ArielMC</strong>) champions Bangladesh’s generational pride manufacturing industries directly to international retailers, department stores, and corporate brand owners. We bridge global procurement desks with verified Tier-1 production floors through radical transparency, ethical governance, and preferential zero-tariff market access.
            </p>
          </div>
          <div class="mv-card">
            <h4>Global Vision</h4>
            <p>
              To establish Bangladesh as the preferred sustainable manufacturing destination for corporate buyers worldwide by delivering guaranteed ISO 2859-1 AQL 1.5/2.5 pre-shipment quality standards, living wage dignity, zero-carbon and vegetable finishing protocols, and seamless multi-sector blended container logistics.
            </p>
          </div>
        </div>

        <!-- 5 Generational Pride Clusters -->
        <div class="clusters-section-title">The Five Certified Industrial Clusters of Bangladesh</div>
        <div class="clusters-grid">
          <div class="cluster-box">
            <div class="cluster-num">01</div>
            <div class="cluster-name">Leather Compendium</div>
            <div class="cluster-hub">Savar Tannery Estate & Hemayetpur. LWG-audited full-grain leather, REACH compliant, artisan SLGs.</div>
          </div>
          <div class="cluster-box">
            <div class="cluster-num">02</div>
            <div class="cluster-name">Golden Fiber Edit</div>
            <div class="cluster-hub">Narsingdi River Basin. 100% natural biodegradable jute fiber, vegetable batching, zero synthetic runoff.</div>
          </div>
          <div class="cluster-box">
            <div class="cluster-num">03</div>
            <div class="cluster-name">Ceramic Index</div>
            <div class="cluster-hub">Mirzapur Hub. High-fired bone china and stoneware, lead/cadmium-free glazes, LFGB food safe.</div>
          </div>
          <div class="cluster-box">
            <div class="cluster-num">04</div>
            <div class="cluster-name">Thread & Weave</div>
            <div class="cluster-hub">Narayanganj & Gazipur. Sedex/BSCI audited wovens, GOTS organic cotton linens, living wage dignity.</div>
          </div>
          <div class="cluster-box">
            <div class="cluster-num">05</div>
            <div class="cluster-name">Earth & Form</div>
            <div class="cluster-hub">Bengal Clay Artisans. Centuries-old terracotta heritage, frost-resistant architectural tiles, planters.</div>
          </div>
        </div>

        <!-- Governance SOPs -->
        <div class="governance-block">
          <div class="gov-col">
            <h5>ISO 2859-1 AQL 1.5/2.5 Audit (SOP-B2B-QAD-2026)</h5>
            <p>
              Every production lot undergoes rigorous multi-stage pre-shipment inspection. Our technical QA inspectors verify dimensional tolerances (±1mm), Pantone color consistency, tensile seam strength, and chemical safety, generating a comprehensive digital QA Dossier before container stuffing.
            </p>
          </div>
          <div class="gov-col">
            <h5>100% Sample Credit Protocol (SOP-B2B-SMP-2026-V1)</h5>
            <p>
              We stand firmly behind our factory precision. 100% of counter-sample development and international courier fees are credited directly toward qualifying bulk commercial Purchase Orders. Mutilated prototypes are air-freighted under duty-free protocols within 7–10 days.
            </p>
          </div>
        </div>

        <!-- Page Footer -->
        <div class="page-footer">
          <div>Ariel Marketing & Communications Limited • Corporate Sourcing & Governance Desk</div>
          <div class="font-mono">Confidential Demographic Review</div>
        </div>
      </div>

      <!-- ==============================================================
           PAGES 3 to N: INDIVIDUAL PRODUCT TECH-PACK PAGES
           ============================================================== -->
      ${productPagesHtml}

      <!-- ==============================================================
           FINAL PAGE: COMMERCIAL PROTOCOLS & EXECUTIVE CONTACTS
           ============================================================== -->
      <div class="a4-page contact-page">
        <!-- Top Running Header -->
        <div class="page-top-header">
          <div class="header-left">
            <span class="sector-tag">Commercial Execution</span>
            <span class="sep">/</span>
            <span class="group-tag">Trade Protocols & Executive Contacts</span>
          </div>
          <div class="header-right font-mono">
            <span>Dossier: ${catalogId}</span>
            <span class="sep">•</span>
            <span class="page-indicator">Page ${totalPagesCount} of ${totalPagesCount}</span>
          </div>
        </div>

        <!-- Title -->
        <div class="corp-hero">
          <h2 class="corp-title">Commercial Execution & Executive Desk</h2>
          <p class="corp-sub">Incoterms, Payment Governance, IP Protection & Direct Procurement Contacts</p>
        </div>

        <!-- 2-Column Split: Protocols & Executive Contact Card -->
        <div class="contact-grid">
          <!-- Left: Commercial Protocols -->
          <div>
            <div class="protocol-box">
              <h5>IncoTerms & Multi-Modal Freight Logistics</h5>
              <p>
                Baseline pricing quoted under <strong>${incoTerm}</strong>. Sea shipments depart via Chittagong Sea Port; express air cargo routes via DAC (Hazrat Shahjalal International Airport, Dhaka). Through our global freight forwarding network, CIF, DDU, and DDP arrangements to major ports in the UK, Europe, North America, and Australia are fully supported.
              </p>
            </div>

            <div class="protocol-box">
              <h5>Blended Container Consolidation Advantage</h5>
              <p>
                ArielMC uniquely provides blended container consolidation. Buyers can combine products across multiple sectors—such as Leather SLGs, Jute Storage, Bone China Tableware, and Home Textiles—into a single 20ft or 40ft HQ container under 1 unified Bill of Lading, optimizing inventory turnover and reducing ocean freight overhead by up to 35%.
              </p>
            </div>

            <div class="protocol-box">
              <h5>Banking & Payment Protocols</h5>
              <p>
                We accept 100% Irrevocable Letter of Credit (L/C) at sight confirmed by an international Tier-1 bank, or Telegraphic Transfer (T/T) structured as 30% advance deposit upon Tech-Pack signoff and 70% balance payable against inspection certificate and Bill of Lading copy.
              </p>
            </div>

            <div class="protocol-box">
              <h5>Buyer IP, Tooling & Non-Disclosure Guarantee</h5>
              <p>
                All OEM molds, embossing dies, and proprietary buyer tech-packs are strictly protected under mutual Non-Disclosure and Non-Circumvention agreements. Proprietary buyer designs are never commercialized, replicated, or displayed to third parties.
              </p>
            </div>
          </div>

          <!-- Right: Executive Direct Card -->
          <div>
            <div class="executive-contact-card">
              <div class="contact-crest">ArielMC Corporate Sourcing Desk</div>
              <div class="exec-name">Syed Akramul Hassan</div>
              <div class="exec-role">Managing Director & Head of Global Sourcing</div>

              <div class="exec-info-row">
                <div class="exec-info-lbl">Corporate Email</div>
                <div class="exec-info-val gold font-mono">info@arielmc.com</div>
              </div>

              <div class="exec-info-row">
                <div class="exec-info-lbl">Executive Direct Email</div>
                <div class="exec-info-val gold font-mono">tuheen@arielmc.com</div>
              </div>

              <div class="exec-info-row">
                <div class="exec-info-lbl">Corporate Headquarters</div>
                <div class="exec-info-val">Ariel Marketing & Communications Limited<br />Dhaka, Bangladesh</div>
              </div>

              <div class="exec-info-row">
                <div class="exec-info-lbl">Enterprise Digital Portals</div>
                <div class="exec-info-val font-mono">https://arielmc.com<br />https://catalog.arielmc.com</div>
              </div>

              <div class="exec-info-row" style="margin-top: 14px;">
                <div class="exec-info-lbl">Preferential Trade Schemes</div>
                <div class="exec-info-val font-mono" style="font-size: 8px;">
                  • UK DCTS (Developing Countries Trading Scheme) 0% Duty<br />
                  • EU GSP (Generalised Scheme of Preferences) Duty-Free
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Corporate Stamp & Signoff -->
        <div class="signoff-box font-mono">
          <div>
            <div style="font-size: 8.5px; font-weight: 700; color: #0A1A2F;">Ariel Marketing & Communications Limited</div>
            <div style="font-size: 7.5px; color: #64748b;">Enterprise Export Registration & Governance Bureau</div>
            <div style="font-size: 7px; color: #94a3b8; margin-top: 2px;">Dossier Serial: ${catalogId} • Issued: ${formattedDate}</div>
          </div>
          <div class="seal-box">
            <div>★ ARIELMC BANGLADESH ★</div>
            <div style="font-size: 6.5px; color: #C9A86A; margin-top: 2px;">CERTIFIED EXPORT SOURCING SEAL</div>
          </div>
        </div>

        <!-- Page Footer -->
        <div class="page-footer">
          <div>Crafted in Bangladesh. Curated by ArielMC. Delivered Worldwide.</div>
          <div class="font-mono">Page ${totalPagesCount} of ${totalPagesCount}</div>
        </div>
      </div>

    </body>
    </html>
  `;
}

export async function POST(req: NextRequest) {
  let browser: Browser | null = null;

  try {
    const payload: PDFExportPayload = await req.json();

    if (!payload || !payload.products || !Array.isArray(payload.products) || payload.products.length === 0) {
      return NextResponse.json(
        { error: 'Invalid payload: At least one product must be selected for PDF compilation.' },
        { status: 400 }
      );
    }

    const htmlContent = generateArielBespokeDossierHtml(payload);

    browser = await getBrowserInstance();
    const page = await browser.newPage();

    await page.setViewport({ width: 1200, height: 1600, deviceScaleFactor: 2 });

    await page.setContent(htmlContent, {
      waitUntil: ['domcontentloaded', 'networkidle2'],
      timeout: 45000,
    });

    const pdfUint8Array = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: '0mm',
        bottom: '0mm',
        left: '0mm',
        right: '0mm',
      },
    });

    await browser.close();
    browser = null;

    const buffer = Buffer.from(pdfUint8Array);
    const sanitizedCompany = payload.consignee?.companyName?.replace(/[^a-zA-Z0-9]/g, '_') || 'Corporate';

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="ArielMC_Bespoke_Dossier_${sanitizedCompany}_${payload.selectedCurrency || 'USD'}_${Date.now()}.pdf"`,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error: unknown) {
    console.error('Critical Serverless PDF Error:', error);

    if (browser) {
      try {
        await browser.close();
      } catch (closeErr) {
        console.error('Failed to close browser on failure:', closeErr);
      }
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown PDF generation fault';

    return NextResponse.json(
      {
        error: 'ArielMC PDF Compilation Engine Error',
        detail: errorMessage,
      },
      { status: 500 }
    );
  }
}
