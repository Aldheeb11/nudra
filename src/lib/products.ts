/**
 * Read side of the data layer — the only module pages/routes should import.
 * Postgres when DATABASE_URL is set, sample catalog otherwise (local dev).
 */
import { unstable_cache } from 'next/cache'
import { CATEGORIES, SAMPLE_PRODUCTS, type Category, type Product } from './catalog'
import { getSql, hasDatabase } from './db'

/** Tag on every cached product read; the sync invalidates it when new data lands */
export const PRODUCTS_TAG = 'products'
const CACHE = { tags: [PRODUCTS_TAG], revalidate: 3600 }

/** Before the first sync the table does not exist yet — that is "no products", not a failure */
function emptyIfNoTable<T>(fallback: T) {
  return (err: unknown): T => {
    if ((err as { code?: string })?.code === '42P01') return fallback
    throw err
  }
}

export type { Product, Category }

const MAX_LIMIT = 48
export const MAX_QUERY_LENGTH = 80

interface ProductRow {
  id: string
  title: string
  price: number
  original_price: number | null
  image: string
  affiliate_url: string
  category: string
  rating: number | null
  sold_count: number
}

export interface ProductFilter {
  category?: string
  /** Free-text search on the title */
  q?: string
}

function toProduct(r: ProductRow): Product {
  return {
    _id:           r.id,
    aliExpressId:  r.id,
    title:         r.title,
    price:         r.price,
    originalPrice: r.original_price ?? undefined,
    image:         r.image,
    affiliateUrl:  r.affiliate_url,
    category:      r.category,
    rating:        r.rating ?? undefined,
    soldCount:     r.sold_count,
  }
}

export function normalizeQuery(q?: string | null): string | undefined {
  const trimmed = q?.trim().slice(0, MAX_QUERY_LENGTH)
  return trimmed ? trimmed : undefined
}

export function isCategorySlug(slug: string): boolean {
  return CATEGORIES.some((c) => c.slug === slug)
}

function whereClause(filter: ProductFilter) {
  const sql = getSql()
  const q = normalizeQuery(filter.q)
  const pattern = q ? `%${q.replace(/[\\%_]/g, '\\$&')}%` : null
  if (filter.category && pattern) return sql`WHERE category = ${filter.category} AND title ILIKE ${pattern}`
  if (filter.category)            return sql`WHERE category = ${filter.category}`
  if (pattern)                    return sql`WHERE title ILIKE ${pattern}`
  return sql``
}

function filterSamples(filter: ProductFilter): Product[] {
  const q = normalizeQuery(filter.q)?.toLowerCase()
  return SAMPLE_PRODUCTS.filter(
    (p) => (!filter.category || p.category === filter.category) && (!q || p.title.toLowerCase().includes(q)),
  )
}

export async function getCategories(): Promise<Category[]> {
  return CATEGORIES
}

const PRODUCT_COLUMNS = `id, title, price::float8 AS price, original_price::float8 AS original_price,
  image, affiliate_url, category, rating, sold_count`

async function queryPage(filter: ProductFilter, offset: number, limit: number): Promise<Product[]> {
  const sql = getSql()
  const rows = await sql<ProductRow[]>`
    SELECT ${sql.unsafe(PRODUCT_COLUMNS)}
    FROM products
    ${whereClause(filter)}
    ORDER BY sold_count DESC, id
    LIMIT ${limit} OFFSET ${offset}`.catch(emptyIfNoTable<ProductRow[]>([]))
  return rows.map(toProduct)
}

async function queryCount(filter: ProductFilter): Promise<number> {
  const sql = getSql()
  const rows = await sql<{ n: number }[]>`SELECT count(*)::int AS n FROM products ${whereClause(filter)}`
    .catch(emptyIfNoTable<{ n: number }[]>([]))
  return rows[0]?.n ?? 0
}

async function queryById(id: string): Promise<Product | null> {
  const sql = getSql()
  const rows = await sql<ProductRow[]>`
    SELECT ${sql.unsafe(PRODUCT_COLUMNS)} FROM products WHERE id = ${id}`
    .catch(emptyIfNoTable<ProductRow[]>([]))
  return rows[0] ? toProduct(rows[0]) : null
}

