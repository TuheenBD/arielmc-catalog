import { NextRequest, NextResponse } from 'next/server';
import { MOCK_PRODUCTS } from '@/data/mockProducts';

export const dynamic = 'force-dynamic';

/**
 * Endpoint for arielmc-website and ArielMC - ERP to query active catalog items
 * Supports query params: ?category=Leather&search=folio&limit=10
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search')?.toLowerCase();
  const limit = parseInt(searchParams.get('limit') || '100', 10);

  let results = [...MOCK_PRODUCTS];

  if (category) {
    results = results.filter(
      (p) => p.category.toLowerCase() === category.toLowerCase()
    );
  }

  if (search) {
    results = results.filter(
      (p) =>
        p.name.toLowerCase().includes(search) ||
        p.sku.toLowerCase().includes(search) ||
        p.description.toLowerCase().includes(search) ||
        p.materials.some((m) => m.toLowerCase().includes(search))
    );
  }

  return NextResponse.json({
    system: 'ArielMC Digital Catalog Hub',
    total: results.length,
    products: results.slice(0, limit),
  });
}

