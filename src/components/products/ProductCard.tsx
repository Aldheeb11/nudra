import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/lib/products'
import { discountPercent, formatCount, formatPrice } from '@/lib/format'

interface Props {
  product: Product
  priority?: boolean
}

export function ProductCard({ product, priority = false }: Props) {
  const discount = discountPercent(product)
  const href = `/products/${product._id}`

  return (
    <article className="group flex flex-col rounded-xl border border-[var(--bg-border)] bg-[var(--bg-card)] overflow-hidden hover:border-[var(--accent)]/40 transition-all duration-200 hover:-translate-y-0.5">
      {/* Image → product page */}
      <Link href={href} className="relative block aspect-square bg-[var(--bg-border)]/30 overflow-hidden" tabIndex={-1} aria-hidden="true">
        {product.image ? (
          <Image
            src={product.image}
            alt=""
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

        {discount !== null && (
          <span dir="ltr" className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500/90 text-white">
            -{discount}%
          </span>
        )}

        {product.rating ? (
          <span dir="ltr" className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#2a2210] text-[var(--accent2)] border border-[var(--accent2)]/30">
            ★ {product.rating.toFixed(1)}
          </span>
        ) : null}
      </Link>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <h3 className="text-xs text-[var(--text)] font-medium line-clamp-2 leading-relaxed">
          <Link href={href} className="hover:text-[var(--accent)] transition-colors">
            {product.title}
          </Link>
        </h3>

        {product.soldCount ? (
          <p className="text-[10px] text-[var(--muted)]">
            تم بيع <span dir="ltr">{formatCount(product.soldCount)}+</span>
          </p>
        ) : null}

        <div className="mt-auto flex flex-col gap-2">
          <div className="flex items-center gap-2" dir="ltr" style={{ justifyContent: 'flex-end' }}>
            {product.originalPrice ? (
              <span className="text-[10px] text-[var(--muted)] line-through">
                {formatPrice(product.originalPrice)}
              </span>
            ) : null}
            <span className="text-sm font-bold text-[var(--green)]">{formatPrice(product.price)}</span>
          </div>
          <a
            href={product.affiliateUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="w-full text-center text-xs font-semibold py-1.5 rounded-lg bg-[var(--accent)] text-[#06080E] hover:brightness-110 transition-all"
          >
            اشترِ من AliExpress
            <span aria-hidden="true"> ↗</span>
            <span className="sr-only"> (يفتح في نافذة جديدة)</span>
          </a>
        </div>
      </div>
    </article>
  )
}
