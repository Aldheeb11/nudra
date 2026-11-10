/**
 * AliExpress Affiliate Open Platform client (aliexpress.affiliate.product.query).
 * Requests are signed with HMAC-SHA256 over the sorted key+value pairs.
 */
import { createHmac } from 'node:crypto'

const ENDPOINT = 'https://api-sg.aliexpress.com/sync'
export const PAGE_SIZE = 50 // API maximum

/** Our category slug → AliExpress first-level category ids */
export const ALI_CATEGORY_IDS: Record<string, string> = {
  'electronics':     '44,509,7',            // Consumer Electronics, Phones, Computer & Office
  'fashion':         '200000345,200000343', // Women's / Men's Clothing
  'home-garden':     '15',                  // Home & Garden
  'sports-outdoors': '18',                  // Sports & Entertainment
  'beauty-health':   '66',                  // Beauty & Health
  'kids-toys':       '26,1501',             // Toys & Hobbies, Mother & Kids
  'automotive':      '34',                  // Automobiles & Motorcycles
  'tools-diy':       '1420,13',             // Tools, Home Improvement
}

export interface AliProduct {
  id: string
  title: string
  price: number
  originalPrice: number | null
  currency: string
  image: string
  affiliateUrl: string
  rating: number | null
  soldCount: number
}

export function signParams(params: Record<string, string>, secret: string): string {
  const base = Object.keys(params).sort().map((k) => k + params[k]).join('')
  return createHmac('sha256', secret).update(base, 'utf8').digest('hex').toUpperCase()
}

function requireEnv(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`${name} is not set`)
  return v
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalize(p: any): AliProduct | null {
  const price = parseFloat(p.target_sale_price ?? p.sale_price ?? '')
  const affiliateUrl: string | undefined = p.promotion_link
  // No promotion link = no commission; no price/image = unusable card
  if (!p.product_id || !p.product_title || !affiliateUrl || !p.product_main_image_url) return null
  if (!Number.isFinite(price) || price <= 0) return null

  const original = parseFloat(p.target_original_price ?? p.original_price ?? '')
  const ratePct  = parseFloat(p.evaluate_rate ?? '') // "94.5%" → 94.5
  const sold     = parseInt(p.lastest_volume ?? '0', 10)

  return {
    id:            String(p.product_id),
    title:         String(p.product_title).trim(),
    price,
    originalPrice: Number.isFinite(original) && original > price ? original : null,
    currency:      p.target_sale_price_currency ?? 'USD',
    image:         String(p.product_main_image_url).replace(/^http:\/\//, 'https://'),
    affiliateUrl,
    rating:        Number.isFinite(ratePct) && ratePct > 0 ? Math.round(ratePct / 2) / 10 : null, // 0-100 → 0-5
    soldCount:     Number.isFinite(sold) && sold > 0 ? sold : 0,
  }
}

/** `rawCount` is the size of the API page before unusable items were dropped (for last-page detection) */
export async function fetchProductsPage(
  categoryIds: string,
  page: number,
): Promise<{ products: AliProduct[]; rawCount: number }> {
  const params: Record<string, string> = {
    method:          'aliexpress.affiliate.product.query',
    app_key:         requireEnv('ALIEXPRESS_APP_KEY'),
    sign_method:     'sha256',
    timestamp:       Date.now().toString(),
    tracking_id:     requireEnv('ALIEXPRESS_TRACKING_ID'),
    category_ids:    categoryIds,
    sort:            'LAST_VOLUME_DESC',
    page_no:         String(page),
    page_size:       String(PAGE_SIZE),
    target_currency: 'USD',
    target_language: process.env.ALIEXPRESS_LANGUAGE || 'AR',
    ship_to_country: process.env.ALIEXPRESS_SHIP_TO || 'AE',
    fields:          'product_id,product_title,target_sale_price,target_original_price,target_sale_price_currency,product_main_image_url,promotion_link,evaluate_rate,lastest_volume',
  }
  params.sign = signParams(params, requireEnv('ALIEXPRESS_APP_SECRET'))

  const res = await fetch(ENDPOINT, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
    body:    new URLSearchParams(params),
    signal:  AbortSignal.timeout(20_000),
    cache:   'no-store',
  })
  if (!res.ok) throw new Error(`AliExpress HTTP ${res.status}`)

  const json = await res.json()
  if (json.error_response) {
    throw new Error(`AliExpress ${json.error_response.code}: ${json.error_response.msg}`)
  }
  const result = json.aliexpress_affiliate_product_query_response?.resp_result
  if (!result) throw new Error('AliExpress: unexpected response shape')
  if (Number(result.resp_code) !== 200) {
    throw new Error(`AliExpress resp_code ${result.resp_code}: ${result.resp_msg}`)
  }

  const raw: unknown[] = result.result?.products?.product ?? []
  return {
    products: raw.map(normalize).filter((p): p is AliProduct => p !== null),
    rawCount: raw.length,
  }
}
