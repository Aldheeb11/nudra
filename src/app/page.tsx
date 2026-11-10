import Link from 'next/link'
import { ProductCard } from '@/components/products/ProductCard'
import { fallbackDuringBuild, getFeaturedProducts, getCategories } from '@/lib/products'
import { SITE_NAME, SITE_URL, jsonLd } from '@/lib/site'

export const metadata = { alternates: { canonical: '/' } }

// Statically generated, refreshed hourly and right after each sync
export const revalidate = 3600

export default async function HomePage() {
  const [products, categories] = await Promise.all([
    getFeaturedProducts().catch(fallbackDuringBuild([])),
    getCategories(),
  ])

  return (
    <main className="mx-auto max-w-6xl px-4 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            '@context': 'https://schema.org',
            '@type':    'WebSite',
            name:       SITE_NAME,
            url:        SITE_URL,
            inLanguage: 'ar',
            potentialAction: {
              '@type':       'SearchAction',
              target:        `${SITE_URL}/products?q={search_term_string}`,
              'query-input': 'required name=search_term_string',
            },
          }),
        }}
      />

      {/* ── Hero ── */}
      <section className="py-16 text-center">
        <p className="text-[var(--accent)] text-xs font-semibold mb-3">
          منصة اكتشاف المنتجات
        </p>
        <h1 className="text-4xl md:text-5xl font-bold text-[var(--text)] leading-tight mb-4">
          إلكترونيات، أزياء، منزل وأكثر<br />
          <span className="text-[var(--accent)]">بأسعار لا تُقاوَم</span>
        </h1>
        <p className="text-[var(--muted)] text-base max-w-md mx-auto mb-8">
          نجمع لك المنتجات الأكثر مبيعاً على AliExpress في {categories.length || 8} تصنيفات ونحدّث الأسعار يومياً
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--accent)] text-[#06080E] font-semibold text-sm hover:brightness-110 transition-all"
        >
          تصفح المنتجات
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </Link>
      </section>

      {/* ── Categories ── */}
      {categories.length > 0 && (
        <section className="mb-12" aria-labelledby="cats-heading">
          <h2 id="cats-heading" className="text-sm font-semibold text-[var(--muted)] mb-4">
            التصنيفات
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map(cat => (
              <Link
                key={cat._id}
                href={`/category/${cat.slug}`}
                className="shrink-0 px-4 py-2.5 rounded-xl border border-[var(--bg-border)] bg-[var(--bg-card)] text-xs text-[var(--muted)] hover:border-[var(--accent)]/50 hover:text-[var(--text)] transition-all"
              >
                <span aria-hidden="true">{cat.icon} </span>{cat.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Best sellers ── */}
      <section aria-labelledby="featured-heading">
        <div className="flex items-center justify-between mb-6">
          <h2 id="featured-heading" className="text-lg font-semibold text-[var(--text)]">الأكثر مبيعاً</h2>
          <Link href="/products" className="text-xs text-[var(--accent)] hover:underline">
            عرض الكل ←
          </Link>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p, i) => (
              <ProductCard key={p._id} product={p} priority={i < 4} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-[var(--bg-border)] bg-[var(--bg-card)] px-6 py-14 text-center">
            <p className="text-sm text-[var(--text)] mb-1">نجهّز المنتجات حالياً</p>
            <p className="text-xs text-[var(--muted)]">عُد قريباً لتصفّح أحدث العروض.</p>
          </div>
        )}
      </section>
    </main>
  )
}
