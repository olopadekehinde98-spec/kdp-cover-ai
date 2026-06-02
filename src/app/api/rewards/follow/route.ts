import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'

const PLATFORMS = ['instagram', 'youtube', 'tiktok'] as const
const ALL_PLATFORMS = PLATFORMS.length // 3

// When all 4 are followed → Starter plan for 30 days
const FOLLOW_REWARD_PLAN = 'STARTER'
const FOLLOW_REWARD_LIMIT = 20
const FOLLOW_REWARD_DAYS = 30

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Sign in first' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const parsed = z.object({ platform: z.enum(PLATFORMS) }).safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid platform' }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // Record the follow claim (upsert so double-clicking is safe)
  await prisma.socialFollowClaim.upsert({
    where: { userId_platform: { userId: user.id, platform: parsed.data.platform } },
    create: { userId: user.id, platform: parsed.data.platform },
    update: {},
  })

  // Count total platforms followed
  const followCount = await prisma.socialFollowClaim.count({ where: { userId: user.id } })

  // If all 4 followed and they haven't already earned the reward (or it expired)
  const alreadyActive =
    user.earnedPlan === FOLLOW_REWARD_PLAN &&
    user.earnedPlanExpiresAt &&
    user.earnedPlanExpiresAt > new Date()

  if (followCount >= ALL_PLATFORMS && !alreadyActive) {
    const expiresAt = new Date(Date.now() + FOLLOW_REWARD_DAYS * 24 * 60 * 60 * 1000)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        plan: FOLLOW_REWARD_PLAN as any,
        generationsLimit: FOLLOW_REWARD_LIMIT,
        earnedPlan: FOLLOW_REWARD_PLAN,
        earnedPlanExpiresAt: expiresAt,
      },
    })
    return NextResponse.json({ ok: true, followCount, reward: 'starter_unlocked', expiresAt })
  }

  return NextResponse.json({ ok: true, followCount })
}
