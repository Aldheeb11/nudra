/**
 * Daily AliExpress → Postgres sync, triggered by Vercel Cron (see vercel.json).
 */
import { createHash, timingSafeEqual } from 'node:crypto'
import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { PRODUCTS_TAG } from '@/lib/products'
import { runSync } from '@/lib/sync'

export const maxDuration = 300

const sha256 = (v: string) => createHash('sha256').update(v).digest()

/** Constant-time check; fails closed when CRON_SECRET is not configured */
function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const given = req.headers.get('authorization') ?? ''
  return timingSafeEqual(sha256(given), sha256(`Bearer ${secret}`))
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await runSync()
    if (result.upserted > 0 || result.removed > 0) {
      // Drop cached product reads and every statically generated page built from them
      revalidateTag(PRODUCTS_TAG, { expire: 0 })
      revalidatePath('/', 'layout')
    }
    const failed = Object.values(result.categories).filter((c) => c.error).length
    const status = result.upserted === 0 && failed > 0 ? 502 : 200
    return NextResponse.json({ ok: status === 200, ...result }, { status })
  } catch (err) {
    console.error('[/api/sync]', err)
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}
