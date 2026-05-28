import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { sendEmail, newsletterEmail, SITE_URL } from '@/lib/email/resend'
import { randomBytes } from 'crypto'

export const maxDuration = 60

// Latest app features to include in the newsletter
const LATEST_FEATURES = [
  {
    emoji: '🖼️',
    title: 'Live Cover Preview — See Your Book Before Downloading',
    desc: 'Your full-wrap cover (front, spine & back) now renders instantly with all text overlays — title, author name, description and more.',
  },
  {
    emoji: '✏️',
    title: 'Edit Cover Text After Generation',
    desc: 'Changed your mind about the title or subtitle? Edit any text on the result screen and the preview updates live.',
  },
  {
    emoji: '🎨',
    title: '8 One-Click Style Templates',
    desc: 'Dark Thriller, Romance Warm, Epic Fantasy, Clean Business and 4 more. Each sets the prompt, font and sizing in one click.',
  },
  {
    emoji: '📱',
    title: 'Amazon Listing Thumbnail Download',
    desc: 'New "Front Cover" button downloads just the front panel — perfect size for your Amazon KDP book listing page.',
  },
  {
    emoji: '🔄',
    title: 'Regenerate Background Without Losing Text',
    desc: 'Not happy with the image? Keep your title, author and description — just regenerate the background with a new style.',
  },
]

const LATEST_TIP = 'Use the "New Background Image" panel to generate 3–4 different art styles for the same book — then pick the one that best fits your genre. This takes 2 minutes and costs 0 extra generations.'

// ─── Vercel Cron — called every 3 days ──────────────────────────────────────
export async function GET(req: NextRequest) {
  // Protect against unauthorized calls
  const secret = req.headers.get('authorization')
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const THREE_DAYS_AGO = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)

  // ── 1. Signed-in users who opted in and haven't been emailed recently ──
  const users = await prisma.user.findMany({
    where: {
      newsletterOptIn: true,
      email: { not: '' },
      OR: [
        { lastNewsletterAt: null },
        { lastNewsletterAt: { lt: THREE_DAYS_AGO } },
      ],
    },
    select: { id: true, email: true, name: true },
    take: 200, // batch limit per cron run
  })

  // ── 2. Confirmed newsletter subscribers not emailed recently ──
  const subs = await prisma.newsletterSubscriber.findMany({
    where: {
      confirmed: true,
      OR: [
        { lastSentAt: null },
        { lastSentAt: { lt: THREE_DAYS_AGO } },
      ],
    },
    take: 200,
  })

  let sent = 0
  let failed = 0

  // Send to signed-in users
  for (const user of users) {
    const unsubToken = randomBytes(20).toString('hex')
    const html = newsletterEmail({
      name: user.name?.split(' ')[0] ?? 'there',
      unsubToken: `uid=${user.id}`, // uid-based unsubscribe
      features: LATEST_FEATURES,
      tip: LATEST_TIP,
    })
    const result = await sendEmail({
      to: user.email,
      subject: "What's new on KDP Cover AI 🎨",
      html,
    })
    if (result.ok) {
      await prisma.user.update({
        where: { id: user.id },
        data: { lastNewsletterAt: new Date() },
      })
      sent++
    } else {
      failed++
    }
  }

  // Send to newsletter-only subscribers
  for (const sub of subs) {
    const html = newsletterEmail({
      name: 'there',
      unsubToken: sub.token,
      features: LATEST_FEATURES,
      tip: LATEST_TIP,
    })
    const result = await sendEmail({
      to: sub.email,
      subject: "What's new on KDP Cover AI 🎨",
      html,
    })
    if (result.ok) {
      await prisma.newsletterSubscriber.update({
        where: { id: sub.id },
        data: { lastSentAt: new Date() },
      })
      sent++
    } else {
      failed++
    }
  }

  console.log(`[Newsletter Cron] Sent: ${sent}, Failed: ${failed}`)
  return NextResponse.json({ ok: true, sent, failed })
}
