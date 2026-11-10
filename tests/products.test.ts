import { describe, expect, it, vi } from 'vitest'

vi.mock('next/cache', () => ({ unstable_cache: (fn: unknown) => fn }))

import { SAMPLE_PRODUCTS } from '@/lib/catalog'
import { discountPercent, formatCount, formatPrice } from '@/lib/format'
import {
  countProducts, fallbackDuringBuild, getFeaturedProducts, getProductById, getProducts, isCategorySlug, normalizeQuery,
} from '@/lib/products'

// No DATABASE_URL in tests → the sample catalog is the data source

describe('normalizeQuery', () => {
  it('trims, caps the length and treats blank as no query', () => {
    expect(normalizeQuery('  watch ')).toBe('watch')
    expect(normalizeQuery('   ')).toBeUndefined()
    expect(normalizeQuery(null)).toBeUndefined()
    expect(normalizeQuery('x'.repeat(200))).toHaveLength(80)
  })
})

describe('getProducts (sample catalog)', () => {
  it('paginates with a cursor and reports when there is no next page', async () => {
    const first = await getProducts({ limit: 4 })
    expect(first.products).toHaveLength(4)
    expect(first.nextCursor).toBe('4')

    const second = await getProducts({ limit: 4, cursor: first.nextCursor })
    expect(second.products.map((p) => p._id)).toEqual(SAMPLE_PRODUCTS.slice(4).map((p) => p._id))
    expect(second.nextCursor).toBeUndefined()
  })

  it('ignores a malformed or negative cursor', async () => {
    const all = await getProducts()
    expect((await getProducts({ cursor: 'abc' })).products).toEqual(all.products)
    expect((await getProducts({ cursor: '-5' })).products).toEqual(all.products)
  })

  it('filters by category slug and returns nothing for an unknown one', async () => {
    const { products } = await getProducts({ category: 'electronics' })
    expect(products.length).toBeGreaterThan(0)
    expect(products.every((p) => p.category === 'electronics')).toBe(true)
    expect((await getProducts({ category: 'nope' })).products).toEqual([])
    expect(isCategorySlug('electronics')).toBe(true)
    expect(isCategorySlug('cat_electronics')).toBe(false)
  })

  it('searches titles case-insensitively, optionally within a category', async () => {
    expect((await getProducts({ q: 'WATCH' })).products.map((p) => p._id)).toEqual(['prod_002'])
    expect((await getProducts({ q: 'watch', category: 'beauty-health' })).products).toEqual([])
    expect(await countProducts({ q: 'watch' })).toBe(1)
    expect(await countProducts()).toBe(SAMPLE_PRODUCTS.length)
    expect(await countProducts({ category: 'nope' })).toBe(0)
  })

  it('clamps the page size', async () => {
    expect((await getProducts({ limit: 0 })).products).toHaveLength(1)
  })
})

describe('getProductById', () => {
  it('finds a product and rejects ids that are not plain tokens', async () => {
    expect((await getProductById('prod_001'))?.title).toBe(SAMPLE_PRODUCTS[0].title)
    expect(await getProductById('missing')).toBeNull()
    expect(await getProductById('../etc/passwd')).toBeNull()
    expect(await getProductById("1' OR '1'='1")).toBeNull()
  })
})

describe('getFeaturedProducts', () => {
  it('returns at most the requested number', async () => {
    const featured = await getFeaturedProducts(2)
    expect(featured).toHaveLength(2)
    expect(featured.every((p) => p.isFeatured)).toBe(true)
  })
})

describe('fallbackDuringBuild', () => {
  it('swallows the error only while building', () => {
    const boom = new Error('db down')
    expect(() => fallbackDuringBuild([])(boom)).toThrow(boom)

    vi.stubEnv('NEXT_PHASE', 'phase-production-build')
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(fallbackDuringBuild(['x'])(boom)).toEqual(['x'])
  })
})

describe('format', () => {
  it('formats prices and counts independent of locale', () => {
    expect(formatPrice(5)).toBe('$5.00')
    expect(formatCount(15234)).toBe('15,234')
  })

  it('computes a discount only when the original price is higher', () => {
    expect(discountPercent({ price: 12.99, originalPrice: 29.99 })).toBe(57)
    expect(discountPercent({ price: 10, originalPrice: 10 })).toBeNull()
    expect(discountPercent({ price: 10 })).toBeNull()
    expect(discountPercent({ price: 9.99, originalPrice: 10 })).toBeNull() // rounds to 0%
  })
})
