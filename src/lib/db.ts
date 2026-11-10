import postgres from 'postgres'

type Sql = ReturnType<typeof postgres>

// Reuse one client across hot reloads / warm serverless invocations
const globalForDb = globalThis as unknown as { __nudraSql?: Sql }

export function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL)
}

export function getSql(): Sql {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL is not set')
  if (!globalForDb.__nudraSql) {
    globalForDb.__nudraSql = postgres(url, {
      max: 3,
      idle_timeout: 20,
      connect_timeout: 10,
      prepare: false, // required behind pgbouncer-style poolers (Neon / Supabase pooled URLs)
      onnotice: () => {},
    })
  }
  return globalForDb.__nudraSql
}

export async function ensureSchema(): Promise<void> {
  const sql = getSql()
  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id             text PRIMARY KEY,
      title          text NOT NULL,
      price          numeric(12,2) NOT NULL,
      original_price numeric(12,2),
      currency       text NOT NULL DEFAULT 'USD',
      image          text NOT NULL,
      affiliate_url  text NOT NULL,
      category       text NOT NULL,
      rating         real,
      sold_count     integer NOT NULL DEFAULT 0,
      created_at     timestamptz NOT NULL DEFAULT now(),
      updated_at     timestamptz NOT NULL DEFAULT now()
    )`
  await sql`CREATE INDEX IF NOT EXISTS products_category_sold_idx ON products (category, sold_count DESC, id)`
  await sql`CREATE INDEX IF NOT EXISTS products_sold_idx ON products (sold_count DESC, id)`
}
