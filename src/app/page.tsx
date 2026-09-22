import { Navbar }      from '@/components/layout/Navbar'
import { ProductCard } from '@/components/products/ProductCard'
import { getFeaturedProducts, getCategories } from '@/lib/wix'

// Dynamic — data fetched at request time (avoids build-time Wix auth)
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  // Parallel fetch — gracefully degrade if Wix isn't seeded yet
  const [products, categories] = await Promise.all([
    getFeaturedProducts().catch(() => []),
    getCategories().catch(() => []),
  ])

  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 pb-16">

        {/* ── Hero ── */}
        <section className="py-16 text-center">
          <p className="text-[var(--accent)] text-xs font-semibold tracking-widest mb-3">
            منصة اكتشاف المنتجات
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--text)] leading-tight mb-4">
            أفضل منتجات المنسل<br />
            <span className="text-[var(--accent)]">بأسعار لا تُقاوَم</span>
          </h1>
          <p className="text-[var(--muted)] text-base max-w-md mx-auto mb-8">
            نختار لك أفضل المنتجات من AliExpress ونقارن الأسعار يومياً
          </p>
          <a
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--accent)] text-[#06080E] font-semibold text-sm hover:brightness-110 transition-all"
          >
            تصفح المنتجات
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </a>
        </section>

        {/* ── Categories ── */}
        {categories.length > 0 && (
          <section className="mb-12">
            <h2 className="text-sm font-semibold text-[var(--muted)] tracking-widest mb-4">
              التصنيفات
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map(cat => (
                <a
                  key={cat._id}
                  href={`/products?category=${cat.slug}`}
                  className="shrink-0 px-4 py-2 rounded-xl border border-[var(--bg-border)] bg-[var(--bg-card)] text-xs text-[var(--muted)] hover:border-[var(--accent)]/50 hover:text-[var(--text)] transition-all"
                >
                  {cat.name}
                </a>
              ))}
            </div>
          </section>
        )}

        {/* ── Featured Products ── */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[var(--text)]">منتجات مميسة</h2>
            <a href="/products" className="text-xs text-[var(--accent)] hover:underline">
              عرض الكل →
            </a>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((p, i) => (
                <ProductCard key={p._id} product={p} priority={i < 4} />
              ))}
            </div>
          ) : (
            /* Empty state while Wix CMS is being seeded */
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-[var(--bg-border)] bg-[var(--bg-card)] overflow-hidden">
                  <div className="aspect-square bg-[var(--bg-border)]/20 animate-pulse" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-[var(--bg-border)]/30 rounded animate-pulse" />
                    <div className="h-3 w-2/3 bg-[var(--bg-border)]/20 rounded animate-pulse" />
                    <div className="h-4 w-1/3 bg-[var(--green)]/10 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Footer note ── */}
        <p className="mt-16 text-center text-[10px] text-[var(--muted)]">
          * روابط AliExpress تصتوي على رابط إحالة. السعر لا يتغير عليك.
        </p>
      </main>
    </>
  )
}
