import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'

const NGN_PRICES: Record<string, number> = { STARTER: 13700, PRO: 41100, AGENCY: 109600 }
const USD_PRICES: Record<string, number> = { STARTER: 10, PRO: 30, AGENCY: 80 }

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { code, plan } = await req.json()
  if (!code || !plan) return NextResponse.json({ error: 'code and plan required' }, { status: 400 })

  const dc = await prisma.discountCode.findUnique({
    where: { code: String(code).toUpperCase().trim() },
    include: { _count: { select: { redemptions: true } } },
  })

  if (!dc || !dc.isActive) return NextResponse.json({ error: 'Invalid or expired code' }, { status: 404 })
  if (dc.expiresAt && dc.expiresAt < new Date()) return NextResponse.json({ error: 'This code has expired' }, { status: 410 })
  if (dc.maxUses && dc.usedCount >= dc.maxUses) return NextResponse.json({ error: 'This code has reached its usage limit' }, { status: 410 })
  if (dc.planRestriction && dc.planRestriction !== plan) {
    return NextResponse.json({ error: `This code is only valid for the ${dc.planRestriction} plan` }, { status: 400 })
  }

  // Check if user already used this code
  const user = await prisma.user.findUnique({ where: { clerkId: userId }, select: { id: true } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const alreadyUsed = await prisma.discountRedemption.findUnique({
    where: { codeId_userId: { codeId: dc.id, userId: user.id } },
  })
  if (alreadyUsed) return NextResponse.json({ error: 'You have already used this code' }, { status: 409 })

  const ngnOriginal = NGN_PRICES[plan] ?? 0
  const usdOriginal = USD_PRICES[plan] ?? 0
  const ngnDiscounted = Math.round(ngnOriginal * (1 - dc.discountPct / 100))
  const usdDiscounted = Math.round(usdOriginal * (1 - dc.discountPct / 100) * 100) / 100

  return NextResponse.json({
    valid: true,
    discountPct: dc.discountPct,
    description: dc.description,
    ngnOriginal,
    ngnDiscounted,
    usdOriginal,
    usdDiscounted,
    savings: ngnOriginal - ngnDiscounted,
  })
}
