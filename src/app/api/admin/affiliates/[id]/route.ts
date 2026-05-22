import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'

async function requireAdmin(clerkId: string) {
  const user = await prisma.user.findUnique({ where: { clerkId } })
  if (!user?.isAdmin) return null
  return user
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const admin = await requireAdmin(userId)
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const body = await req.json()
  const { action, payoutId, adminNote } = body

  if (action === 'approve-payout') {
    if (!payoutId) return NextResponse.json({ error: 'payoutId required' }, { status: 400 })

    const payout = await prisma.affiliatePayout.findUnique({ where: { id: payoutId } })
    if (!payout) return NextResponse.json({ error: 'Payout not found' }, { status: 404 })

    await prisma.$transaction([
      prisma.affiliatePayout.update({
        where: { id: payoutId },
        data: { status: 'PAID', paidAt: new Date(), adminNote: adminNote || null },
      }),
      prisma.affiliateProfile.update({
        where: { id },
        data: { totalPaidUsd: { increment: payout.amountUsd } },
      }),
      // Mark commissions as paid
      prisma.affiliateCommission.updateMany({
        where: { affiliateId: id, isPaid: false },
        data: { isPaid: true },
      }),
    ])

    return NextResponse.json({ success: true })
  }

  if (action === 'reject-payout') {
    if (!payoutId) return NextResponse.json({ error: 'payoutId required' }, { status: 400 })

    await prisma.affiliatePayout.update({
      where: { id: payoutId },
      data: { status: 'REJECTED', adminNote: adminNote || null },
    })

    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
