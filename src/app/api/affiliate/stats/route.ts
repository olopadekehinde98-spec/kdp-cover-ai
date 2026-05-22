import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const profile = await prisma.affiliateProfile.findUnique({
    where: { userId: user.id },
    include: {
      commissions: { orderBy: { createdAt: 'desc' }, take: 50 },
      payouts: { orderBy: { requestedAt: 'desc' }, take: 20 },
    },
  })

  if (!profile) return NextResponse.json({ profile: null })

  const unpaidBalance = profile.commissions
    .filter(c => !c.isPaid)
    .reduce((sum, c) => sum + c.amountUsd, 0)

  const pendingPayout = profile.payouts
    .filter(p => p.status === 'PENDING')
    .reduce((sum, p) => sum + p.amountUsd, 0)

  return NextResponse.json({
    profile,
    unpaidBalance,
    pendingPayout,
    isPaidUser: user.plan !== 'FREE',
  })
}
