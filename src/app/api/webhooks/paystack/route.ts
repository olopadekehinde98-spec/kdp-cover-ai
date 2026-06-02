import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { verifyPaystackWebhook } from '@/lib/paystack/client'

// Generation limits per plan
const PLAN_LIMITS: Record<string, number> = {
  STARTER: 15,
  PRO:     999999,
  AGENCY:  999999,
}

function planFromCode(planCode: string): 'STARTER' | 'PRO' | 'AGENCY' | null {
  const starterCode = process.env.PAYSTACK_PLAN_STARTER
  const proCode     = process.env.PAYSTACK_PLAN_PRO
  const agencyCode  = process.env.PAYSTACK_PLAN_AGENCY

  if (planCode === starterCode) return 'STARTER'
  if (planCode === proCode)     return 'PRO'
  if (planCode === agencyCode)  return 'AGENCY'
  return null
}

export async function POST(req: NextRequest) {
  const rawBody  = await req.text()
  const signature = req.headers.get('x-paystack-signature') ?? ''

  const valid = await verifyPaystackWebhook(rawBody, signature)
  if (!valid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let event: any
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { event: eventType, data } = event

  try {
    switch (eventType) {

      // ── New subscription created ──────────────────────────────
      case 'subscription.create': {
        const email        = data.customer?.email
        const planCode     = data.plan?.plan_code
        const subCode      = data.subscription_code
        const emailToken   = data.email_token
        const customerId   = String(data.customer?.id ?? '')

        if (!email) break

        const plan = planFromCode(planCode)
        if (!plan) break

        await prisma.user.updateMany({
          where: { email },
          data: {
            plan,
            subscriptionStatus:   'active',
            generationsLimit:     PLAN_LIMITS[plan],
            paystackCustomerId:   customerId,
            paystackSubCode:      subCode,
            paystackEmailToken:   emailToken,
            paystackPlanCode:     planCode,
          },
        })
        break
      }

      // ── Successful recurring charge ───────────────────────────
      case 'charge.success': {
        // Only handle subscription charges (have a plan)
        if (!data.plan?.plan_code) break

        const email    = data.customer?.email
        const planCode = data.plan.plan_code
        const plan     = planFromCode(planCode)
        if (!email || !plan) break

        await prisma.user.updateMany({
          where: { email },
          data: {
            plan,
            subscriptionStatus: 'active',
            generationsLimit:   PLAN_LIMITS[plan],
          },
        })
        break
      }

      // ── Subscription cancelled / disabled ────────────────────
      case 'subscription.disable':
      case 'subscription.not_renew': {
        const email = data.customer?.email
        if (!email) break

        await prisma.user.updateMany({
          where: { email },
          data: {
            plan:               'FREE',
            subscriptionStatus: 'cancelled',
            generationsLimit:   5,
            paystackSubCode:    null,
            paystackEmailToken: null,
            paystackPlanCode:   null,
          },
        })
        break
      }

      // ── Invoice / payment failed ──────────────────────────────
      case 'invoice.payment_failed': {
        const email = data.customer?.email
        if (!email) break

        await prisma.user.updateMany({
          where: { email },
          data: { subscriptionStatus: 'past_due' },
        })
        break
      }

      default:
        // Unhandled event — return 200 so Paystack doesn't retry
        break
    }
  } catch (err) {
    console.error('Paystack webhook error:', err)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
