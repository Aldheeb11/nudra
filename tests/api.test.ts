import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('next/cache', () => ({
  unstable_cache: (fn: unknown) => fn,
  revalidateTag: vi.fn(),
  revalidatePath: vi.fn(),
}))

const runSync = vi.fn()
vi.mock('@/lib/sync', () => ({ runSync: () => runSync() }))

import { revalidatePath, revalidateTag } from 'next/cache'
import { GET as getProducts } from '@/app/api/products/route'
import { GET as getSync } from '@/app/api/sync/route'

const req = (path: string, headers?: Record<string, string>) => new NextRequest(`http://localhost${path}`, { headers })

describe('GET /api/products', () => {
  it('returns a page of products with a CDN cache header', async () => {
    const res = await getProducts(req('/api/products?category=electronics'))
    expect(res.status).toBe(200)
    expect(res.headers.get('cache-control')).toContain('s-maxage=3600')
    const body = await res.json()
    expect(body.products.length).toBeGreaterThan(0)
  })

  it.each([
    ['cursor=-5'], ['cursor=abc'], ['cursor=1.5'], ['cursor=999999'], ['cursor='],
    ['category=nope'], [`q=${'x'.repeat(81)}`],
  ])('rejects %s with 400 and no caching', async (query) => {
    const res = await getProducts(req(`/api/products?${query}`))
    expect(res.status).toBe(400)
    expect(res.headers.get('cache-control')).toBe('no-store')
  })
})

describe('GET /api/sync', () => {
  beforeEach(() => {
    runSync.mockReset()
    vi.mocked(revalidateTag).mockClear()
    vi.mocked(revalidatePath).mockClear()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it.each([[undefined], ['']])('is closed when CRON_SECRET is %j', async (secret) => {
    vi.stubEnv('CRON_SECRET', secret) // undefined deletes the variable
    for (const auth of [undefined, 'Bearer undefined', 'Bearer', 'Bearer null']) {
      const res = await getSync(req('/api/sync', auth ? { authorization: auth } : undefined))
      expect(res.status).toBe(401)
    }
    expect(runSync).not.toHaveBeenCalled()
  })

  it('rejects a missing or wrong secret', async () => {
    vi.stubEnv('CRON_SECRET', 's3cret')
    // (a trailing space is not tested: the Headers API trims values)
    for (const auth of [undefined, 'Bearer wrong', 's3cret']) {
      const res = await getSync(req('/api/sync', auth ? { authorization: auth } : undefined))
      expect(res.status).toBe(401)
    }
    expect(runSync).not.toHaveBeenCalled()
  })

  it('runs the sync and invalidates caches when data changed', async () => {
    vi.stubEnv('CRON_SECRET', 's3cret')
    runSync.mockResolvedValue({ upserted: 5, removed: 0, categories: { electronics: { upserted: 5 } } })
    const res = await getSync(req('/api/sync', { authorization: 'Bearer s3cret' }))

    expect(res.status).toBe(200)
    expect(await res.json()).toMatchObject({ ok: true, upserted: 5 })
    expect(revalidateTag).toHaveBeenCalledWith('products', { expire: 0 })
    expect(revalidatePath).toHaveBeenCalledWith('/', 'layout')
  })

  it('reports 502 and leaves caches alone when every category failed', async () => {
    vi.stubEnv('CRON_SECRET', 's3cret')
    runSync.mockResolvedValue({ upserted: 0, removed: 0, categories: { electronics: { upserted: 0, error: 'x' } } })
    const res = await getSync(req('/api/sync', { authorization: 'Bearer s3cret' }))

    expect(res.status).toBe(502)
    expect(revalidateTag).not.toHaveBeenCalled()
  })

  it('hides internal error details', async () => {
    vi.stubEnv('CRON_SECRET', 's3cret')
    runSync.mockRejectedValue(new Error('connect ECONNREFUSED 10.0.0.5:5432'))
    const res = await getSync(req('/api/sync', { authorization: 'Bearer s3cret' }))

    expect(res.status).toBe(500)
    expect(await res.text()).not.toContain('10.0.0.5')
  })
})
