import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'
import { sendEmail, SITE_URL } from '@/lib/email/resend'

export async function POST() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const caller = await prisma.user.findUnique({ where: { clerkId: userId }, select: { email: true } })
  if (caller?.email !== process.env.OWNER_EMAIL) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const limitHitters = await prisma.user.findMany({
    where: { plan: 'FREE', subscriptionStatus: { not: 'active' }, generationsUsed: { gte: prisma.user.fields.generationsLimit } },
    select: { email: true, name: true, generationsUsed: true },
  }).catch(() => [] as any[])

  // Fallback: raw query if Prisma field comparison not supported
  const users: Array<{ email: string; name: string | null }> = limitHitters.length
    ? limitHitters
    : await prisma.$queryRaw`
        SELECT email, name FROM "User"
        WHERE plan = 'FREE'
        AND "subscriptionStatus" != 'active'
        AND "generationsUsed" >= "generationsLimit"
      `

  let sent = 0
  for (const u of users) {
    const firstName = u.name?.split(' ')[0] || 'there'
    await sendEmail({
      to: u.email,
      subject: '🚀 You hit your free limit — here\'s 20% off to keep going',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#0f0f13;color:#fff;padding:32px;border-radius:16px">
          <h2 style="color:#fff;margin-bottom:8px">Hey ${firstName} 👋</h2>
          <p style="color:#9ca3af">You've used all your free KDP Cover AI generations — which means you made some great covers!</p>
          <p style="color:#9ca3af">To keep generating professional KDP covers, upgrade today. Use code below for <strong style="color:#fff">20% off your first month:</strong></p>
          <div style="background:#1f2937;border:1px solid #4c1d95;border-radius:12px;padding:16px;text-align:center;margin:24px 0">
            <p style="color:#a78bfa;font-size:24px;font-weight:900;letter-spacing:4px;margin:0;font-family:monospace">UPGRADE20</p>
          </div>
          <a href="${SITE_URL}/pricing" style="display:block;background:#7c3aed;color:#fff;font-weight:700;text-align:center;padding:14px;border-radius:12px;text-decoration:none;margin-bottom:16px">
            Upgrade Now — 20% Off →
          </a>
          <p style="color:#4b5563;font-size:12px;text-align:center">
            Starter from ₦10,960/mo · Pro from ₦32,880/mo · Cancel anytime<br>
            <a href="${SITE_URL}/unsubscribe" style="color:#4b5563">Unsubscribe</a>
          </p>
        </div>
      `,
    })
    sent++
  }

  return NextResponse.json({ sent, total: users.length })
}
