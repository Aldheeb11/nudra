/**
 * Vercel Cron Job endpoint for daily sync
 * Add to vercel.json:
 *   "crons": [{ "path": "/api/sync", "schedule": "0 3 * * *" }]
 */
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 300 // 5 min Vercel Pro limit

export async function GET(req: NextRequest) {
  // Security: verify Vercel cron secret
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Dynamic import to avoid bundling Bull in edge runtime
    const { startSync } = await import('../../../../jobs/sync')
    await startSync()
    return NextResponse.json({ ok: true, started: new Date().toISOString() })
  } catch (err) {
    console.error('[/api/sync]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
