import type { Product } from './catalog'

export function formatPrice(value: number): string {
  return `$${value.toFixed(2)}`
}

/** Fixed locale so server and client render the same string */
export function formatCount(value: number): string {
  return value.toLocaleString('en-US')
}

export function discountPercent(p: Pick<Product, 'price' | 'originalPrice'>): number | null {
  if (!p.originalPrice || p.originalPrice <= p.price) return null
  const pct = Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
  return pct > 0 ? pct : null
}
