'use client'
import Link from 'next/link'
import { useState } from 'react'

export function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--bg-border)] bg-[var(--bg)]/90 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-[var(--accent)] tracking-tight">
          Nudra
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-[var(--muted)]">
          <Link href="/products" className="hover:text-[var(--text)] transition-colors">المنتجات</Link>
          <Link href="/products?category=electronics" className="hover:text-[var(--text)] transition-colors">إلكترونيات</Link>
          <Link href="/products?category=home-garden" className="hover:text-[var(--text)] transition-colors">المنزل</Link>
        </nav>

        {/* Search + Mobile toggle */}
        <div className="flex items-center gap-3">
          <Link href="/products" className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--bg-border)] text-xs text-[var(--muted)] hover:border-[var(--accent)]/50 transition-colors">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            بحث...
          </Link>
          <button onClick={() => setOpen(!open)} className="md:hidden p-1.5 text-[var(--muted)]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {open
                ? <path d="M18 6 6 18M6 6l12 12"/>
                : <path d="M4 6h16M4 12h16M4 18h16"/>}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-[var(--bg-border)] px-4 py-3 flex flex-col gap-3 text-sm text-[var(--muted)]">
          <Link href="/products"                        onClick={() => setOpen(false)}>المنتجات</Link>
          <Link href="/products?category=electronics"  onClick={() => setOpen(false)}>إلكترونيات</Link>
          <Link href="/products?category=home-garden"  onClick={() => setOpen(false)}>المنزل</Link>
          <Link href="/products?category=beauty-health" onClick={() => setOpen(false)}>الجمال والصحة</Link>
        </div>
      )}
    </header>
  )
}
