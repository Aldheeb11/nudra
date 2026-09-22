import { Navbar }      from '@/components/layout/Navbar'
import { ProductGrid } from '@/components/products/ProductGrid'
import { getProducts, getCategories } from '@/lib/wix'

export const revalidate = 3600 // 1h for product list

interface Props {
  searchParams: Promise<{ category?: string; cursor?: string }>
}

export default async function ProductsPage({ searchParams }: Props) {
  const { category } = await searchParams

  const [{ products, nextCursor }, categories] = await Promise.all([
    getProducts({ categoryId: category, limit: 24 }),
    getCategories(),
  ])

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 pb-16">

        <div className="py-8 flex items-center justify-between">
          <h1 className="text-xl font-bold text-[var(--text)]">
            {category
              ? categories.find(c => c.slug === category)?.name ?? 'املمنتجات'
              : 'جميع المنتجاڪ'}
          </h1>
          <span className="text-xs text-[var(--muted)]">
            {products.length}+ منتج
          </span>
        </div>

        {/* Category filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
          <a
            href="/products"
            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs border transition-all ${
              !category
                ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/10'
                : 'border-[var(--bg-border)] text-[var(--muted)] bg-[var(--bg-card)]'
            }`}
          >
            الكل
          </a>
          {categories.map(cat => (
            <a
              key={cat._id}
              href={`/products?category=${cat.slug}`}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs border transition-all ${
                category === cat.slug
                  ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/10'
                  : 'border-[var(--bg-border)] text-[var(--muted)] bg-[var(--bg-card)]'
              }`}
            >
              {cat.name}
            </a>
          ))}
        </div>

        {/* Virtual scroll product grid */}
        <ProductGrid
          initialProducts={products}
          initialCursor={nextCursor}
          categoryId={category}
        />
      </main>
    </>
  )
}
