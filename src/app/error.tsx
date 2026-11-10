'use client' // Error boundaries must be Client Components
import { useEffect } from 'react'

export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="mx-auto max-w-6xl px-4 py-24 text-center">
      <h1 className="text-lg font-semibold text-[var(--text)] mb-2">حدث خطأ غير متوقع</h1>
      <p className="text-sm text-[var(--muted)] mb-8">تعذّر تحميل هذه الصفحة. حاول مرة أخرى بعد قليل.</p>
      <button
        type="button"
        onClick={() => retry()}
        className="px-5 py-2.5 rounded-xl bg-[var(--accent)] text-[#06080E] text-sm font-semibold hover:brightness-110 transition-all"
      >
        إعادة المحاولة
      </button>
    </main>
  )
}
