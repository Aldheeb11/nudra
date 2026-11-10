/**
 * Setup endpoint — verifies data layer is ready.
 * Reports the static categories + local-dev sample catalog.
 * Call GET /api/setup-cms to confirm everything is wired correctly.
 * DELETE this route before going to production.
 */
import { NextResponse } from 'next/server'
import { CATEGORIES, SAMPLE_PRODUCTS } from '@/lib/catalog'

export const runtime = 'edge'

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: 'Static catalog loaded.',
    categories: CATEGORIES.length,
    sampleProducts: SAMPLE_PRODUCTS.length,
    catalogDetails: {
      categories: CATEGORIES.map((c) => ({ id: c._id, name: c.name, slug: c.slug })),
      products: SAMPLE_PRODUCTS.map((p) => ({ id: p._id, title: p.title, category: p.category })),
    },
  })
}
