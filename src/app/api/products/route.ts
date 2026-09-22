import { NextRequest, NextResponse } from 'next/server'
import { getProducts } from '@/lib/wix'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const cursor     = searchParams.get('cursor')     ?? undefined
  const categoryId = searchParams.get('category')  ?? undefined

  try {
    const data = await getProducts({ cursor, categoryId, limit: 24 })
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
    })
  } catch (err) {
    console.error('[/api/products]', err)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}
