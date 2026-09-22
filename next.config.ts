import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Wix Media CDN
      { protocol: 'https', hostname: 'static.wixstatic.com' },
      { protocol: 'https', hostname: '*.wixstatic.com' },
      // AliExpress product images
      { protocol: 'https', hostname: '*.alicdn.com' },
      { protocol: 'https', hostname: 'ae01.alicdn.com' },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400, // 24h CDN cache for product images
  },

  // Keep bull (and its child_process deps) out of the webpack bundle
  serverExternalPackages: ['bull', 'ioredis'],

  // ISR default revalidation — individual pages override this
  experimental: {
    ppr: false, // enable when stable
  },
}

export default nextConfig
