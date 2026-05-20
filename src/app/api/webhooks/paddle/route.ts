import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { verifyPaddleWebhook } from '@/lib/paddle/client'

const PLAN_LIMITS: Record<string, number> = {
  STARTER: 10,
  PRO:     999999,
  AGENCY:  999999,
}

function planFromPriceId(priceId: string): 'STARTER' | 'PRO' | 'AGENCY' | null {
  if (priceId === process.env.PADDLE_PRICE_STARTER) return 'STARTER'
  if (priceId === process.env.PADDLE_PRICE_PRO)     return 'PRO'
  if (priceId === process.env.PADDLE_PRICE_AGENCY)  return 'AGENCY'
  return null
}

export async function POST(req: NextRequest) {
  const rawBody  = await req.text()
  const signature = req.headers.get('paddle-signature') ?? ''

  const valid = await verifyPaddleWebhook(rawBody, signature)
  if (!valid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let event: any
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const eventType = event.event_type
  const data      = event.data

  try {
    switch (eventType) {

      // ── Subscription activated / first payment ────────────────
      case 'subscription.activated':
      case 'subscription.updated': {
        const email      = data?.customer?.email ?? data?.items?.[0]?.price?.custom_data?.email
        const customerId = data?.customer_id
        const subId      = data?.id
        const priceId    = data?.items?.[0]?.price?.id

        if (!customerId) break

        const plan = priceId ? planFromPriceId(priceId) : null

        // Look up user by email or customerId
        const updateData: any = {
          subscriptionStatus: 'active',
          paddleCustomerId:   customerId,
          paddleSubId:        subId,
          paddlePriceId:      priceId,
        }
        if (plan) {
          updateData.plan             = plan
          updateData.generationsLimit = PLAN_LIMITS[plan]
        }

        if (email) {
          await prisma.user.updateMany({ where: { email }, data: updateData })
        } else {
          await prisma.user.updateMany({ where: { paddleCustomerId: customerId }, data: updateData })
        }
        break
      }

      // ── Payment succeeded (renewal) ───────────────────────────
      case 'transaction.completed': {
        const customerId = data?.customer_id
        const priceId    = data?.items?.[0]?.price?.id
        if (!customerId || !priceId) break

        const plan = planFromPriceId(priceId)
        if (!plan) break

        await prisma.user.updateMany({
          where: { paddleCustomerId: customerId },
          data: {
            plan,
            subscriptionStatus: 'active',
            generationsLimit:   PLAN_LIMITS[plan],
          },
        })
        break
      }

      // ── Subscription cancelled ────────────────────────────────
      case 'subscription.cancelled': {
        const customerId = data?.customer_id
        if (!customerId) break

        await prisma.user.updateMany({
          where: { paddleCustomerId: customerId },
          data: {
            plan:               'FREE',
            subscriptionStatus: 'cancelled',
            generationsLimit:   3,
            paddleSubId:        null,
            paddlePriceId:      null,
          },
        })
        break
      }

      // ── Payment failed ────────────────────────────────────────
      case 'subscription.payment_failed': {
        const customerId = data?.customer_id
        if (!customerId) break

        await prisma.user.updateMany({
          where: { paddleCustomerId: customerId },
          data: { subscriptionStatus: 'past_due' },
        })
        break
      }

      default:
        break
    }
  } catch (err) {
    console.error('Paddle webhook error:', err)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
