/**
 * Read side of the data layer — the only module pages/routes should import.
 * Postgres when DATABASE_URL is set, sample catalog otherwise (local dev).
 */
import { CATEGORIES, SAMPLE_PRODUCTS, type Category, type Product } from './catalog'
import { getSql, hasDatabase } from './db'

export type { Product, Category }

const MAX_LIMIT = 48

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

export async function getCategories(): Promise<Category[]> {
  return CATEGORIES
}

export async function getProducts(opts?: {
  category?: string
  cursor?:   string
  limit?:    number
}): Promise<{ products: Product[]; nextCursor?: string }> {
  const limit    = Math.min(Math.max(opts?.limit ?? 24, 1), MAX_LIMIT)
  const parsed   = opts?.cursor ? parseInt(opts.cursor, 10) : 0
  const offset   = Number.isFinite(parsed) && parsed > 0 ? parsed : 0
  const category = opts?.category

  if (category && !CATEGORIES.some((c) => c.slug === category)) return { products: [] }

  let items: Product[]
  if (hasDatabase()) {
    const sql = getSql()
    const rows = await sql<ProductRow[]>`
      SELECT id, title, price::float8 AS price, original_price::float8 AS original_price,
             image, affiliate_url, category, rating, sold_count
      FROM products
      ${category ? sql`WHERE category = ${category}` : sql``}
      ORDER BY sold_count DESC, id
      LIMIT ${limit + 1} OFFSET ${offset}`
    items = rows.map(toProduct)
  } else {
    const all = category ? SAMPLE_PRODUCTS.filter((p) => p.category === category) : SAMPLE_PRODUCTS
    items = all.slice(offset, offset + limit + 1)
  }

  const hasMore = items.length > limit
  return {
    products:   hasMore ? items.slice(0, limit) : items,
    nextCursor: hasMore ? String(offset + limit) : undefined,
  }
}

/** Best sellers for the home page */
export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  if (!hasDatabase()) return SAMPLE_PRODUCTS.filter((p) => p.isFeatured).slice(0, limit)
  const { products } = await getProducts({ limit })
  return products
}
