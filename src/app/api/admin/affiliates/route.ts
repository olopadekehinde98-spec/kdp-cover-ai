import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'

async function requireAdmin(clerkId: string) {
  const user = await prisma.user.findUnique({ where: { clerkId } })
  if (!user?.isAdmin) return null
  return user
}

export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const admin = await requireAdmin(userId)
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const profiles = await prisma.affiliateProfile.findMany({
    include: {
      user: { select: { email: true, name: true, plan: true } },
      commissions: { select: { amountUsd: true, isPaid: true } },
      payouts: { orderBy: { requestedAt: 'desc' } },
    },
    orderBy: { joinedAt: 'desc' },
  })

  const totalOwed = profiles.reduce((sum, p) => {
    const unpaid = p.commissions.filter(c => !c.isPaid).reduce((s, c) => s + c.amountUsd, 0)
    const pending = p.payouts.filter(po => po.status === 'PENDING').reduce((s, po) => s + po.amountUsd, 0)
    return sum + Math.max(0, unpaid - pending)
  }, 0)

  const totalPaid = profiles.reduce((sum, p) => sum + p.totalPaidUsd, 0)

  return NextResponse.json({ profiles, totalOwed, totalPaid })
}
