import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'
import { usdToNgn } from '@/lib/affiliate'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const body = await req.json()
  const { bankName, accountNumber, accountName } = body

  if (!bankName || !accountNumber || !accountName) {
    return NextResponse.json({ error: 'bankName, accountNumber, and accountName are required' }, { status: 400 })
  }

  const profile = await prisma.affiliateProfile.findUnique({
    where: { userId: user.id },
    include: {
      commissions: { where: { isPaid: false } },
      payouts: { where: { status: 'PENDING' } },
    },
  })

  if (!profile) return NextResponse.json({ error: 'No affiliate profile found' }, { status: 404 })

  const unpaidBalance = profile.commissions.reduce((sum, c) => sum + c.amountUsd, 0)
  const pendingPayout = profile.payouts.reduce((sum, p) => sum + p.amountUsd, 0)
  const availableBalance = unpaidBalance - pendingPayout

  if (availableBalance < 10) {
    return NextResponse.json({ error: 'Minimum payout is $10. Your available balance is insufficient.' }, { status: 400 })
  }

  const amountNgn = usdToNgn(availableBalance)

  // Update bank details and create payout
  await prisma.affiliateProfile.update({
    where: { id: profile.id },
    data: { bankName, accountNumber, accountName },
  })

  const payout = await prisma.affiliatePayout.create({
    data: {
      affiliateId: profile.id,
      amountUsd: availableBalance,
      amountNgn,
      status: 'PENDING',
    },
  })

  return NextResponse.json({ success: true, payout })
}
