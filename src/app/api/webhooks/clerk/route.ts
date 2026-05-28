import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { prisma } from '@/lib/db/prisma'
import { sendEmail, welcomeEmail } from '@/lib/email/resend'

/** Generate a unique referral code like KDP-X7K2M9 */
function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'KDP-'
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

async function uniqueReferralCode(): Promise<string> {
  let code = generateReferralCode()
  let attempts = 0
  while (attempts < 10) {
    const existing = await prisma.user.findFirst({ where: { referralCode: code } })
    if (!existing) return code
    code = generateReferralCode()
    attempts++
  }
  // fallback: append timestamp
  return `KDP-${Date.now().toString(36).toUpperCase().slice(-6)}`
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const svixId = req.headers.get('svix-id')
  const svixTimestamp = req.headers.get('svix-timestamp')
  const svixSignature = req.headers.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 })
  }

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!)
  let payload: any

  try {
    payload = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    })
  } catch {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 })
  }

  const { type, data } = payload

  if (type === 'user.created') {
    const email = data.email_addresses?.[0]?.email_address ?? ''
    const name = [data.first_name, data.last_name].filter(Boolean).join(' ') || undefined
    const referralCode = await uniqueReferralCode()

    // Owner email gets AGENCY plan automatically
    const isOwner = email === process.env.OWNER_EMAIL
    const plan = isOwner ? 'AGENCY' : 'FREE'
    const generationsLimit = isOwner ? 999999 : 3

    const existing = await prisma.user.findFirst({ where: { clerkId: data.id } })
    if (existing) {
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          email, name, imageUrl: data.image_url,
          ...(isOwner ? { plan: 'AGENCY', generationsLimit: 999999, subscriptionStatus: 'active' } : {}),
        },
      })
    } else {
      await prisma.user.create({
        data: {
          clerkId: data.id,
          email,
          name,
          imageUrl: data.image_url,
          plan,
          generationsLimit,
          subscriptionStatus: isOwner ? 'active' : 'free',
          referralCode,
        },
      })

      // Send welcome email to every new signup (non-blocking)
      if (email && !isOwner) {
        sendEmail({
          to: email,
          subject: 'Welcome to KDP Cover AI 🎉 — Your first cover is waiting',
          html: welcomeEmail(name?.split(' ')[0] ?? 'there'),
        }).catch(() => {}) // fire-and-forget
      }
    }
  }

  if (type === 'user.updated') {
    const email = data.email_addresses?.[0]?.email_address ?? ''
    const name = [data.first_name, data.last_name].filter(Boolean).join(' ') || undefined

    await prisma.user.updateMany({
      where: { clerkId: data.id },
      data: { email, name, imageUrl: data.image_url },
    })
  }

  if (type === 'user.deleted') {
    await prisma.user.deleteMany({ where: { clerkId: data.id } })
  }

  return NextResponse.json({ received: true })
}