// Browsing reads are shared by every visitor, so they are cached for an hour and
// refreshed by the sync. Free-text searches are not cached (unbounded key space).
const cachedPage = unstable_cache(
  (category: string | null, offset: number, limit: number) =>
    queryPage({ category: category ?? undefined }, offset, limit),
  ['products:page'], CACHE,
)
const cachedCount = unstable_cache(
  (category: string | null) => queryCount({ category: category ?? undefined }),
  ['products:count'], CACHE,
)
const cachedById = unstable_cache((id: string) => queryById(id), ['products:by-id'], CACHE)

export async function getProducts(opts?: ProductFilter & {
  cursor?: string
  limit?:  number
}): Promise<{ products: Product[]; nextCursor?: string }> {
  const limit  = Math.min(Math.max(opts?.limit ?? 24, 1), MAX_LIMIT)
  const parsed = opts?.cursor ? parseInt(opts.cursor, 10) : 0
  const offset = Number.isFinite(parsed) && parsed > 0 ? parsed : 0
  const filter = { category: opts?.category, q: normalizeQuery(opts?.q) }

  if (filter.category && !isCategorySlug(filter.category)) return { products: [] }

  // One extra row tells us whether another page exists
  let items: Product[]
  if (!hasDatabase()) items = filterSamples(filter).slice(offset, offset + limit + 1)
  else if (filter.q)  items = await queryPage(filter, offset, limit + 1)
  else                items = await cachedPage(filter.category ?? null, offset, limit + 1)

  const hasMore = items.length > limit
  return {
    products:   hasMore ? items.slice(0, limit) : items,
    nextCursor: hasMore ? String(offset + limit) : undefined,
  }
}

export async function countProducts(filter: ProductFilter = {}): Promise<number> {
  if (filter.category && !isCategorySlug(filter.category)) return 0
  if (!hasDatabase()) return filterSamples(filter).length
  return normalizeQuery(filter.q) ? queryCount(filter) : cachedCount(filter.category ?? null)
}

export async function getProductById(id: string): Promise<Product | null> {
  if (!/^[\w-]{1,32}$/.test(id)) return null
  if (!hasDatabase()) return SAMPLE_PRODUCTS.find((p) => p._id === id) ?? null
  return cachedById(id)
}

/** Best sellers for the home page */
export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  if (!hasDatabase()) return SAMPLE_PRODUCTS.filter((p) => p.isFeatured).slice(0, limit)
  const { products } = await getProducts({ limit })
  return products
}

/**
 * For statically generated pages: during `next build` a database failure renders the
 * fallback instead of breaking the build; at runtime it rethrows, so ISR keeps serving
 * the last good page rather than caching an empty one.
 */
export function fallbackDuringBuild<T>(fallback: T) {
  return (err: unknown): T => {
    if (process.env.NEXT_PHASE !== 'phase-production-build') throw err
    console.warn('[build] database unavailable, rendering fallback:', err instanceof Error ? err.message : err)
    return fallback
  }
}

/** Product URLs (newest first, capped) + last update per non-empty category, for sitemap.xml */
export async function getSitemapEntries(limit = 5000): Promise<{
  products: { id: string; updatedAt?: Date }[]
  categories: Map<string, Date | undefined>
}> {
  if (!hasDatabase()) {
    return {
      products:   SAMPLE_PRODUCTS.map((p) => ({ id: p._id })),
      categories: new Map(SAMPLE_PRODUCTS.map((p) => [p.category, undefined])),
    }
  }
  const sql = getSql()
  const [products, categories] = await Promise.all([
    sql<{ id: string; updated_at: Date }[]>`
      SELECT id, updated_at FROM products ORDER BY updated_at DESC, id LIMIT ${limit}`,
    sql<{ category: string; updated_at: Date }[]>`
      SELECT category, max(updated_at) AS updated_at FROM products GROUP BY category`,
  ]).catch(emptyIfNoTable<[{ id: string; updated_at: Date }[], { category: string; updated_at: Date }[]]>([[], []]))
  return {
    products:   products.map((p) => ({ id: p.id, updatedAt: p.updated_at })),
    categories: new Map(categories.map((c) => [c.category, c.updated_at])),
  }
}
