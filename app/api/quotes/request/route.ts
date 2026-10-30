import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export interface RFQItem {
  productId?: string;
  sku: string;
  name: string;
  quantity: number;
  targetPrice?: number;
}

export interface RFQRequestPayload {
  clientName: string;
  clientEmail: string;
  companyName: string;
  targetCountry?: string;
  targetPort?: string;
  notes?: string;
  items: RFQItem[];
}

export async function POST(req: NextRequest) {
  try {
    const body: RFQRequestPayload = await req.json();
    const { clientName, clientEmail, companyName, targetCountry, targetPort, notes, items } = body;

    if (!clientName || !clientEmail || !companyName || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing mandatory demographic inputs or empty item array payload.' },
        { status: 400 }
      );
    }

    // Generate atomic RFQ identifier matching ArielMC ERP tracking conventions
    const yearStr = new Date().getFullYear().toString();
    const randomCount = Math.floor(1000 + Math.random() * 9000);
    const quoteNumber = `REQ-${yearStr}-${randomCount}`;

    const quoteRecord = {
      quoteNumber,
      status: 'PENDING',
      source: 'Digital Catalog / arielmc-website',
      clientName,
      clientEmail,
      companyName,
      targetCountry: targetCountry || 'Global',
      targetPort: targetPort || 'CIF Standard',
      notes: notes || '',
      items,
      createdAt: new Date().toISOString(),
    };

    console.log(`[ArielMC ERP Pipeline] New RFQ logged: ${quoteNumber} for ${companyName}`);

    return NextResponse.json(
      {
        success: true,
        message: 'RFQ successfully registered for ArielMC ERP synchronization.',
        quoteNumber,
        quote: quoteRecord,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Critical RFQ pipeline error:', error);
    const detail = error instanceof Error ? error.message : 'Unknown fault';
    return NextResponse.json(
      { error: 'Internal pipeline transaction error.', detail },
      { status: 500 }
    );
  }
}

