import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-24 text-center">
      <p className="text-5xl font-bold text-[var(--accent)] mb-4" dir="ltr">404</p>
      <h1 className="text-lg font-semibold text-[var(--text)] mb-2">الصفحة غير موجودة</h1>
      <p className="text-sm text-[var(--muted)] mb-8">ربما حُذف المنتج أو تغيّر الرابط.</p>
      <Link href="/products" className="inline-block px-5 py-2.5 rounded-xl bg-[var(--accent)] text-[#06080E] text-sm font-semibold hover:brightness-110 transition-all">
        تصفح المنتجات
      </Link>
    </main>
  )
}
