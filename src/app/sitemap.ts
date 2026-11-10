import type { MetadataRoute } from 'next'
import { CATEGORIES } from '@/lib/catalog'
import { getSitemapEntries } from '@/lib/products'
import { absoluteUrl } from '@/lib/site'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // A database hiccup must not take the whole sitemap (or the build) down
  const data = await getSitemapEntries().catch((err) => {
    console.error('[sitemap]', err)
    return null
  })

  const newest = data?.products[0]?.updatedAt
  // Without data list every category; with data skip the empty (thin) ones
  const categories = CATEGORIES.filter((c) => !data || data.categories.has(c.slug))

  return [
    { url: absoluteUrl('/'),         lastModified: newest, changeFrequency: 'daily', priority: 1 },
    { url: absoluteUrl('/products'), lastModified: newest, changeFrequency: 'daily', priority: 0.9 },
    ...categories.map((c) => ({
      url: absoluteUrl(`/category/${c.slug}`),
      lastModified: data?.categories.get(c.slug),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    })),
    ...(data?.products ?? []).map((p) => ({
      url: absoluteUrl(`/products/${p.id}`),
      lastModified: p.updatedAt,
      changeFrequency: 'daily' as const,
      priority: 0.6,
    })),
    ...['about', 'affiliate-disclosure', 'privacy', 'terms'].map((path) => ({
      url: absoluteUrl(`/${path}`), changeFrequency: 'yearly' as const, priority: 0.3,
    })),
  ]
}
