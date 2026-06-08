import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'
import { sendEmail, apologyBonusEmail, generalApologyEmail } from '@/lib/email/resend'

export const maxDuration = 60

const schema = z.object({
  // 'failed'  → only users who had a FAILED cover generation (and haven't been emailed for it yet)
  // 'all'     → every current user
  audience:   z.enum(['failed', 'all']),
  bonusCount: z.number().int().min(1).max(50).default(6),
  dryRun:     z.boolean().optional(), // preview recipient count without sending
})

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const adminUser = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!adminUser?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body   = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const { audience, bonusCount, dryRun } = parsed.data

  let recipients: { id: string; email: string; name: string | null; failedCoverIds: string[] }[] = []

  if (audience === 'failed') {
    const failedCovers = await prisma.cover.findMany({
      where: { status: 'FAILED', apologySentAt: null },
      select: { id: true, userId: true },
    })
    const userIds = [...new Set(failedCovers.map(c => c.userId))]
    if (userIds.length > 0) {
      const users = await prisma.user.findMany({
        where: { id: { in: userIds }, isBanned: false },
        select: { id: true, email: true, name: true },
      })
      recipients = users.map(u => ({
        ...u,
        failedCoverIds: failedCovers.filter(c => c.userId === u.id).map(c => c.id),
      }))
    }
  } else {
    const users = await prisma.user.findMany({
      where: { isBanned: false },
      select: { id: true, email: true, name: true },
    })
    recipients = users.map(u => ({ ...u, failedCoverIds: [] }))
  }

  if (dryRun) {
    return NextResponse.json({ dryRun: true, recipientCount: recipients.length })
  }

  let sent = 0
  let failed = 0

  for (const r of recipients) {
    const firstName = (r.name ?? r.email.split('@')[0]).split(' ')[0]
    const html = audience === 'failed'
      ? apologyBonusEmail({ name: firstName, bonusCount })
      : generalApologyEmail({ name: firstName, bonusCount })

    const subject = audience === 'failed'
      ? "We're sorry — here's 6 free covers on us 🎁"
      : 'A small thank-you from KDP Cover AI 🎁'

    const result = await sendEmail({ to: r.email, subject, html })

    if (result.ok) {
      sent++
      await prisma.$transaction([
        prisma.user.update({
          where: { id: r.id },
          data: { generationsLimit: { increment: bonusCount } },
        }),
        ...(r.failedCoverIds.length > 0
          ? [prisma.cover.updateMany({
              where: { id: { in: r.failedCoverIds } },
              data: { apologySentAt: new Date() },
            })]
          : []),
      ])
    } else {
      failed++
    }
  }

  return NextResponse.json({ sent, failed, totalRecipients: recipients.length, bonusCount, audience })
}
