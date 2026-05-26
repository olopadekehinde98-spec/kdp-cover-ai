import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'
import { getPortalUrl } from '@/lib/paddle/client'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // If user has a Flutterwave subscription, cancel it directly
  if (user.flwSubscriptionId) {
    try {
      const { cancelSubscription } = await import('@/lib/flutterwave/client')
      await cancelSubscription(user.flwSubscriptionId)

      await prisma.user.update({
        where: { id: user.id },
        data: {
          flwSubscriptionId: null,
          subscriptionStatus: 'canceled',
        },
      })

      return NextResponse.json({ cancelled: true, message: 'Flutterwave subscription cancelled successfully.' })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error('Flutterwave cancel error:', msg)
      return NextResponse.json({ error: msg }, { status: 500 })
    }
  }

  // Otherwise use Paddle portal
  if (!user.paddleCustomerId) {
    // Manually-granted plans (owner/admin) have no billing portal
    if (user.plan !== 'FREE') {
      return NextResponse.json({
        error: 'Your plan is managed directly. No billing portal is available. Contact support@kdpcoverai.com if you need help.',
      }, { status: 200 })
    }
    return NextResponse.json({ error: 'No billing account found. Please subscribe via the Pricing page.' }, { status: 404 })
  }

  try {
    const url = await getPortalUrl(user.paddleCustomerId)
    return NextResponse.json({ url })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('Portal error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
