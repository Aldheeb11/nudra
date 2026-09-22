import type { Metadata } from 'next'
import './globals.css'

// Use system font stack — avoids build-time Google Fonts fetch
const fontVariable = '--font-inter'

export const metadata: Metadata = {
  title:       'Nudra — اكتشف أفضل المنتجات',
  description: 'منصة اكتشاف المنتجات المنسلية بأفضل الأسعار من AliExpress',
  openGraph: {
    type:   'website',
    locale: 'ar_AE',
    siteName: 'Nudra',
  },
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
