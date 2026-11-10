import type { Metadata, Viewport } from 'next'
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/site'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title:       { default: `${SITE_NAME} — اكتشف أفضل المنتجات`, template: `%s — ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  // og:image / twitter:image come from app/opengraph-image.png
  openGraph: {
    type:     'website',
    locale:   'ar_AE',
    siteName: SITE_NAME,
    title:    `${SITE_NAME} — اكتشف أفضل المنتجات`,
    description: SITE_DESCRIPTION,
    url:      '/',
  },
  twitter: { card: 'summary_large_image' },
  formatDetection: { telephone: false },
}

export const viewport: Viewport = {
  themeColor:  '#0A0C10',
  colorScheme: 'dark',
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
