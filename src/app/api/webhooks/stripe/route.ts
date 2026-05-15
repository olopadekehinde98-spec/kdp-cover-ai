import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/client'
import { PLANS } from '@/lib/stripe/client'
import { prisma } from '@/lib/db/prisma'
import type Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) return NextResponse.json({ error: 'No signature' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature error:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
        break
      }
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(sub)
        break
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(sub)
        break
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentFailed(invoice)
        break
      }
    }
  } catch (err) {
    console.error(`Webhook handler error for ${event.type}:`, err)
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId
  const plan = session.metadata?.plan as keyof typeof PLANS | undefined

  if (!userId || !plan) return

  const planConfig = PLANS[plan]
  const sub = await stripe.subscriptions.retrieve(session.subscription as string)

  await prisma.user.update({
    where: { clerkId: userId },
    data: {
      plan: plan as any,
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: sub.id,
      stripePriceId: planConfig.priceId,
      subscriptionStatus: sub.status,
      generationsLimit: planConfig.generationsLimit,
      generationsUsed: 0,
    },
  })
}

async function handleSubscriptionUpdated(sub: Stripe.Subscription) {
  const userId = sub.metadata?.userId
  if (!userId) return

  const plan = sub.metadata?.plan as keyof typeof PLANS | undefined
  const planConfig = plan ? PLANS[plan] : null

  await prisma.user.update({
    where: { clerkId: userId },
    data: {
      subscriptionStatus: sub.status,
      generationsLimit: planConfig?.generationsLimit ?? 3,
      ...(plan && { plan: plan as any }),
    },
  })
}

async function handleSubscriptionDeleted(sub: Stripe.Subscription) {
  const userId = sub.metadata?.userId
  if (!userId) return

  await prisma.user.update({
    where: { clerkId: userId },
    data: {
      plan: 'FREE',
      subscriptionStatus: 'canceled',
      stripeSubscriptionId: null,
      stripePriceId: null,
      generationsLimit: 3,
    },
  })
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string
  if (!customerId) return

  await prisma.user.updateMany({
    where: { stripeCustomerId: customerId },
    data: { subscriptionStatus: 'past_due' },
  })
}
