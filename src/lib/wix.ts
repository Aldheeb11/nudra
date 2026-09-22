import { createClient, OAuthStrategy } from '@wix/sdk'
import { items }       from '@wix/data'
import { submissions } from '@wix/forms'
import { posts }       from '@wix/blog'

// Wix Headless client — self-managed (Next.js on Vercel)
export const wixClient = createClient({
  modules: { items, submissions, posts },
  auth: OAuthStrategy({
    clientId: process.env.WIX_CLIENT_ID!,
  }),
})

// ── CMS collection IDs ───────────────────────────────────────────────────────
export const COLLECTIONS = {
  PRODUCTS:   'Products',
  CATEGORIES: 'Categories',
} as const

// ── Types ───────────────────────────────────────────────────────────────────
export interface Product {
  _id:          string
  title:        string
  description?: string
  price:        number
  image?:       string
  affiliateUrl: string
  category?:    string
  aliExpressId: string
  rating?:      number
  isFeatured?:  boolean
}

export interface Category {
  _id:  string
  name: string
  slug: string
  icon?: string
}

// ── Query helpers ────────────────────────────────────────────────────────────

/** Fetch featured products (ISR-safe, max 20) */
export async function getFeaturedProducts(): Promise<Product[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await (wixClient.items as any)
    .query(COLLECTIONS.PRODUCTS)
    .eq('isFeatured', true)
    .limit(20)
    .find()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (result.items ?? []) as Product[]
}

/** Fetch all categories */
export async function getCategories(): Promise<Category[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await (wixClient.items as any)
    .query(COLLECTIONS.CATEGORIES)
    .limit(100)
    .find()

  return (result.items ?? []) as Category[]
}

/** Paginated product list (cursor-based) */
export async function getProducts(opts?: {
  categoryId?: string
  cursor?:     string
  limit?:      number
}): Promise<{ products: Product[]; nextCursor?: string }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q = (wixClient.items as any)
    .query(COLLECTIONS.PRODUCTS)
    .limit(opts?.limit ?? 24)

  if (opts?.categoryId) q = q.eq('category', opts.categoryId)
  if (opts?.cursor)     q = q.skipTo(opts.cursor)

  const result = await q.find()

  return {
    products:   (result.items ?? []) as Product[],
    nextCursor: result.hasNext?.() ? result.cursors?.next : undefined,
  }
}

/** Single product by aliExpressId */
export async function getProductByAliId(aliId: string): Promise<Product | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await (wixClient.items as any)
    .query(COLLECTIONS.PRODUCTS)
    .eq('aliExpressId', aliId)
    .limit(1)
    .find()

  return (result.items?.[0] ?? null) as Product | null
}
