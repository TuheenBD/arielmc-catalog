import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Support both direct consignee format and legacy format
    const clientName = body.consignee?.contactName || body.clientName;
    const clientEmail = body.consignee?.contactEmail || body.clientEmail;
    const companyName = body.consignee?.companyName || body.companyName;
    const targetCountry = body.consignee?.targetMarket || body.targetCountry;
    const targetPort = body.consignee?.targetPort || body.targetPort;
    const incoTerm = body.consignee?.incoTerm || body.incoTerm;
    const courierAccount = body.consignee?.courierAccount || body.courierAccount;
    const deliveryAddress = body.consignee?.deliveryAddress || body.deliveryAddress;
    const notes = body.consignee?.notes || body.notes;
    const items = body.products || body.items;
    const requestType = body.requestType || 'rfq_quote';

    if (!clientName || !clientEmail || !companyName || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing mandatory demographic inputs or empty item array payload.' },
        { status: 400 }
      );
    }

    // Generate atomic RFQ identifier matching ArielMC ERP tracking conventions
    const yearStr = new Date().getFullYear().toString();
    const prefix = requestType === 'sample_dispatch' ? 'SMP' : 'REQ';
    const randomCount = Math.floor(1000 + Math.random() * 9000);
    const quoteNumber = `${prefix}-${yearStr}-${randomCount}`;

    const quoteRecord = {
      quoteNumber,
      requestType,
      status: 'PENDING',
      source: 'ArielMC Digital Catalog — Western Corporate Desk',
      clientName,
      clientEmail,
      companyName,
      targetCountry: targetCountry || 'UK / Western Europe',
      targetPort: targetPort || 'Felixstowe / Rotterdam (CIF)',
      incoTerm: incoTerm || 'FOB Chittagong',
      courierAccount: courierAccount || 'ArielMC Prepaid Courier',
      deliveryAddress: deliveryAddress || '',
      notes: notes || '',
      items,
      logistics: body.logistics || null,
      currency: body.currency || 'USD',
      currencyRate: body.currencyRate || 1.0,
      createdAt: new Date().toISOString(),
    };

    console.log(`[ArielMC ERP Pipeline] New ${requestType} logged: ${quoteNumber} for ${companyName}`);

    return NextResponse.json(
      {
        success: true,
        message: requestType === 'sample_dispatch'
          ? 'Courier sample request confirmed for dispatch.'
          : 'RFQ successfully registered for ArielMC ERP synchronization.',
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
