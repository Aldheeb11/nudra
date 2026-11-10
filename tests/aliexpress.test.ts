import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PAGE_SIZE, fetchProductsPage, signParams } from '@/lib/aliexpress'

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })

const ok = (product: unknown[]) =>
  json({ aliexpress_affiliate_product_query_response: { resp_result: { resp_code: 200, result: { products: { product } } } } })

const item = (over: Record<string, unknown> = {}) => ({
  product_id: 1001,
  product_title: '  سماعة لاسلكية  ',
  target_sale_price: '12.50',
  target_original_price: '25.00',
  target_sale_price_currency: 'USD',
  product_main_image_url: 'http://ae01.alicdn.com/kf/a.jpg',
  promotion_link: 'https://s.click.aliexpress.com/e/_abc',
  evaluate_rate: '94.5%',
  lastest_volume: 321,
  ...over,
})

beforeEach(() => {
  vi.stubEnv('ALIEXPRESS_APP_KEY', 'key')
  vi.stubEnv('ALIEXPRESS_APP_SECRET', 'secret')
  vi.stubEnv('ALIEXPRESS_TRACKING_ID', 'track')
})

describe('signParams', () => {
  it('matches an HMAC-SHA256 computed independently (sorted key+value, upper-case hex)', () => {
    const params = {
      method: 'aliexpress.affiliate.product.query',
      app_key: '12345',
      timestamp: '1700000000000',
      sign_method: 'sha256',
      page_no: '1',
      keywords: 'هاتف',
    }
    // python: hmac.new(b'secret', ''.join(k+v for k,v in sorted(p.items())).encode(), sha256).hexdigest().upper()
    expect(signParams(params, 'secret')).toBe('593800BA4429C64DDEF0B795F1ADA90EF3D261C58918749B1633B6CD4C774B73')
  })

  it('does not depend on key order', () => {
    expect(signParams({ b: '2', a: '1' }, 's')).toBe(signParams({ a: '1', b: '2' }, 's'))
  })
})

describe('fetchProductsPage', () => {
  it('sends a signed form request with the category and page', async () => {
    const fetchMock = vi.fn(async () => ok([]))
    vi.stubGlobal('fetch', fetchMock)

    await fetchProductsPage('44,509', 3)

    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    const sent = Object.fromEntries(init.body as URLSearchParams)
    const { sign, ...rest } = sent
    expect(url).toBe('https://api-sg.aliexpress.com/sync')
    expect(init.method).toBe('POST')
    expect(rest).toMatchObject({ app_key: 'key', tracking_id: 'track', category_ids: '44,509', page_no: '3', sign_method: 'sha256' })
    expect(sign).toBe(signParams(rest, 'secret'))
  })

  it('normalises a product', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ok([item()])))
    const { products, rawCount } = await fetchProductsPage('44', 1)
    expect(rawCount).toBe(1)
    expect(products).toEqual([{
      id: '1001',
      title: 'سماعة لاسلكية',
      price: 12.5,
      originalPrice: 25,
      currency: 'USD',
      image: 'https://ae01.alicdn.com/kf/a.jpg', // upgraded to https
      affiliateUrl: 'https://s.click.aliexpress.com/e/_abc',
      rating: 4.7, // 94.5% → 0–5
      soldCount: 321,
    }])
  })

  it('drops unusable items but reports the raw page size', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ok([
      item({ product_id: 1 }),
      item({ product_id: 2, promotion_link: undefined }),       // no commission link
      item({ product_id: 3, target_sale_price: '0' }),          // no price
      item({ product_id: 4, product_main_image_url: '' }),      // no image
      item({ product_id: 5, target_sale_price: 'abc' }),
    ])))
    const { products, rawCount } = await fetchProductsPage('44', 1)
    expect(products.map((p) => p.id)).toEqual(['1'])
    expect(rawCount).toBe(5)
  })

  it('omits an original price that is not higher, a missing rating and a missing volume', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ok([
      item({ target_original_price: '12.50', evaluate_rate: undefined, lastest_volume: undefined }),
    ])))
    const { products } = await fetchProductsPage('44', 1)
    expect(products[0]).toMatchObject({ originalPrice: null, rating: null, soldCount: 0 })
  })

  it('throws on API-level and HTTP errors', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => json({ error_response: { code: 'IncompleteSignature', msg: 'bad sign' } })))
    await expect(fetchProductsPage('44', 1)).rejects.toThrow('IncompleteSignature')

    vi.stubGlobal('fetch', vi.fn(async () => json({ aliexpress_affiliate_product_query_response: { resp_result: { resp_code: 405, resp_msg: 'limit' } } })))
    await expect(fetchProductsPage('44', 1)).rejects.toThrow('405')

    vi.stubGlobal('fetch', vi.fn(async () => json({}, 503)))
    await expect(fetchProductsPage('44', 1)).rejects.toThrow('503')
  })

  it('refuses to call the API without credentials', async () => {
    vi.stubEnv('ALIEXPRESS_APP_SECRET', '')
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    await expect(fetchProductsPage('44', 1)).rejects.toThrow('ALIEXPRESS_APP_SECRET')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('uses the API maximum page size', () => {
    expect(PAGE_SIZE).toBe(50)
  })
})
