import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://nudra-psi.vercel.app'),
  title:       { default: 'Nudra — اكتشف أفضل المنتجات', template: '%s — Nudra' },
  description: 'منصة اكتشاف منتجات AliExpress بأفضل الأسعار — إلكترونيات، أزياء، منزل، رياضة وأكثر',
  openGraph: {
    type:   'website',
    locale: 'ar_AE',
    siteName: 'Nudra',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Nudra — أفضل منتجات AliExpress' }],
  },
  twitter: { card: 'summary_large_image' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen flex flex-col">
        <a href="#content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:start-2 focus:z-[60] focus:px-3 focus:py-2 focus:rounded-lg focus:bg-[var(--accent)] focus:text-[#06080E] focus:text-sm">
          تخطَّ إلى المحتوى
        </a>
        <Navbar />
        <div id="content" className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  )
}
