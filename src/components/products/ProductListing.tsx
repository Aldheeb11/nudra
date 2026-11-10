import Link from 'next/link'
import { ProductGrid } from './ProductGrid'
import { countProducts, getCategories, getProducts } from '@/lib/products'

/** Listing URL for a category and/or search query */
export function listingHref(category?: string, q?: string): string {
  const base = category ? `/category/${category}` : '/products'
  return q ? `${base}?${new URLSearchParams({ q })}` : base
}

/** Heading + category chips + infinite grid, shared by /products and /category/[slug] */
export async function ProductListing({ category, q }: { category?: string; q?: string }) {
  const [{ products, nextCursor }, total, categories] = await Promise.all([
    getProducts({ category, q, limit: 24 }),
    countProducts({ category, q }),
    getCategories(),
  ])

  const categoryName = categories.find((c) => c.slug === category)?.name
  const heading = q ? `نتائج البحث عن «${q}»` : categoryName ?? 'جميع المنتجات'
  const chip = (active: boolean) =>
    `shrink-0 px-3.5 py-2 rounded-lg text-xs border transition-all ${
      active
        ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/10'
        : 'border-[var(--bg-border)] text-[var(--muted)] bg-[var(--bg-card)] hover:text-[var(--text)]'
    }`

  return (
    <main className="mx-auto max-w-6xl px-4 pb-16">

      <div className="py-8 flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-[var(--text)]">
          {heading}
          {q && categoryName ? <span className="text-sm font-normal text-[var(--muted)]"> في {categoryName}</span> : null}
        </h1>
        <span className="shrink-0 text-xs text-[var(--muted)]">
          <span dir="ltr">{total.toLocaleString('en-US')}</span> منتج
        </span>
      </div>

      {/* Category filter chips */}
      <nav aria-label="تصفية حسب التصنيف" className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
        <Link href={listingHref(undefined, q)} aria-current={!category ? 'page' : undefined} className={chip(!category)}>
          الكل
        </Link>
        {categories.map(cat => (
          <Link
            key={cat._id}
            href={listingHref(cat.slug, q)}
            aria-current={category === cat.slug ? 'page' : undefined}
            className={chip(category === cat.slug)}
          >
            {cat.name}
          </Link>
        ))}
      </nav>

      {products.length > 0 ? (
        <ProductGrid
          key={`${category ?? ''}|${q ?? ''}`}
          initialProducts={products}
          initialCursor={nextCursor}
          category={category}
          q={q}
        />
      ) : (
        <div className="rounded-xl border border-[var(--bg-border)] bg-[var(--bg-card)] px-6 py-14 text-center">
          <p className="text-sm text-[var(--text)] mb-1">
            {q ? `لا توجد نتائج لـ «${q}»` : 'لا توجد منتجات في هذا التصنيف حالياً'}
          </p>
          <p className="text-xs text-[var(--muted)] mb-5">
            {q ? 'جرّب كلمات أخرى أو تصفّح كل المنتجات.' : 'نضيف منتجات جديدة يومياً.'}
          </p>
          <Link href="/products" className="inline-block px-4 py-2 rounded-lg border border-[var(--accent)] text-xs text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-colors">
            عرض كل المنتجات
          </Link>
        </div>
      )}
    </main>
  )
}
