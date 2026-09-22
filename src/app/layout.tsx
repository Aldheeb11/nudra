import type { Metadata } from 'next'
import './globals.css'

// Use system font stack — avoids build-time Google Fonts fetch
const fontVariable = '--font-inter'

export const metadata: Metadata = {
  metadataBase: new URL('https://nudra-psi.vercel.app'),
  title:       'Nudra — اكتشف أفضل المنتجات',
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
      <body style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif' }}>
        {children}
      </body>
    </html>
  )
}
