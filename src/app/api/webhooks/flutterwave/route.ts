import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { verifyFlutterwaveWebhook } from '@/lib/flutterwave/client'

const PLAN_LIMITS: Record<string, number> = {
  STARTER: 10,
  PRO:     999999,
  AGENCY:  999999,
}

function planFromId(planId: string): 'STARTER' | 'PRO' | 'AGENCY' | null {
  if (planId === process.env.FLW_PLAN_STARTER) return 'STARTER'
  if (planId === process.env.FLW_PLAN_PRO)     return 'PRO'
  if (planId === process.env.FLW_PLAN_AGENCY)  return 'AGENCY'
  return null
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get('verif-hash') ?? ''

  if (!verifyFlutterwaveWebhook(signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let event: any
  try {
    event = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const eventType = event.event

  try {
    switch (eventType) {

      // ── Successful charge (covers first payment + renewals) ───
      case 'charge.completed': {
        if (event.data?.status !== 'successful') break

        const email      = event.data?.customer?.email
        const planId     = String(event.data?.payment_plan ?? '')
        const subId      = String(event.data?.id ?? '')
        const customerId = String(event.data?.customer?.id ?? '')

        if (!email || !planId) break

        const plan = planFromId(planId)
        if (!plan) break

        await prisma.user.updateMany({
          where: { email },
          data: {
            plan,
            subscriptionStatus:   'active',
            generationsLimit:     PLAN_LIMITS[plan],
            flwCustomerId:        customerId,
            flwSubscriptionId:    subId,
            flwPlanId:            planId,
          },
        })
        break
      }

      // ── Subscription created ──────────────────────────────────
      case 'subscription.activated': {
        const email  = event.data?.customer?.email
        const planId = String(event.data?.plan?.id ?? '')
        const subId  = String(event.data?.id ?? '')

        if (!email || !planId) break

        const plan = planFromId(planId)
        if (!plan) break

        await prisma.user.updateMany({
          where: { email },
          data: {
            plan,
            subscriptionStatus: 'active',
            generationsLimit:   PLAN_LIMITS[plan],
            flwSubscriptionId:  subId,
            flwPlanId:          planId,
          },
        })
        break
      }

      // ── Subscription cancelled ────────────────────────────────
      case 'subscription.cancelled': {
        const email = event.data?.customer?.email
        if (!email) break

        await prisma.user.updateMany({
          where: { email },
          data: {
            plan:               'FREE',
            subscriptionStatus: 'cancelled',
            generationsLimit:   3,
            flwSubscriptionId:  null,
            flwPlanId:          null,
          },
        })
        break
      }

      default:
        break
    }
  } catch (err) {
    console.error('Flutterwave webhook error:', err)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
