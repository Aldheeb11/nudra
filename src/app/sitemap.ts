import { MetadataRoute } from 'next'
import { CATEGORIES } from '@/lib/catalog'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://nudra-psi.vercel.app'

  const categoryUrls: MetadataRoute.Sitemap = CATEGORIES.map((cat) => ({
    url: `${base}/products?category=${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.8,
  }))

  return [
    { url: base,                  lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${base}/products`,    lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    ...categoryUrls,
  ]
}
