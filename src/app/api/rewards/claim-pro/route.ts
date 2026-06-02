import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'

const REFERRALS_FOR_PRO = 3
const PRO_REWARD_DAYS = 30

export async function POST() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Sign in first' }, { status: 401 })

  // Email must be verified
  const clerkUser = await currentUser()
  const emailVerified = clerkUser?.emailAddresses?.some(e => e.verification?.status === 'verified')
  if (!emailVerified) {
    return NextResponse.json({
      error: 'Verify your email address first before claiming rewards.',
      code: 'EMAIL_NOT_VERIFIED',
    }, { status: 403 })
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true, referralCode: true, earnedPlan: true, earnedPlanExpiresAt: true },
  })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  if (!user.referralCode) return NextResponse.json({ error: 'No referral code' }, { status: 400 })

  const referralCount = await prisma.user.count({ where: { referredByCode: user.referralCode } })
  if (referralCount < REFERRALS_FOR_PRO) {
    return NextResponse.json({
      error: `You need ${REFERRALS_FOR_PRO - referralCount} more referral(s) to unlock Pro`,
    }, { status: 400 })
  }

  const alreadyProActive =
    user.earnedPlan === 'PRO' &&
    user.earnedPlanExpiresAt &&
    user.earnedPlanExpiresAt > new Date()
  if (alreadyProActive) {
    return NextResponse.json({ ok: true, alreadyActive: true, expiresAt: user.earnedPlanExpiresAt })
  }

  const expiresAt = new Date(Date.now() + PRO_REWARD_DAYS * 24 * 60 * 60 * 1000)
  await prisma.user.update({
    where: { id: user.id },
    data: {
      plan: 'PRO' as any,
      generationsLimit: 999999,
      earnedPlan: 'PRO',
      earnedPlanExpiresAt: expiresAt,
    },
  })

  return NextResponse.json({ ok: true, reward: 'pro_unlocked', expiresAt })
}
