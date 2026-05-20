import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'
import { cancelSubscription } from '@/lib/paystack/client'

/**
 * POST — cancel subscription
 * Paystack doesn't have a hosted portal like Stripe.
 * Instead we cancel directly via API when user requests it.
 */
export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  if (!user.paystackSubCode || !user.paystackEmailToken) {
    return NextResponse.json({ error: 'No active subscription found' }, { status: 404 })
  }

  try {
    await cancelSubscription(user.paystackSubCode, user.paystackEmailToken)

    // Update DB immediately (webhook will also fire)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        plan:               'FREE',
        subscriptionStatus: 'cancelled',
        generationsLimit:   3,
        paystackSubCode:    null,
        paystackEmailToken: null,
        paystackPlanCode:   null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('Portal/cancel error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
