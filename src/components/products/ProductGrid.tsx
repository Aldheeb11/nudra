'use client'
import { useRef, useState, useCallback } from 'react'
import { useVirtualizer }  from '@tanstack/react-virtual'
import { ProductCard }     from './ProductCard'
import type { Product }    from '@/lib/wix'

interface Props {
  initialProducts: Product[]
  initialCursor?:  string
  categoryId?:     string
}

export function ProductGrid({ initialProducts, initialCursor, categoryId }: Props) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [cursor,   setCursor]   = useState<string | undefined>(initialCursor)
  const [loading,  setLoading]  = useState(false)

  const parentRef = useRef<HTMLDivElement>(null)

  // Virtual grid — 2 columns on mobile, 3 on md, 4 on lg
  const COLS = typeof window !== 'undefined'
    ? window.innerWidth < 640 ? 2 : window.innerWidth < 1024 ? 3 : 4
    : 4

  const rows = Math.ceil(products.length / COLS)

  const virtualizer = useVirtualizer({
    count:         rows,
    getScrollElement: () => parentRef.current,
    estimateSize:  () => 320, // approx card height
    overscan:      3,
  })

  // Infinite scroll — load more when near bottom
  const loadMore = useCallback(async () => {
    if (!cursor || loading) return
    setLoading(true)
    try {
      const params = new URLSearchParams({ cursor })
      if (categoryId) params.set('category', categoryId)
      const res  = await fetch(`/api/products?${params}`)
      const data = await res.json()
      setProducts(prev => [...prev, ...data.products])
      setCursor(data.nextCursor)
    } finally {
      setLoading(false)
    }
  }, [cursor, loading, categoryId])

  // Trigger loadMore when last virtual row is visible
  const lastItem = virtualizer.getVirtualItems().at(-1)
  if (lastItem && lastItem.index >= rows - 2 && cursor && !loading) {
    loadMore()
  }

  return (
    <div ref={parentRef} className="h-full overflow-auto">
      <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
        {virtualizer.getVirtualItems().map(vRow => {
          const startIdx = vRow.index * COLS
          const rowItems = products.slice(startIdx, startIdx + COLS)

          return (
            <div
              key={vRow.key}
              data-index={vRow.index}
              ref={virtualizer.measureElement}
              style={{
                position:  'absolute',
                top:       0,
                transform: `translateY(${vRow.start}px)`,
                width:     '100%',
              }}
            >
              <div className={`grid gap-4 pb-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4`}>
                {rowItems.map((p, i) => (
                  <ProductCard key={p._id} product={p} priority={vRow.index === 0 && i < 4} />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}
