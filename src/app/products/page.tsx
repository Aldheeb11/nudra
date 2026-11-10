import type { Metadata } from 'next'
import { permanentRedirect } from 'next/navigation'
import { ProductListing, listingHref } from '@/components/products/ProductListing'
import { isCategorySlug, normalizeQuery } from '@/lib/products'

interface Props {
  searchParams: Promise<{ category?: string | string[]; q?: string | string[] }>
}

const first = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v)

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const q = normalizeQuery(first((await searchParams).q))
  if (q) return { title: `نتائج البحث عن «${q}»`, robots: { index: false } }
  return { title: 'جميع المنتجات', alternates: { canonical: '/products' } }
}

export default async function ProductsPage({ searchParams }: Props) {
  const sp = await searchParams
  const q = normalizeQuery(first(sp.q))

  // Legacy ?category=slug links → /category/slug
  const legacyCategory = first(sp.category)
  if (legacyCategory && isCategorySlug(legacyCategory)) permanentRedirect(listingHref(legacyCategory, q))

  return <ProductListing q={q} />
}
