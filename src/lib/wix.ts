/**
 * Wix Headless client (auth + forms + blog only)
 * Product/category data comes from catalog.ts (static) or AliExpress API
 */
import { createClient, OAuthStrategy } from '@wix/sdk'
import { submissions } from '@wix/forms'
import { posts }       from '@wix/blog'

// Re-export data types from catalog
export type { Product, Category } from './catalog'
export {
  CATEGORIES,
  SAMPLE_PRODUCTS,
  queryProducts,
  getFeatured,
} from './catalog'

// Wix client — used for auth, forms & blog only
export const wixClient = createClient({
  modules: { submissions, posts },
  auth: OAuthStrategy({
    clientId: process.env.WIX_CLIENT_ID!,
  }),
})

// ── Convenience wrappers (delegates to catalog) ───────────────────────────────
import { queryProducts as _query, getFeatured as _featured, CATEGORIES as _cats } from './catalog'
import type { Product, Category } from './catalog'

export async function getProducts(opts?: {
  categoryId?: string
  cursor?:     string
  limit?:      number
}): Promise<{ products: Product[]; nextCursor?: string }> {
  const numCursor = opts?.cursor ? parseInt(opts.cursor, 10) : undefined
  const result = _query({ ...opts, cursor: numCursor })
  return {
    products:   result.products,
    nextCursor: result.nextCursor !== undefined ? String(result.nextCursor) : undefined,
  }
}

export async function getFeaturedProducts(): Promise<Product[]> {
  return _featured()
}

export async function getCategories(): Promise<Category[]> {
  return _cats
}

export async function getProductByAliId(aliId: string): Promise<Product | null> {
  const { SAMPLE_PRODUCTS } = await import('./catalog')
  return SAMPLE_PRODUCTS.find((p) => p.aliExpressId === aliId) ?? null
}
