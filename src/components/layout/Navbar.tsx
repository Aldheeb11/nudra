'use client'
import Link from 'next/link'
import { useState } from 'react'

const LINKS = [
  { href: '/products',                        label: 'المنتجات' },
  { href: '/category/electronics',   label: 'إلكترونيات' },
  { href: '/category/home-garden',   label: 'المنزل' },
  { href: '/category/beauty-health', label: 'الجمال والصحة' },
]

// Native GET form: submitting reloads /products?q=…, which also resets the mobile menu
function SearchForm({ className = '' }: { className?: string }) {
  return (
    <form action="/products" role="search" className={`relative ${className}`}>
      <label htmlFor={`q-${className ? 'm' : 'd'}`} className="sr-only">ابحث عن منتج</label>
      <svg
        className="absolute top-1/2 -translate-y-1/2 start-3 text-[var(--muted)] pointer-events-none"
        width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"
      >
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
      <input
        id={`q-${className ? 'm' : 'd'}`}
        type="search"
        name="q"
        maxLength={80}
        placeholder="ابحث عن منتج…"
        className="w-full ps-9 pe-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--bg-border)] text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none transition-colors"
      />
    </form>
  )
}

export function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--bg-border)] bg-[var(--bg)]/90 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between gap-4">
        <Link href="/" className="text-xl font-bold text-[var(--accent)] tracking-tight">
          Nudra
        </Link>

        <nav aria-label="التنقل الرئيسي" className="hidden md:flex items-center gap-6 text-sm text-[var(--muted)]">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-[var(--text)] transition-colors">{l.label}</Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden md:block w-56"><SearchForm /></div>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'إغلاق القائمة' : 'فتح القائمة'}
            className="md:hidden p-2.5 -m-1 text-[var(--muted)]"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              {open
                ? <path d="M18 6 6 18M6 6l12 12"/>
                : <path d="M4 6h16M4 12h16M4 18h16"/>}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-menu" className="md:hidden border-t border-[var(--bg-border)] px-4 py-3 flex flex-col gap-1 text-sm text-[var(--muted)]">
          <SearchForm className="mb-2" />
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="py-2">{l.label}</Link>
          ))}
        </div>
      )}
    </header>
  )
}
