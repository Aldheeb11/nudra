import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AliProduct } from '@/lib/aliexpress'

const fetchProductsPage = vi.fn()
vi.mock('@/lib/aliexpress', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/aliexpress')>()),
  fetchProductsPage: (...args: unknown[]) => fetchProductsPage(...args),
}))

// Minimal stand-in for the postgres.js tagged template: records every statement
const statements: { text: string; rows?: { id: string; category: string }[] }[] = []
const sql = Object.assign(
  (first: unknown, ...values: unknown[]) => {
    if (!Array.isArray(first) || !('raw' in first)) return { rows: first } // sql(rows) helper
    const text = (first as unknown as string[]).join('?')
    const helper = values.find((v): v is { rows: { id: string; category: string }[] } => !!v && typeof v === 'object' && 'rows' in v)
    statements.push({ text, rows: helper?.rows })
    return Promise.resolve(Object.assign([], { count: text.includes('DELETE') ? 3 : 0 }))
  },
  {},
)
vi.mock('@/lib/db', () => ({ getSql: () => sql, ensureSchema: vi.fn(async () => {}), hasDatabase: () => true }))

import { runSync } from '@/lib/sync'

const product = (id: string): AliProduct => ({
  id, title: `p${id}`, price: 1, originalPrice: null, currency: 'USD',
  image: 'https://x/i.jpg', affiliateUrl: 'https://x/a', rating: null, soldCount: 0,
})
const page = (ids: string[], rawCount = ids.length) => ({ products: ids.map(product), rawCount })
const inserted = () => statements.filter((s) => s.text.includes('INSERT')).flatMap((s) => s.rows ?? [])

beforeEach(() => {
  statements.length = 0
  fetchProductsPage.mockReset()
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('runSync', () => {
  it('stores each product once, under the first category that returned it', async () => {
    fetchProductsPage.mockImplementation(async (categoryIds: string) =>
      categoryIds === '44,509,7' ? page(['a', 'b']) : categoryIds === '15' ? page(['b', 'c']) : page([]),
    )
    const result = await runSync()

    expect(inserted().map((r) => `${r.category}:${r.id}`)).toEqual(['electronics:a', 'electronics:b', 'home-garden:c'])
    expect(result.upserted).toBe(3)
    expect(result.categories['home-garden']).toEqual({ upserted: 1 })
  })

  it('keeps paging while the raw page is full, even if items were filtered out', async () => {
    vi.stubEnv('ALIEXPRESS_PAGES_PER_CATEGORY', '3')
    fetchProductsPage.mockImplementation(async (categoryIds: string, pageNo: number) => {
      if (categoryIds !== '66') return page([])
      return pageNo === 1 ? page(['a'], 50) : page(['b'], 7) // page 1 full before filtering, page 2 short
    })
    await runSync()

    const beautyCalls = fetchProductsPage.mock.calls.filter(([ids]) => ids === '66').map(([, n]) => n)
    expect(beautyCalls).toEqual([1, 2])
  })

  it('records a failing category and continues with the rest', async () => {
    fetchProductsPage.mockImplementation(async (categoryIds: string) => {
      if (categoryIds === '34') throw new Error('ApiCallLimit')
      return categoryIds === '1420,13' ? page(['t1']) : page([])
    })
    const result = await runSync()

    expect(result.categories.automotive).toEqual({ upserted: 0, error: 'ApiCallLimit' })
    expect(result.categories['tools-diy']).toEqual({ upserted: 1 })
  })

  it('removes stale listings only after a run that stored something', async () => {
    fetchProductsPage.mockResolvedValue(page(['a']))
    expect((await runSync()).removed).toBe(3)
    expect(statements.some((s) => s.text.includes('DELETE'))).toBe(true)

    statements.length = 0
    fetchProductsPage.mockRejectedValue(new Error('down'))
    const failed = await runSync()
    expect(failed).toMatchObject({ upserted: 0, removed: 0 })
    expect(statements.some((s) => s.text.includes('DELETE'))).toBe(false)
  })
})
