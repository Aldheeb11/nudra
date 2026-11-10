import type { Metadata } from 'next'

export const SITE_NAME = 'Nudra'
export const SITE_DESCRIPTION =
  'منصة عربية لاكتشاف منتجات AliExpress الأكثر مبيعاً بأسعار محدّثة يومياً — إلكترونيات، أزياء، منزل، رياضة وأكثر'

/**
 * Canonical origin of the production site (no trailing slash).
 * NEXT_PUBLIC_SITE_URL wins; on Vercel the production domain is picked up automatically.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '') ||
  'https://nudra-psi.vercel.app'
).replace(/\/+$/, '')

export const absoluteUrl = (path = '/') => `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`

// Setting `openGraph` on a page replaces the layout's, including the file-based image,
// so the site-wide image is re-attached here.
const DEFAULT_OG_IMAGE = {
  url:    '/opengraph-image.png',
  width:  1200,
  height: 630,
  alt:    'Nudra — اكتشف المنتجات الأكثر مبيعاً على AliExpress',
}

/** Title + description + canonical + matching Open Graph tags for one page */
export function pageMetadata(opts: {
  title?: string
  description?: string
  path: string
  /** Page-specific og:image (the site-wide image is used when omitted) */
  image?: string
  noIndex?: boolean
}): Metadata {
  const description = opts.description ?? SITE_DESCRIPTION
  return {
    title: opts.title,
    description,
    alternates: opts.noIndex ? undefined : { canonical: opts.path },
    robots: opts.noIndex ? { index: false, follow: true } : undefined,
    openGraph: {
      type:     'website',
      locale:   'ar_AE',
      siteName: SITE_NAME,
      title:    opts.title ? `${opts.title} — ${SITE_NAME}` : `${SITE_NAME} — اكتشف أفضل المنتجات`,
      description,
      url:      opts.path,
      images:   [opts.image ? { url: opts.image } : DEFAULT_OG_IMAGE],
    },
  }
}

/** Serialise JSON-LD safely for an inline <script> */
export const jsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c')

/** Public contact address; contact page and links are hidden when unset */
export function contactEmail(): string | undefined {
  const v = process.env.CONTACT_EMAIL?.trim()
  return v && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? v : undefined
}
