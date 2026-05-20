import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'
import { cancelSubscription } from '@/lib/flutterwave/client'

/**
 * POST — cancel Flutterwave subscription.
 * Flutterwave doesn't have a hosted billing portal.
 * We cancel via API and update the DB immediately.
 */
export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  if (!user.flwSubscriptionId) {
    return NextResponse.json({ error: 'No active subscription found' }, { status: 404 })
  }

  try {
    await cancelSubscription(user.flwSubscriptionId)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        plan:               'FREE',
        subscriptionStatus: 'cancelled',
        generationsLimit:   3,
        flwSubscriptionId:  null,
        flwPlanId:          null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('Cancel error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
