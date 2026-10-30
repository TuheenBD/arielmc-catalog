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
 */
function generateArielLineSheetHtml(payload: PDFExportPayload): string {
  const { consignee, products, generatedAt } = payload;
  const formattedDate = new Date(generatedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const yearStr = new Date(generatedAt).getFullYear();
  const catalogId = `AMC-${yearStr}-${Math.floor(1000 + Math.random() * 9000)}`;

  // Embed logo directly as base64
  const logoDataUri = resolveAssetSrc('/brand/logo.png');

  // Defensive table rows
  const tableRowsHtml = products
    .map((item: Product) => {
      const { heightMm, widthMm, depthMm } = item.dimensions;
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
              ? `<div class="origin-tag"><strong>Origin:</strong> ${item.originHub}</div>`
              : ''
          }
        </td>
        <td class="col-sku font-mono">
          <div class="sku-badge">${item.sku}</div>
          <div class="cat-pill">${item.category}</div>
        </td>
        <td class="col-dim font-mono">
          <div>${heightMm} × ${widthMm} × ${depthMm}</div>
          <div class="unit-label">mm (H×W×D)</div>
        </td>
        <td class="col-moq font-mono text-center">
          ${item.moq} <span class="unit-label">units</span>
        </td>
        <td class="col-price font-mono text-right">
          $${item.price.toFixed(2)}
          <div class="fob-label">FOB BGD</div>
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
          font-size: 10.5px;
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
          margin-bottom: 14px;
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
          height: 48px;
          width: auto;
          object-fit: contain;
        }

        .brand-details h1 {
          font-size: 15px;
          font-weight: 800;
          color: #0A1A2F;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin: 0;
        }

        .brand-details .tagline {
          font-size: 8.5px;
          font-weight: 700;
          color: #C9A86A;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-top: 2px;
        }

        .brand-details .promise {
          font-size: 8px;
          color: #64748b;
          font-weight: 500;
          margin-top: 1px;
        }

        .meta-stamp {
          text-align: right;
          font-size: 9.5px;
          color: #64748b;
        }
        .meta-id {
          font-weight: 800;
          color: #0A1A2F;
          font-size: 12px;
        }

        /* Consignee Dossier Box */
        .consignee-box {
          background-color: #F8F6F2;
          border: 1px solid #E8D8B8;
          border-radius: 6px;
          padding: 10px 14px;
          margin-bottom: 16px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .consignee-col h5 {
          margin: 0 0 4px 0;
          font-size: 8.5px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #0A1A2F;
        }

        .consignee-item {
          font-size: 10px;
          color: #3A3A3A;
          margin-bottom: 2px;
        }
        .consignee-item strong {
          color: #0A1A2F;
        }

        /* Table Architecture */
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 8px;
        }

        thead {
          display: table-header-group;
        }

        th {
          background-color: #0A1A2F;
          color: #ffffff;
          padding: 8px 8px;
          font-size: 8.5px;
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
          padding: 8px 6px;
          vertical-align: top;
          font-size: 9.5px;
        }

        /* Column Geometric Bounds */
        .col-thumb { width: 62px; }
        .col-spec { width: 280px; }
        .col-sku { width: 110px; }
        .col-dim { width: 110px; }
        .col-moq { width: 65px; }
        .col-price { width: 75px; }

        .thumb-container {
          width: 54px;
          height: 54px;
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
          font-size: 7.5px;
          font-weight: 700;
          text-transform: uppercase;
          color: #C9A86A;
          letter-spacing: 0.05em;
        }

        .product-title {
          font-weight: 700;
          font-size: 10.5px;
          color: #0A1A2F;
          margin-bottom: 2px;
        }

        .product-desc {
          font-size: 8.5px;
          color: #64748b;
          line-height: 1.3;
          margin-bottom: 4px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .product-materials {
          display: flex;
          flex-wrap: wrap;
          gap: 2.5px;
        }

        .mat-chip {
          display: inline-block;
          font-size: 7px;
          background: #F8F6F2;
          color: #475569;
          padding: 1px 4px;
          border-radius: 2px;
          border: 1px solid #e2e8f0;
        }

        .origin-tag {
          font-size: 7.5px;
          color: #64748b;
          margin-top: 3px;
        }

        .sku-badge {
          font-weight: 700;
          font-size: 9px;
          color: #0A1A2F;
        }

        .cat-pill {
          font-size: 7.5px;
          text-transform: uppercase;
          color: #C9A86A;
          font-weight: 700;
          margin-top: 2px;
        }

        .unit-label {
          font-size: 7px;
          color: #94a3b8;
        }

        .fob-label {
          font-size: 7px;
          color: #C9A86A;
          font-weight: 700;
        }

        /* Compliance & Export Terms Box */
        .compliance-grid {
          page-break-inside: avoid;
          margin-top: 18px;
          padding: 10px 12px;
          background: #ffffff;
          border: 1px solid #0A1A2F;
          border-radius: 6px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          font-size: 8px;
          color: #475569;
        }

        .compliance-grid h6 {
          margin: 0 0 2px 0;
          font-size: 8.5px;
          font-weight: 700;
          color: #0A1A2F;
          text-transform: uppercase;
        }

        .cert-strip {
          margin-top: 4px;
          display: flex;
          gap: 4px;
          flex-wrap: wrap;
        }

        .cert-pill {
          background: #F8F6F2;
          border: 1px solid #C9A86A;
          color: #0A1A2F;
          font-size: 7px;
          font-weight: 700;
          padding: 1px 4px;
          border-radius: 3px;
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
          <div style="color: #C9A86A; font-weight: 700; font-size: 8.5px; margin-top: 2px;">2026/2027 COMPENDIUM</div>
        </div>
      </div>

      <!-- Consignee Profile -->
      <div class="consignee-box">
        <div class="consignee-col">
          <h5>Consignee Demographics</h5>
          <div class="consignee-item"><strong>Company:</strong> ${consignee.companyName}</div>
          <div class="consignee-item"><strong>Authorized Rep:</strong> ${consignee.contactName} (${consignee.contactEmail})</div>
        </div>
        <div class="consignee-col">
          <h5>Logistics & Port Allocation</h5>
          <div class="consignee-item"><strong>Target Market / Port:</strong> ${consignee.targetPort || consignee.targetMarket}</div>
          ${consignee.notes ? `<div class="consignee-item"><strong>Special Directives:</strong> ${consignee.notes}</div>` : ''}
        </div>
      </div>

      <!-- Specification Matrix Table -->
      <table>
        <thead>
          <tr>
            <th class="col-thumb">Item</th>
            <th class="col-spec">Division & Specification</th>
            <th class="col-sku th-gold">SKU / Division</th>
            <th class="col-dim">Dimensions</th>
            <th class="col-moq text-center">Export MOQ</th>
            <th class="col-price text-right th-gold">Price (USD)</th>
          </tr>
        </thead>
        <tbody>
          ${tableRowsHtml}
        </tbody>
      </table>

      <!-- Commercial Compliance Block -->
      <div class="compliance-grid">
        <div>
          <h6>Incoterms & Export Governance</h6>
          <div>All quoted values represent baseline FOB Chittagong Port pricing unless explicitly contracted as CIF. Production begins upon receipt of confirmed Letter of Credit (L/C). Standard lead time: 2–5 weeks.</div>
          <div class="cert-strip">
            <span class="cert-pill">LWG Audited</span>
            <span class="cert-pill">GOTS Organic</span>
            <span class="cert-pill">OEKO-TEX 100</span>
          </div>
        </div>
        <div>
          <h6>Quality Control & Plant Quarantine</h6>
          <div>Every commercial batch passes strict ISO 105-X12 tests, 15 kg dynamic pull tests, DAE Plant Quarantine Phytosanitary Certification, and third-party Fumigation before loading at Chittagong Port.</div>
          <div class="cert-strip">
            <span class="cert-pill">BSCI & Sedex</span>
            <span class="cert-pill">FDA / LFGB Food Contact</span>
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
          <span>Ariel Marketing & Communications Limited • Global Sourcing & Export Management</span>
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
        'Content-Disposition': `attachment; filename="ArielMC_Master_LineSheet_${Date.now()}.pdf"`,
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
