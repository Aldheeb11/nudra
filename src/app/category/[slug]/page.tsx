import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ProductListing } from '@/components/products/ProductListing'
import { CATEGORIES } from '@/lib/catalog'
import { normalizeQuery } from '@/lib/products'

interface Props {
  params:       Promise<{ slug: string }>
  searchParams: Promise<{ q?: string | string[] }>
}

const first = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v)

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params
  const category = CATEGORIES.find((c) => c.slug === slug)
  if (!category) return {}
  const q = normalizeQuery(first((await searchParams).q))
  if (q) return { title: `نتائج البحث عن «${q}» في ${category.name}`, robots: { index: false } }
  return {
    title:       category.name,
    description: `أفضل منتجات ${category.name} من AliExpress بأسعار محدّثة يومياً`,
    alternates:  { canonical: `/category/${category.slug}` },
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params
  if (!CATEGORIES.some((c) => c.slug === slug)) notFound()
  const q = normalizeQuery(first((await searchParams).q))
  return <ProductListing category={slug} q={q} />
}
