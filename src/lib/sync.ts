/**
 * AliExpress → Postgres sync. Runs inline inside the /api/sync cron request
 * (no queue / worker): a few signed API calls per category, one upsert per page.
 */
import { CATEGORIES } from './catalog'
import { ALI_CATEGORY_IDS, PAGE_SIZE, fetchProductsPage, type AliProduct } from './aliexpress'
import { ensureSchema, getSql } from './db'

const STALE_AFTER_DAYS = 7

export interface SyncResult {
  upserted: number
  removed: number
  categories: Record<string, { upserted: number; error?: string }>
}

async function upsert(category: string, products: AliProduct[]): Promise<void> {
  const sql = getSql()
  const rows = products.map((p) => ({
    id:             p.id,
    title:          p.title,
    price:          p.price,
    original_price: p.originalPrice,
    currency:       p.currency,
    image:          p.image,
    affiliate_url:  p.affiliateUrl,
    category,
    rating:         p.rating,
    sold_count:     p.soldCount,
  }))
  await sql`
    INSERT INTO products ${sql(rows)}
    ON CONFLICT (id) DO UPDATE SET
      title          = EXCLUDED.title,
      price          = EXCLUDED.price,
      original_price = EXCLUDED.original_price,
      currency       = EXCLUDED.currency,
      image          = EXCLUDED.image,
      affiliate_url  = EXCLUDED.affiliate_url,
      category       = EXCLUDED.category,
      rating         = EXCLUDED.rating,
      sold_count     = EXCLUDED.sold_count,
      updated_at     = now()`
}

export async function runSync(): Promise<SyncResult> {
  await ensureSchema()

  const pages = Math.min(Math.max(parseInt(process.env.ALIEXPRESS_PAGES_PER_CATEGORY ?? '2', 10) || 2, 1), 10)
  const seen = new Set<string>() // a product may be listed under two categories — first one wins
  const result: SyncResult = { upserted: 0, removed: 0, categories: {} }

  for (const { slug } of CATEGORIES) {
    const stats: { upserted: number; error?: string } = { upserted: 0 }
    result.categories[slug] = stats
    const categoryIds = ALI_CATEGORY_IDS[slug]
    if (!categoryIds) { stats.error = 'no AliExpress category mapping'; continue }

    try {
      for (let page = 1; page <= pages; page++) {
        const { products, rawCount } = await fetchProductsPage(categoryIds, page)
        const fresh = products.filter((p) => !seen.has(p.id))
        fresh.forEach((p) => seen.add(p.id))
        if (fresh.length) {
          await upsert(slug, fresh)
          stats.upserted += fresh.length
        }
        if (rawCount < PAGE_SIZE) break // last page
      }
    } catch (err) {
      stats.error = err instanceof Error ? err.message : String(err)
      console.error(`[sync] ${slug}:`, err)
    }
    result.upserted += stats.upserted
  }

  // Drop listings the API stopped returning — but never after a failed run
  if (result.upserted > 0) {
    const sql = getSql()
    const gone = await sql`
      DELETE FROM products
      WHERE updated_at < now() - make_interval(days => ${STALE_AFTER_DAYS})`
    result.removed = gone.count
  }

  return result
}
