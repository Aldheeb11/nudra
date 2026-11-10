import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ProductCard } from '@/components/products/ProductCard'
import { discountPercent, formatCount, formatPrice } from '@/lib/format'
import { getCategories, getProductById, getProducts } from '@/lib/products'
import { absoluteUrl, jsonLd, pageMetadata } from '@/lib/site'

interface Props {
  params: Promise<{ id: string }>
}

// Generated on first visit, then served from the cache; refreshed hourly and after each sync
export const revalidate = 3600
export function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const product = await getProductById(id)
  if (!product) return { title: 'المنتج غير موجود', robots: { index: false } }

  return pageMetadata({
    title:       product.title,
    description: `${product.title} بسعر ${formatPrice(product.price)} على AliExpress. قارن السعر والتقييم واشترِ مباشرة.`,
    path:        `/products/${product._id}`,
    image:       product.image || undefined,
  })
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params
  const product = await getProductById(id)
  if (!product) notFound()

  const [categories, related] = await Promise.all([
    getCategories(),
    getProducts({ category: product.category, limit: 5 }).then((r) =>
      r.products.filter((p) => p._id !== product._id).slice(0, 4),
    ),
  ])
  const category = categories.find((c) => c.slug === product.category)
  const discount = discountPercent(product)

  const url = absoluteUrl(`/products/${product._id}`)
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type':    'Product',
      name:       product.title,
      url,
      image:      product.image || undefined,
      sku:        product.aliExpressId,
      category:   category?.name,
      offers: {
        '@type':       'Offer',
        price:         product.price.toFixed(2),
        priceCurrency: 'USD',
        availability:  'https://schema.org/InStock',
        url:           product.affiliateUrl,
        seller:        { '@type': 'Organization', name: 'AliExpress' },
      },
    },
    {
      '@context': 'https://schema.org',
      '@type':    'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: absoluteUrl('/') },
        { '@type': 'ListItem', position: 2, name: 'المنتجات', item: absoluteUrl('/products') },
        ...(category
          ? [{ '@type': 'ListItem', position: 3, name: category.name, item: absoluteUrl(`/category/${category.slug}`) }]
          : []),
      ],
    },
  ]

  return (
    <main className="mx-auto max-w-6xl px-4 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }}
      />

      <nav aria-label="مسار التنقل" className="py-6 text-xs text-[var(--muted)]">
        <ol className="flex flex-wrap items-center gap-2">
          <li><Link href="/" className="hover:text-[var(--text)]">الرئيسية</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link href="/products" className="hover:text-[var(--text)]">المنتجات</Link></li>
          {category && (
            <>
              <li aria-hidden="true">/</li>
              <li><Link href={`/category/${category.slug}`} className="hover:text-[var(--text)]">{category.name}</Link></li>
            </>
          )}
        </ol>
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="relative aspect-square rounded-xl border border-[var(--bg-border)] bg-[var(--bg-card)] overflow-hidden">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 560px"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-[var(--muted)] text-sm">لا توجد صورة</div>
          )}
        </div>

        <div className="flex flex-col">
          <h1 className="text-xl md:text-2xl font-bold text-[var(--text)] leading-relaxed mb-4">{product.title}</h1>

          <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--muted)] mb-6">
            {product.rating ? (
              <span className="px-2 py-1 rounded border border-[var(--accent2)]/30 text-[var(--accent2)]">
                <span aria-hidden="true">★ </span>
                <span className="sr-only">التقييم </span>
                <span dir="ltr">{product.rating.toFixed(1)}</span> من 5
              </span>
            ) : null}
            {product.soldCount ? (
              <span>تم بيع <span dir="ltr">{formatCount(product.soldCount)}+</span></span>
            ) : null}
          </div>

          <div className="flex items-baseline gap-3 mb-2" dir="ltr" style={{ justifyContent: 'flex-end' }}>
            {discount !== null && (
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-500/90 text-white">-{discount}%</span>
            )}
            {product.originalPrice ? (
              <span className="text-sm text-[var(--muted)] line-through">{formatPrice(product.originalPrice)}</span>
            ) : null}
            <span className="text-3xl font-bold text-[var(--green)]">{formatPrice(product.price)}</span>
          </div>
          <p className="text-[11px] text-[var(--muted)] mb-6">
            السعر تقريبي بالدولار الأمريكي ويُحدَّث يومياً. السعر النهائي والشحن يظهران على AliExpress.
          </p>

          <a
            href={product.affiliateUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="w-full text-center font-semibold py-3.5 rounded-xl bg-[var(--accent)] text-[#06080E] hover:brightness-110 transition-all"
          >
            اشترِ من AliExpress
            <span aria-hidden="true"> ↗</span>
            <span className="sr-only"> (يفتح في نافذة جديدة)</span>
          </a>
          <p className="mt-3 text-[11px] text-[var(--muted)]">
            رابط إحالة: قد نحصل على عمولة دون تكلفة إضافية عليك.{' '}
            <Link href="/affiliate-disclosure" className="underline underline-offset-2 hover:text-[var(--text)]">التفاصيل</Link>
          </p>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16" aria-labelledby="related-heading">
          <h2 id="related-heading" className="text-lg font-semibold text-[var(--text)] mb-6">منتجات مشابهة</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {related.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}
    </main>
  )
}
