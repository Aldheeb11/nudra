'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ProductCard }  from './ProductCard'
import type { Product } from '@/lib/products'

interface Props {
  initialProducts: Product[]
  initialCursor?:  string
  category?:       string
  q?:              string
}

/**
 * Infinite-scroll grid. The parent passes a `key` built from the filters,
 * so changing category/search remounts this with fresh state.
 */
export function ProductGrid({ initialProducts, initialCursor, category, q }: Props) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [cursor,   setCursor]   = useState<string | undefined>(initialCursor)
  const [status,   setStatus]   = useState<'idle' | 'loading' | 'error'>('idle')
  const sentinel = useRef<HTMLDivElement>(null)

  const loadMore = useCallback(async () => {
    if (!cursor) return
    setStatus('loading')
    try {
      const params = new URLSearchParams({ cursor })
      if (category) params.set('category', category)
      if (q)        params.set('q', q)
      const res = await fetch(`/api/products?${params}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: { products: Product[]; nextCursor?: string } = await res.json()
      setProducts((prev) => {
        const seen = new Set(prev.map((p) => p._id))
        return [...prev, ...data.products.filter((p) => !seen.has(p._id))]
      })
      setCursor(data.nextCursor)
      setStatus('idle')
    } catch {
      setStatus('error')
    }
  }, [cursor, category, q])

  // Load the next page when the sentinel approaches the viewport
  useEffect(() => {
    const el = sentinel.current
    if (!el || !cursor || status !== 'idle') return
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore() },
      { rootMargin: '600px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [cursor, status, loadMore])

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((p, i) => (
          <ProductCard key={p._id} product={p} priority={i < 4} />
        ))}
      </div>

      {cursor && <div ref={sentinel} aria-hidden="true" className="h-px" />}

      <div className="flex justify-center py-8 min-h-[4.5rem]" aria-live="polite">
        {status === 'loading' && (
          <div role="status" className="flex items-center gap-2 text-xs text-[var(--muted)]">
            <span className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
            جارٍ تحميل المزيد…
          </div>
        )}
        {status === 'error' && (
          <div className="flex items-center gap-3 text-xs text-[var(--muted)]">
            تعذّر تحميل المزيد من المنتجات.
            <button
              type="button"
              onClick={loadMore}
              className="px-3 py-1.5 rounded-lg border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-colors"
            >
              إعادة المحاولة
            </button>
          </div>
        )}
      </div>
    </>
  )
}
