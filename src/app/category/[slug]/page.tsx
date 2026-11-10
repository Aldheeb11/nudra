import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ProductListing } from '@/components/products/ProductListing'
import { CATEGORIES } from '@/lib/catalog'
import { normalizeQuery } from '@/lib/products'
import { absoluteUrl, jsonLd, pageMetadata } from '@/lib/site'

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
  const path = `/category/${category.slug}`
  if (q) return pageMetadata({ title: `نتائج البحث عن «${q}» في ${category.name}`, path, noIndex: true })
  return pageMetadata({
    title:       category.name,
    description: `أفضل منتجات ${category.name} الأكثر مبيعاً على AliExpress بأسعار محدّثة يومياً.`,
    path,
  })
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params
  const category = CATEGORIES.find((c) => c.slug === slug)
  if (!category) notFound()
  const q = normalizeQuery(first((await searchParams).q))

  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type':    'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: absoluteUrl('/') },
      { '@type': 'ListItem', position: 2, name: 'المنتجات', item: absoluteUrl('/products') },
      { '@type': 'ListItem', position: 3, name: category.name, item: absoluteUrl(`/category/${slug}`) },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbs) }} />
      <ProductListing category={slug} q={q} />
    </>
  )
}
