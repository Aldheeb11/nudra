/**
 * Categories + the Product type shared across the app.
 * Live products come from Postgres (filled by the AliExpress sync, see sync.ts).
 * SAMPLE_PRODUCTS is only a local-dev fallback used when DATABASE_URL is unset.
 */
export interface Product {
  _id: string
  title: string
  description?: string
  price: number
  originalPrice?: number
  image: string
  affiliateUrl: string
  /** Category slug (see CATEGORIES) */
  category: string
  aliExpressId: string
  rating?: number
  isFeatured?: boolean
  soldCount?: number
}

export interface Category {
  _id: string
  name: string
  slug: string
  icon?: string
}

export const CATEGORIES: Category[] = [
  { _id: 'cat_electronics',  name: 'إلكترونيات',           slug: 'electronics',     icon: '📱' },
  { _id: 'cat_fashion',      name: 'أزياء وملابس',          slug: 'fashion',         icon: '👗' },
  { _id: 'cat_home',         name: 'المنزل والحديقة',       slug: 'home-garden',     icon: '🏠' },
  { _id: 'cat_sports',       name: 'رياضة وهواء طلق',      slug: 'sports-outdoors', icon: '⚽' },
  { _id: 'cat_beauty',       name: 'الجمال والصحة',         slug: 'beauty-health',   icon: '💄' },
  { _id: 'cat_kids',         name: 'الأطفال والألعاب',      slug: 'kids-toys',       icon: '🧸' },
  { _id: 'cat_auto',         name: 'السيارات',              slug: 'automotive',      icon: '🚗' },
  { _id: 'cat_tools',        name: 'الأدوات وأعمال يدوية', slug: 'tools-diy',       icon: '🔧' },
]

// Placeholder products for local development only — not real listings
export const SAMPLE_PRODUCTS: Product[] = [
  {
    _id: 'prod_001',
    title: 'Wireless Bluetooth Earbuds Pro 5.0',
    description: 'Premium wireless earbuds with active noise cancellation, 30hr battery',
    price: 12.99,
    originalPrice: 29.99,
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&q=80',
    affiliateUrl: 'https://s.click.aliexpress.com/e/_DdJ9WPv',
    category: 'electronics',
    aliExpressId: '1005003531234567',
    rating: 4.7,
    isFeatured: true,
    soldCount: 15234,
  },
  {
    _id: 'prod_002',
    title: 'Smart Watch Fitness Tracker IP68',
    description: 'Waterproof smartwatch with heart rate, sleep tracking & 7-day battery',
    price: 18.50,
    originalPrice: 45.00,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80',
    affiliateUrl: 'https://s.click.aliexpress.com/e/_DcK8VNu',
    category: 'electronics',
    aliExpressId: '1005004123456789',
    rating: 4.5,
    isFeatured: true,
    soldCount: 8921,
  },
  {
    _id: 'prod_003',
    title: 'LED Ring Light 26cm with Stand',
    description: '3200K-5500K ring light for streaming, photography & video calls',
    price: 14.99,
    originalPrice: 35.00,
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&q=80',
    affiliateUrl: 'https://s.click.aliexpress.com/e/_DbL7TMt',
    category: 'electronics',
    aliExpressId: '1005002987654321',
    rating: 4.6,
    isFeatured: false,
    soldCount: 23456,
  },
  {
    _id: 'prod_004',
    title: 'Mini Portable Air Purifier USB',
    description: 'HEPA filter desktop air purifier removes 99.97% of airborne particles',
    price: 8.99,
    originalPrice: 22.00,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
    affiliateUrl: 'https://s.click.aliexpress.com/e/_DaM6SLs',
    category: 'home-garden',
    aliExpressId: '1005005876543210',
    rating: 4.4,
    isFeatured: true,
    soldCount: 5678,
  },
  {
    _id: 'prod_005',
    title: 'Resistance Bands Set (11-piece)',
    description: 'Professional exercise bands for home gym, yoga and physical therapy',
    price: 7.49,
    originalPrice: 19.99,
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80',
    affiliateUrl: 'https://s.click.aliexpress.com/e/_D9N5RKr',
    category: 'sports-outdoors',
    aliExpressId: '1005006765432109',
    rating: 4.8,
    isFeatured: true,
    soldCount: 31234,
  },
  {
    _id: 'prod_006',
    title: 'Vitamin C Face Serum 30ml',
    description: 'Brightening serum with 20% Vitamin C + hyaluronic acid for radiant skin',
    price: 5.99,
    originalPrice: 18.00,
    image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&q=80',
    affiliateUrl: 'https://s.click.aliexpress.com/e/_D8P4QJq',
    category: 'beauty-health',
    aliExpressId: '1005007654321098',
    rating: 4.6,
    isFeatured: false,
    soldCount: 9876,
  },
]
