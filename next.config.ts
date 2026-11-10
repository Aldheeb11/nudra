import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // AliExpress product images
      { protocol: 'https', hostname: '*.alicdn.com' },
      { protocol: 'https', hostname: '*.aliexpress-media.com' },
      // Unsplash (local-dev sample catalog only)
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400, // 24h CDN cache for product images
  },

  // ISR default revalidation — individual pages override this
  experimental: {
    ppr: false, // enable when stable
  },
}

export default nextConfig
