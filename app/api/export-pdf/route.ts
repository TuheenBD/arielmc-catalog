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
 * Resolves the Chromium binary path defensively across Vercel serverless
 * and local environments (macOS, Linux, Windows).
 */
async function getBrowserInstance(): Promise<Browser> {
  const isProduction = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;

  if (isProduction) {
    return await puppeteer.launch({
      args: [...chromium.args, '--hide-scrollbars', '--disable-web-security', '--disable-dev-shm-usage'],
      defaultViewport: {
        width: 1200,
        height: 1600,
        deviceScaleFactor: 2,
      },
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  }

  const localPaths = [
    process.env.CHROME_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
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
 * Builds the official ArielMC Master Export Compendium line sheet HTML.
 * Adheres strictly to the ArielMC Brand Guideline (#0A1A2F Corporate Navy, #C9A86A Gold, Montserrat & Open Sans).
 * Includes Western Corporate Procurement specifications (HS Tariff Codes, Master Carton CBM, IncoTerms).
 */
function generateArielLineSheetHtml(payload: PDFExportPayload): string {
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
    month: 'short',
    day: 'numeric',
  });

  const yearStr = new Date(generatedAt).getFullYear();
  const catalogId = `AMC-${yearStr}-${Math.floor(1000 + Math.random() * 9000)}`;

  // Embed logo directly as base64
  const logoDataUri = resolveAssetSrc('/brand/logo.png');

  // Format currency helper
  const formatVal = (usdPrice: number): string => {
    const converted = usdPrice * currencyRate;
    return converted >= 100
      ? `${currencySymbol}${Math.round(converted).toLocaleString('en-US')}`
      : `${currencySymbol}${(Math.round(converted * 10) / 10).toFixed(2)}`;
  };

  // Table rows with Western Corporate specifics
  const tableRowsHtml = products
    .map((item: Product) => {
      const { heightMm, widthMm, depthMm } = item.dimensions;
      const carton = item.masterCarton;
      const resolvedImg = resolveAssetSrc(item.imageUrl);

      return `
      <tr class="item-row">
        <td class="col-thumb">
          <div class="thumb-container">
            <img src="${resolvedImg}" alt="${item.name}" />
          </div>
        </td>
        <td class="col-spec">
          <div class="division-tag">${item.divisionTitle || item.category}</div>
          <div class="product-title">${item.name}</div>
          <div class="product-desc">${item.description}</div>
          <div class="product-materials">
            ${item.materials.map((m) => `<span class="mat-chip">${m}</span>`).join('')}
          </div>
          ${
            item.originHub
              ? `<div class="origin-tag"><strong>Hub:</strong> ${item.originHub}</div>`
              : ''
          }
        </td>
        <td class="col-sku font-mono">
          <div class="sku-badge">${item.sku}</div>
          <div class="cat-pill">${item.category}</div>
          <div class="hs-badge">HS ${item.hsCode}</div>
          ${item.tariffPreferences ? `<div class="pref-note">${item.tariffPreferences[0]}</div>` : ''}
        </td>
        <td class="col-dim font-mono">
          <div>${heightMm} × ${widthMm} × ${depthMm}</div>
          <div class="unit-label">mm (H×W×D)</div>
          ${
            carton
              ? `<div class="carton-note">${carton.unitsPerCarton} pcs/ctn • ${carton.cbm} CBM</div>`
              : ''
          }
        </td>
        <td class="col-moq font-mono text-center">
          ${item.moq} <span class="unit-label">units</span>
          <div class="sample-lead">Sample: ${item.sampleLeadTimeDays}d</div>
        </td>
        <td class="col-price font-mono text-right">
          <div class="price-val">${formatVal(item.price)}</div>
          <div class="fob-label">${incoTerm ? incoTerm.split(' ')[0] : 'FOB'} BGD</div>
          ${
            selectedCurrency !== 'USD'
              ? `<div class="usd-base font-mono">($${item.price} USD)</div>`
              : ''
          }
        </td>
      </tr>
    `;
    })
    .join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <title>ArielMC Sourcing Line Sheet - ${catalogId}</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 14mm 12mm 14mm 12mm;
        }

        *, *::before, *::after {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Open Sans", Helvetica, Arial, sans-serif;
          color: #3A3A3A;
          background: #ffffff;
          margin: 0;
          padding: 0;
          font-size: 10px;
          line-height: 1.4;
        }

        .font-mono {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        }
        .text-right { text-align: right; }
        .text-center { text-align: center; }

        /* ArielMC Corporate Header */
        .header-container {
          border-bottom: 2.5px solid #0A1A2F;
          padding-bottom: 12px;
          margin-bottom: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .brand-block {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo-img {
          height: 46px;
          width: auto;
          object-fit: contain;
        }

        .brand-details h1 {
          font-size: 14.5px;
          font-weight: 800;
          color: #0A1A2F;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin: 0;
        }

        .brand-details .tagline {
          font-size: 8px;
          font-weight: 700;
          color: #C9A86A;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-top: 2px;
        }

        .brand-details .promise {
          font-size: 7.5px;
          color: #64748b;
          font-weight: 500;
          margin-top: 1px;
        }

        .meta-stamp {
          text-align: right;
          font-size: 9px;
          color: #64748b;
        }
        .meta-id {
          font-weight: 800;
          color: #0A1A2F;
          font-size: 11.5px;
        }

        /* Consignee Dossier Box */
        .consignee-box {
          background-color: #F8F6F2;
          border: 1px solid #E8D8B8;
          border-radius: 6px;
          padding: 9px 12px;
          margin-bottom: 12px;
          display: grid;
          grid-template-columns: 1.2fr 1.2fr 1fr;
          gap: 12px;
        }

        .consignee-col h5 {
          margin: 0 0 4px 0;
          font-size: 8px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #0A1A2F;
        }

        .consignee-item {
          font-size: 9.5px;
          color: #3A3A3A;
          margin-bottom: 2px;
        }
        .consignee-item strong {
          color: #0A1A2F;
        }

        /* Logistics Summary Bar */
        .logistics-bar {
          background: #0A1A2F;
          color: #ffffff;
          padding: 6px 12px;
          border-radius: 4px;
          margin-bottom: 10px;
          display: flex;
          justify-content: space-between;
          font-size: 8.5px;
        }
        .logistics-bar strong {
          color: #C9A86A;
        }

        /* Table Architecture */
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 4px;
        }

        thead {
          display: table-header-group;
        }

        th {
          background-color: #0A1A2F;
          color: #ffffff;
          padding: 7px 6px;
          font-size: 8px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          border: 1px solid #0A1A2F;
        }

        th.th-gold {
          color: #C9A86A;
        }

        .item-row {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
          border-bottom: 1px solid #e2e8f0;
        }

        td {
          padding: 7px 5px;
          vertical-align: top;
          font-size: 9px;
        }

        /* Column Geometric Bounds */
        .col-thumb { width: 58px; }
        .col-spec { width: 260px; }
        .col-sku { width: 120px; }
        .col-dim { width: 110px; }
        .col-moq { width: 65px; }
        .col-price { width: 85px; }

        .thumb-container {
          width: 50px;
          height: 50px;
          border-radius: 4px;
          overflow: hidden;
          background: #F8F6F2;
          border: 1px solid #E8D8B8;
        }

        .thumb-container img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .division-tag {
          font-size: 7px;
          font-weight: 700;
          text-transform: uppercase;
          color: #C9A86A;
          letter-spacing: 0.05em;
        }

        .product-title {
          font-weight: 700;
          font-size: 10px;
          color: #0A1A2F;
          margin-bottom: 2px;
        }

        .product-desc {
          font-size: 8px;
          color: #64748b;
          line-height: 1.3;
          margin-bottom: 3px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .product-materials {
          display: flex;
          flex-wrap: wrap;
          gap: 2px;
        }

        .mat-chip {
          display: inline-block;
          font-size: 6.5px;
          background: #F8F6F2;
          color: #475569;
          padding: 1px 3px;
          border-radius: 2px;
          border: 1px solid #e2e8f0;
        }

        .origin-tag {
          font-size: 7px;
          color: #64748b;
          margin-top: 2px;
        }

        .sku-badge {
          font-weight: 700;
          font-size: 8.5px;
          color: #0A1A2F;
        }

        .cat-pill {
          font-size: 7px;
          text-transform: uppercase;
          color: #C9A86A;
          font-weight: 700;
          margin-top: 1px;
        }

        .hs-badge {
          display: inline-block;
          font-size: 7px;
          font-weight: 700;
          color: #065f46;
          background: #ecfdf5;
          padding: 1px 3px;
          border-radius: 2px;
          margin-top: 2px;
          border: 1px solid #a7f3d0;
        }

        .pref-note {
          font-size: 6.5px;
          color: #047857;
          margin-top: 1px;
        }

        .carton-note {
          font-size: 6.8px;
          color: #C9A86A;
          font-weight: 600;
          margin-top: 2px;
        }

        .unit-label {
          font-size: 6.5px;
          color: #94a3b8;
        }

        .sample-lead {
          font-size: 6.8px;
          color: #059669;
          font-weight: 600;
          margin-top: 2px;
        }

        .price-val {
          font-size: 11px;
          font-weight: 800;
          color: #0A1A2F;
        }

        .fob-label {
          font-size: 6.5px;
          color: #C9A86A;
          font-weight: 700;
        }

        .usd-base {
          font-size: 6.5px;
          color: #94a3b8;
        }

        /* Compliance & Export Terms Box */
        .compliance-grid {
          page-break-inside: avoid;
          margin-top: 14px;
          padding: 9px 12px;
          background: #ffffff;
          border: 1px solid #0A1A2F;
          border-radius: 6px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          font-size: 7.5px;
          color: #475569;
        }

        .compliance-grid h6 {
          margin: 0 0 2px 0;
          font-size: 8px;
          font-weight: 700;
          color: #0A1A2F;
          text-transform: uppercase;
        }

        .cert-strip {
          margin-top: 4px;
          display: flex;
          gap: 3px;
          flex-wrap: wrap;
        }

        .cert-pill {
          background: #F8F6F2;
          border: 1px solid #C9A86A;
          color: #0A1A2F;
          font-size: 6.5px;
          font-weight: 700;
          padding: 1px 3px;
          border-radius: 2px;
        }
      </style>
    </head>
    <body>
      <!-- Master Header -->
      <div class="header-container">
        <div class="brand-block">
          ${logoDataUri ? `<img src="${logoDataUri}" alt="ArielMC" class="logo-img" />` : ''}
          <div class="brand-details">
            <h1>Ariel Marketing & Communications Limited</h1>
            <div class="tagline">Global Sourcing • Export Management • Private Label Brand Development</div>
            <div class="promise">Crafted in Bangladesh. Curated by ArielMC. Delivered Worldwide.</div>
          </div>
        </div>
        <div class="meta-stamp">
          <div class="meta-id font-mono">${catalogId}</div>
          <div>Issued: ${formattedDate}</div>
          <div style="color: #C9A86A; font-weight: 700; font-size: 8px; margin-top: 2px;">WESTERN CORPORATE EDITION</div>
        </div>
      </div>

      <!-- Consignee Profile -->
      <div class="consignee-box">
        <div class="consignee-col">
          <h5>Consignee Entity</h5>
          <div class="consignee-item"><strong>Company:</strong> ${consignee.companyName}</div>
          <div class="consignee-item"><strong>Contact:</strong> ${consignee.contactName} (${consignee.contactEmail})</div>
          ${consignee.courierAccount ? `<div class="consignee-item"><strong>Courier Acct:</strong> ${consignee.courierAccount}</div>` : ''}
        </div>
        <div class="consignee-col">
          <h5>Port Routing & IncoTerm</h5>
          <div class="consignee-item"><strong>IncoTerm:</strong> ${incoTerm}</div>
          <div class="consignee-item"><strong>Target Port / Territory:</strong> ${consignee.targetPort || consignee.targetMarket}</div>
          ${consignee.notes ? `<div class="consignee-item"><strong>Notes:</strong> ${consignee.notes}</div>` : ''}
        </div>
        <div class="consignee-col">
          <h5>Tariff & Trade Status</h5>
          <div class="consignee-item"><strong>Duty Program:</strong> UK DCTS / EU GSP 0%</div>
          <div class="consignee-item"><strong>Curated Items:</strong> ${products.length} Products</div>
          <div class="consignee-item"><strong>Currency:</strong> ${selectedCurrency} (${currencySymbol})</div>
        </div>
      </div>

      <!-- Logistics Volume Summary -->
      ${
        totalEstimatedCbm
          ? `
      <div class="logistics-bar font-mono">
        <div>Total Est. Volume: <strong>${totalEstimatedCbm} CBM</strong></div>
        <div>Master Cartons: <strong>${totalEstimatedCartons || 'Calculated'} Units</strong></div>
        <div>Gross Weight: <strong>~${totalEstimatedWeightKg || '0'} kg</strong></div>
        <div>Sea Freight: <strong>20ft / 40ft HQ Loadable</strong></div>
      </div>
      `
          : ''
      }

      <!-- Specification Matrix Table -->
      <table>
        <thead>
          <tr>
            <th class="col-thumb">Item</th>
            <th class="col-spec">Division & Specification</th>
            <th class="col-sku th-gold">SKU / HS Tariff Code</th>
            <th class="col-dim">Dimensions & Packaging</th>
            <th class="col-moq text-center">Export MOQ</th>
            <th class="col-price text-right th-gold">Price (${selectedCurrency})</th>
          </tr>
        </thead>
        <tbody>
          ${tableRowsHtml}
        </tbody>
      </table>

      <!-- Commercial Compliance Block -->
      <div class="compliance-grid">
        <div>
          <h6>Incoterms, Duty Preferences & Payment</h6>
          <div>Quoted baseline is ${incoTerm}. All shipments eligible for 0% Preferential Duty under UK DCTS and EU GSP (Certificate of Origin / Form A provided). Standard payment: 30% advance T/T, 70% against shipping documents, or 100% Irrevocable L/C at sight from prime international bank.</div>
          <div class="cert-strip">
            <span class="cert-pill">UK DCTS 0% Duty</span>
            <span class="cert-pill">EU GSP Duty-Free</span>
            <span class="cert-pill">LWG Audited</span>
            <span class="cert-pill">GOTS Organic</span>
          </div>
        </div>
        <div>
          <h6>Quality Assurance & Quarantine Clearance</h6>
          <div>Every commercial batch passes strict AQL 1.5/2.5 inspection, ISO color fastness testing, DAE Plant Quarantine Phytosanitary Certification, and third-party Fumigation prior to vessel loading. Counter-samples dispatched via DHL/FedEx Express in 7-10 days.</div>
          <div class="cert-strip">
            <span class="cert-pill">BSCI Grade A</span>
            <span class="cert-pill">Sedex SMETA</span>
            <span class="cert-pill">LFGB Food Safe</span>
            <span class="cert-pill">DAE Phytosanitary</span>
          </div>
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

    const htmlContent = generateArielLineSheetHtml(payload);

    browser = await getBrowserInstance();
    const page = await browser.newPage();

    await page.setViewport({ width: 1200, height: 1600 });

    await page.setContent(htmlContent, {
      waitUntil: ['load', 'networkidle0'],
      timeout: 30000,
    });

    const pdfUint8Array = await page.pdf({
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: `
        <div style="width: 100%; font-size: 8px; color: #64748b; font-family: -apple-system, sans-serif; padding: 0 12mm; display: flex; justify-content: space-between; align-items: center;">
          <span>Ariel Marketing & Communications Limited • Western Corporate Procurement Desk</span>
          <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
        </div>
      `,
      margin: {
        top: '14mm',
        bottom: '14mm',
        left: '12mm',
        right: '12mm',
      },
    });

    await browser.close();
    browser = null;

    const buffer = Buffer.from(pdfUint8Array);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="ArielMC_Master_LineSheet_${payload.selectedCurrency || 'USD'}_${Date.now()}.pdf"`,
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
