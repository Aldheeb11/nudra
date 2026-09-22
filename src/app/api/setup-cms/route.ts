import { NextResponse } from 'next/server';

export const runtime = 'edge';

async function createCollection(id: string, displayName: string, fields: object[]) {
  const res = await fetch('https://www.wixapis.com/wix-data/v2/collections', {
    method: 'POST',
    headers: {
      'Authorization': process.env.WIX_API_KEY!,
      'wix-site-id': process.env.WIX_SITE_ID!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ collection: { id, displayName, fields } }),
  });
  const body = await res.json();
  return { id, status: res.status, ok: res.ok, body };
}

export async function GET() {
  const results = await Promise.all([
    createCollection('Products', 'Products', [
      { key: 'name', displayName: 'Name', type: 'TEXT' },
      { key: 'description', displayName: 'Description', type: 'TEXT' },
      { key: 'price', displayName: 'Price', type: 'NUMBER' },
      { key: 'image', displayName: 'Image', type: 'IMAGE' },
      { key: 'aliexpressId', displayName: 'AliExpress ID', type: 'TEXT' },
      { key: 'category', displayName: 'Category', type: 'TEXT' },
      { key: 'inStock', displayName: 'In Stock', type: 'BOOLEAN' },
      { key: 'affiliateUrl', displayName: 'Affiliate URL', type: 'URL' },
    ]),
    createCollection('Categories', 'Categories', [
      { key: 'name', displayName: 'Name', type: 'TEXT' },
      { key: 'slug', displayName: 'Slug', type: 'TEXT' },
      { key: 'image', displayName: 'Image', type: 'IMAGE' },
    ]),
  ]);
  return NextResponse.json({ results });
}
