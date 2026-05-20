/**
 * GET  /api/referral  — get current user's referral code + stats
 * POST /api/referral  — apply a referral code (before subscribing)
 */
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: {
      referralCode: true,
      referredByCode: true,
      referralDiscountPct: true,
    },
  })

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // Count how many users have been referred by this user's code
  const referralCount = user.referralCode
    ? await prisma.user.count({ where: { referredByCode: user.referralCode } })
    : 0

  // Count how many of those referred users are paying subscribers
  const activeReferrals = user.referralCode
    ? await prisma.user.count({
        where: {
          referredByCode: user.referralCode,
          subscriptionStatus: 'active',
        },
      })
    : 0

  return NextResponse.json({
    referralCode: user.referralCode,
    referralLink: user.referralCode
      ? `${process.env.NEXT_PUBLIC_APP_URL}/sign-up?ref=${user.referralCode}`
      : null,
    referredByCode: user.referredByCode,
    discountApplied: user.referralDiscountPct,
    stats: { referralCount, activeReferrals },
  })
}

const applySchema = z.object({
  code: z.string().min(3).max(20).toUpperCase(),
})

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = applySchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid code' }, { status: 400 })

  const code = parsed.data.code

  const currentUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true, referralCode: true, referredByCode: true, plan: true },
  })

  if (!currentUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // Can't apply your own code
  if (currentUser.referralCode === code) {
    return NextResponse.json({ error: 'You cannot use your own referral code.' }, { status: 400 })
  }

  // Already applied a code
  if (currentUser.referredByCode) {
    return NextResponse.json({ error: 'You have already applied a referral code.' }, { status: 400 })
  }

  // Paid users can't use referral codes (only for free users about to subscribe)
  if (currentUser.plan !== 'FREE') {
    return NextResponse.json({ error: 'Referral codes can only be applied before subscribing.' }, { status: 400 })
  }

  // Verify the code exists
  const referrer = await prisma.user.findFirst({
    where: { referralCode: code },
    select: { id: true, email: true },
  })

  if (!referrer) {
    return NextResponse.json({ error: 'Referral code not found.' }, { status: 404 })
  }

  // Apply the code — user gets 10% discount on next subscription
  await prisma.user.update({
    where: { clerkId: userId },
    data: {
      referredByCode: code,
      referralDiscountPct: 10,
    },
  })

  return NextResponse.json({
    success: true,
    message: 'Referral code applied! You will receive 10% off your first month when you subscribe.',
    discountPct: 10,
  })
}
