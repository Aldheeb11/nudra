import Image from 'next/image'
import type { Product } from '@/lib/wix'

interface Props {
  product: Product
  priority?: boolean
}

export function ProductCard({ product, priority = false }: Props) {
  return (
    <a
      href={product.affiliateUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="group flex flex-col rounded-xl border border-[var(--bg-border)] bg-[var(--bg-card)] overflow-hidden hover:border-[var(--accent)]/40 transition-all duration-200 hover:-translate-y-0.5"
    >
      {/* Image */}
      <div className="relative aspect-square bg-[var(--bg-border)]/30 overflow-hidden">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            priority={priority}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[var(--muted)] text-xs">
            لا توجد صورة
          </div>
        )}

        {/* Rating badge */}
        {product.rating && (
          <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[var(--accent2)]/20 text-[var(--accent2)] border border-[var(--accent2)]/30">
            ★ {product.rating.toFixed(1)}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <p className="text-xs text-[var(--text)] font-medium line-clamp-2 leading-relaxed">
          {product.title}
        </p>
        <div className="mt-auto flex items-center justify-between">
          <span className="text-sm font-bold text-[var(--green)]">
            ${product.price.toFixed(2)}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">
            AliExpress ↗
          </span>
        </div>
      </div>
    </a>
  )
}
