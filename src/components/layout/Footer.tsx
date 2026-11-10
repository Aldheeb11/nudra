import Link from 'next/link'
import { CATEGORIES } from '@/lib/catalog'
import { contactEmail } from '@/lib/site'

export function Footer() {
  const pages = [
    { href: '/about',                label: 'من نحن' },
    { href: '/affiliate-disclosure', label: 'إفصاح الإحالة' },
    { href: '/privacy',              label: 'سياسة الخصوصية' },
    { href: '/terms',                label: 'شروط الاستخدام' },
    ...(contactEmail() ? [{ href: '/contact', label: 'تواصل معنا' }] : []),
  ]

  return (
    <footer className="mt-auto border-t border-[var(--bg-border)] bg-[var(--bg-card)]/40">
      <div className="mx-auto max-w-6xl px-4 py-10 grid gap-8 sm:grid-cols-3 text-sm">
        <div>
          <p className="text-lg font-bold text-[var(--accent)] mb-2">Nudra</p>
          <p className="text-[var(--muted)] text-xs leading-relaxed max-w-xs">
            منصة عربية لاكتشاف منتجات AliExpress الأكثر مبيعاً. الشراء والدفع والشحن يتم مباشرة عبر AliExpress.
          </p>
        </div>

        <nav aria-label="التصنيفات">
          <p className="font-semibold text-[var(--text)] mb-3">التصنيفات</p>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-[var(--muted)]">
            {CATEGORIES.map((c) => (
              <li key={c._id}>
                <Link href={`/category/${c.slug}`} className="hover:text-[var(--text)] transition-colors">{c.name}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="روابط الموقع">
          <p className="font-semibold text-[var(--text)] mb-3">الموقع</p>
          <ul className="space-y-2 text-xs text-[var(--muted)]">
            {pages.map((p) => (
              <li key={p.href}>
                <Link href={p.href} className="hover:text-[var(--text)] transition-colors">{p.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-[var(--bg-border)]">
        <p className="mx-auto max-w-6xl px-4 py-4 text-[11px] text-[var(--muted)] leading-relaxed">
          روابط المنتجات روابط إحالة: قد نحصل على عمولة عند الشراء عبرها دون أي تكلفة إضافية عليك.
          Nudra موقع مستقل وغير تابع لـ AliExpress.
        </p>
      </div>
    </footer>
  )
}
