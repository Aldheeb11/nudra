export function LegalPage({ title, updated, children }: { title: string; updated?: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-bold text-[var(--text)] mb-2">{title}</h1>
      {updated && <p className="text-xs text-[var(--muted)] mb-8">آخر تحديث: {updated}</p>}
      <div className="legal space-y-4 text-sm leading-loose text-[var(--muted)]">{children}</div>
    </main>
  )
}
