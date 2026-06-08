import { NextRequest, NextResponse } from 'next/server'
import { runBugAnalysis } from '@/lib/bug-analysis'
import { sendEmail, weeklyBugReportEmail } from '@/lib/email/resend'

export const maxDuration = 60

// Owner inbox — gets the weekly AI-diagnosed bug summary
const OWNER_EMAIL = 'olopadekehinde98@gmail.com'

// ─── Vercel Cron — run weekly ────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const secret = req.headers.get('authorization')
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await runBugAnalysis({ withAi: true })

  // Don't spam an empty inbox if there's nothing to report
  if (result.totalErrorEvents === 0) {
    return NextResponse.json({ skipped: true, reason: 'No errors in the last 30 days', ...result })
  }

  const html = weeklyBugReportEmail({
    windowDays: result.windowDays,
    totalErrorEvents: result.totalErrorEvents,
    uniquePatterns: result.uniquePatterns,
    openCount: result.openCount,
    topPatterns: result.topPatterns,
    aiSummary: result.aiSummary,
  })

  const sendResult = await sendEmail({
    to: OWNER_EMAIL,
    subject: `🐛 Weekly Bug Report — ${result.openCount} open pattern${result.openCount === 1 ? '' : 's'}, ${result.totalErrorEvents} error events`,
    html,
  })

  return NextResponse.json({
    sent: sendResult.ok,
    totalErrorEvents: result.totalErrorEvents,
    uniquePatterns: result.uniquePatterns,
    openCount: result.openCount,
  })
}
