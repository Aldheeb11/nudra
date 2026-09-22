/**
 * Nudra — AliExpress → Wix CMS Sync Job
 * Runs via Vercel Cron Jobs: "0 3 * * *" (3am UTC daily)
 *
 * Flow:
 *   1. Fetch products from AliExpress Affiliate API (batch of 100)
 *   2. Compare price vs current Wix CMS price (delta sync)
 *   3. Create new / update changed / skip unchanged
 *   4. Exponential backoff on rate-limit errors
 */

import 'dotenv/config'
import Queue     from 'bull'
import { items } from '@wix/data'
import { createClient, OAuthStrategy } from '@wix/sdk'

const wix = createClient({
  modules: { items },
  auth: OAuthStrategy({ clientId: process.env.WIX_CLIENT_ID! }),
})

const COLLECTION = 'Products'
const BATCH_SIZE = 100

// ── Bull Queue ────────────────────────────────────────────────────────────────
const syncQueue = new Queue<{ page: number }>('product-sync', {
  redis: process.env.REDIS_URL ?? 'redis://localhost:6379',
  defaultJobOptions: {
    attempts:  5,
    backoff: { type: 'exponential', delay: 2000 },
  },
})

// ── AliExpress API helper ────────────────────────────────────────────────────
async function fetchAliExpressPage(page: number) {
  // Using AliExpress Affiliate Open Platform REST API
  const url = new URL('https://api-sg.aliexpress.com/sync')
  const body = JSON.stringify({
    method:         'aliexpress.affiliate.product.query',
    app_key:        process.env.ALIEXPRESS_APP_KEY,
    tracking_id:    process.env.ALIEXPRESS_TRACKING_ID,
    keywords:       'home garden',
    sort:           'SALE_PRICE_ASC',
    page_no:        page,
    page_size:      BATCH_SIZE,
    fields:         'product_id,product_title,target_sale_price,product_main_image_url,product_detail_url,evaluate_rate',
    timestamp:      Date.now().toString(),
  })

  const res = await fetch(url.toString(), {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  })

  if (!res.ok) throw new Error(`AliExpress API ${res.status}`)
  return res.json()
}

// ── Worker ───────────────────────────────────────────────────────────────────
syncQueue.process(async job => {
  const { page } = job.data
  console.log(`[sync] Processing page ${page}`)

  // 1. Fetch from AliExpress
  const raw = await fetchAliExpressPage(page)
  const aliProducts = raw?.aliexpress_affiliate_product_query_response?.resp_result?.result?.products?.product ?? []

  if (!aliProducts.length) {
    console.log(`[sync] Page ${page} empty — done`)
    return
  }

  // 2. For each product: check if exists in Wix CMS
  let created = 0, updated = 0, skipped = 0

  for (const p of aliProducts) {
    const aliId = String(p.product_id)
    const price  = parseFloat(p.target_sale_price ?? '0')

    try {
      // Check existing by aliExpressId
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (wix.items as any)
        .query(COLLECTION)
        .eq('aliExpressId', aliId)
        .limit(1)
        .find()

      const existing = result.items ?? []

      if (existing.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const current = existing[0] as any
        const currentPrice = current.price ?? 0
        // Delta sync — only update if price changed (>1% difference)
        if (Math.abs(currentPrice - price) / Math.max(currentPrice, 0.01) > 0.01) {
          await wix.items.update(COLLECTION, {
            _id:       current._id,
            price,
            updatedAt: new Date().toISOString(),
          })
          updated++
        } else {
          skipped++
        }
      } else {
        // Create new product
        await wix.items.insert(COLLECTION, {
          title:        p.product_title,
          price,
          image:        p.product_main_image_url,
          affiliateUrl: p.product_detail_url,
          aliExpressId: aliId,
          rating:       parseFloat(p.evaluate_rate ?? '0') / 20, // 0-100 → 0-5
          isFeatured:   false,
        })
        created++
      }
    } catch (err) {
      console.error(`[sync] Failed product ${aliId}:`, err)
    }
  }

  console.log(`[sync] Page ${page}: +${created} created, ~${updated} updated, =${skipped} skipped`)

  // Queue next page
  if (aliProducts.length === BATCH_SIZE) {
    await syncQueue.add({ page: page + 1 }, { delay: 1000 })
  }
})

// ── Entry point ───────────────────────────────────────────────────────────────
export async function startSync() {
  console.log('[sync] Starting AliExpress → Wix CMS sync')
  await syncQueue.add({ page: 1 })
}

// Direct run
if (require.main === module) {
  startSync().catch(console.error)
}
