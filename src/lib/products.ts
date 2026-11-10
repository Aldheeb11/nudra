/**
 * Read side of the data layer — the only module pages/routes should import.
 * Postgres when DATABASE_URL is set, sample catalog otherwise (local dev).
 */
import { CATEGORIES, SAMPLE_PRODUCTS, type Category, type Product } from './catalog'
import { getSql, hasDatabase } from './db'

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

export async function getProducts(opts?: ProductFilter & {
  cursor?: string
  limit?:  number
}): Promise<{ products: Product[]; nextCursor?: string }> {
  const limit  = Math.min(Math.max(opts?.limit ?? 24, 1), MAX_LIMIT)
  const parsed = opts?.cursor ? parseInt(opts.cursor, 10) : 0
  const offset = Number.isFinite(parsed) && parsed > 0 ? parsed : 0
  const filter = { category: opts?.category, q: opts?.q }

  if (filter.category && !isCategorySlug(filter.category)) return { products: [] }

  let items: Product[]
  if (hasDatabase()) {
    const sql = getSql()
    const rows = await sql<ProductRow[]>`
      SELECT id, title, price::float8 AS price, original_price::float8 AS original_price,
             image, affiliate_url, category, rating, sold_count
      FROM products
      ${whereClause(filter)}
      ORDER BY sold_count DESC, id
      LIMIT ${limit + 1} OFFSET ${offset}`
    items = rows.map(toProduct)
  } else {
    items = filterSamples(filter).slice(offset, offset + limit + 1)
  }

  const hasMore = items.length > limit
  return {
    products:   hasMore ? items.slice(0, limit) : items,
    nextCursor: hasMore ? String(offset + limit) : undefined,
  }
}

export async function countProducts(filter: ProductFilter = {}): Promise<number> {
  if (filter.category && !isCategorySlug(filter.category)) return 0
  if (!hasDatabase()) return filterSamples(filter).length
  const sql = getSql()
  const [row] = await sql<{ n: number }[]>`SELECT count(*)::int AS n FROM products ${whereClause(filter)}`
  return row?.n ?? 0
}

export async function getProductById(id: string): Promise<Product | null> {
  if (!/^[\w-]{1,32}$/.test(id)) return null
  if (!hasDatabase()) return SAMPLE_PRODUCTS.find((p) => p._id === id) ?? null
  const sql = getSql()
  const rows = await sql<ProductRow[]>`
    SELECT id, title, price::float8 AS price, original_price::float8 AS original_price,
           image, affiliate_url, category, rating, sold_count
    FROM products WHERE id = ${id}`
  return rows[0] ? toProduct(rows[0]) : null
}

/** Best sellers for the home page */
export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  if (!hasDatabase()) return SAMPLE_PRODUCTS.filter((p) => p.isFeatured).slice(0, limit)
  const { products } = await getProducts({ limit })
  return products
}
