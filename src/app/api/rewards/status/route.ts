import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'

const REFERRALS_FOR_PRO = 3

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: {
      id: true,
      plan: true,
      referralCode: true,
      earnedPlan: true,
      earnedPlanExpiresAt: true,
      socialFollowClaims: { select: { platform: true } },
    },
  })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Count referrals
  const referralCount = user.referralCode
    ? await prisma.user.count({ where: { referredByCode: user.referralCode } })
    : 0

  const followedPlatforms = user.socialFollowClaims.map(c => c.platform)
  const followCount = followedPlatforms.length
  const allFollowed = followCount >= 3

  // Check if earned plan is still active
  const earnedActive =
    !!user.earnedPlan &&
    !!user.earnedPlanExpiresAt &&
    user.earnedPlanExpiresAt > new Date()

  const proUnlocked = referralCount >= REFERRALS_FOR_PRO
  const starterUnlocked = allFollowed

  return NextResponse.json({
    followedPlatforms,
    followCount,
    allFollowed,
    referralCount,
    referralsNeeded: Math.max(0, REFERRALS_FOR_PRO - referralCount),
    starterUnlocked,
    proUnlocked,
    earnedPlan: earnedActive ? user.earnedPlan : null,
    earnedPlanExpiresAt: earnedActive ? user.earnedPlanExpiresAt : null,
    referralCode: user.referralCode,
    currentPlan: user.plan,
  })
}
