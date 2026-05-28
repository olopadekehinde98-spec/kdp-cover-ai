import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'
import { sendEmail, confirmSubscriberEmail } from '@/lib/email/resend'
import { randomBytes } from 'crypto'

const schema = z.object({
  email: z.string().email().max(200),
  source: z.string().max(50).optional().default('homepage-popup'),
})

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
  }

  const { email, source } = parsed.data

  try {
    // Check if already subscribed
    const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } })
    if (existing) {
      if (existing.confirmed) {
        return NextResponse.json({ ok: true, alreadySubscribed: true })
      }
      // Resend confirmation if not yet confirmed
      await sendEmail({
        to: email,
        subject: 'Confirm your KDP Cover AI subscription',
        html: confirmSubscriberEmail(existing.token),
      })
      return NextResponse.json({ ok: true, message: 'Confirmation email resent' })
    }

    const token = randomBytes(32).toString('hex')
    await prisma.newsletterSubscriber.create({
      data: { email, source, token },
    })

    await sendEmail({
      to: email,
      subject: 'Confirm your KDP Cover AI subscription 📚',
      html: confirmSubscriberEmail(token),
    })

    return NextResponse.json({ ok: true, message: 'Check your email to confirm' })
  } catch (err) {
    console.error('[Newsletter subscribe]', err)
    return NextResponse.json({ error: 'Something went wrong, please try again' }, { status: 500 })
  }
}
