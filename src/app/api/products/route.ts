import { NextRequest, NextResponse } from 'next/server'
import { MAX_QUERY_LENGTH, getProducts, isCategorySlug, normalizeQuery } from '@/lib/products'

const MAX_CURSOR = 10_000 // deep OFFSETs are slow and never reached by real browsing

function badRequest(error: string) {
  return NextResponse.json({ error }, { status: 400, headers: { 'Cache-Control': 'no-store' } })
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const cursor   = searchParams.get('cursor')   ?? undefined
  const category = searchParams.get('category') ?? undefined
  const rawQ     = searchParams.get('q')        ?? undefined

  if (cursor !== undefined && (!/^\d{1,6}$/.test(cursor) || Number(cursor) > MAX_CURSOR)) {
    return badRequest('Invalid cursor')
  }
  if (category !== undefined && !isCategorySlug(category)) {
    return badRequest('Unknown category')
  }
  if (rawQ !== undefined && rawQ.length > MAX_QUERY_LENGTH) {
    return badRequest('Query too long')
  }

  try {
    const data = await getProducts({ cursor, category, q: normalizeQuery(rawQ), limit: 24 })
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
    })
  } catch (err) {
    console.error('[/api/products]', err)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}
