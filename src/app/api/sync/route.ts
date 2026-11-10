/**
 * Daily AliExpress → Postgres sync, triggered by Vercel Cron (see vercel.json).
 */
import { NextRequest, NextResponse } from 'next/server'
import { runSync } from '@/lib/sync'

export const maxDuration = 300

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  // Fail closed: without a configured secret nobody may trigger the sync
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await runSync()
    const failed = Object.values(result.categories).filter((c) => c.error).length
    const status = result.upserted === 0 && failed > 0 ? 502 : 200
    return NextResponse.json({ ok: status === 200, ...result }, { status })
  } catch (err) {
    console.error('[/api/sync]', err)
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}
