import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { PLANS, verifyLSWebhook } from '@/lib/lemonsqueezy/client'
import type { PlanKey } from '@/lib/lemonsqueezy/client'

// Lemon Squeezy sends these event types
// https://docs.lemonsqueezy.com/help/webhooks#webhook-event-types

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('x-signature') ?? ''

  // Verify signature
  let valid = false
  try {
    valid = await verifyLSWebhook(rawBody, signature)
  } catch (err) {
    console.error('Webhook verify error:', err)
  }

  if (!valid) {
    console.warn('LS webhook: invalid signature')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  let event: LSEvent
  try {
    event = JSON.parse(rawBody) as LSEvent
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const eventName = event.meta?.event_name
  console.log(`LS Webhook: ${eventName}`)

  try {
    switch (eventName) {
      case 'order_created':
        await handleOrderCreated(event)
        break
      case 'subscription_created':
      case 'subscription_updated':
      case 'subscription_resumed':
        await handleSubscriptionActive(event)
        break
      case 'subscription_cancelled':
      case 'subscription_expired':
        await handleSubscriptionCancelled(event)
        break
      case 'subscription_payment_failed':
        await handlePaymentFailed(event)
        break
    }
  } catch (err) {
    console.error(`LS webhook handler error for ${eventName}:`, err)
    // Return 200 so LS doesn't keep retrying (log the error separately)
  }

  return NextResponse.json({ received: true })
}

// ---- Handlers ----

async function handleOrderCreated(event: LSEvent) {
  const attrs = event.data?.attributes
  if (!attrs) return

  const userId = event.meta?.custom_data?.userId as string | undefined
  const plan = event.meta?.custom_data?.plan as PlanKey | undefined

  if (!userId || !plan || !PLANS[plan]) return

  // Update user with order info — subscription_created fires next and sets full details
  const customerId = String(attrs.customer_id ?? '')
  if (customerId) {
    await prisma.user.update({
      where: { clerkId: userId },
      data: { lsCustomerId: customerId },
    })
  }
}

async function handleSubscriptionActive(event: LSEvent) {
  const attrs = event.data?.attributes
  if (!attrs) return

  const userId = event.meta?.custom_data?.userId as string | undefined
  const plan = (event.meta?.custom_data?.plan as PlanKey | undefined) ?? inferPlan(attrs.variant_id)

  if (!userId) {
    console.warn('LS subscription event: no userId in custom_data')
    return
  }

  const planConfig = plan ? PLANS[plan] : null
  const status = attrs.status as string   // 'active' | 'paused' | 'past_due' | etc.

  await prisma.user.update({
    where: { clerkId: userId },
    data: {
      plan: (plan ?? 'FREE') as any,
      lsCustomerId: String(attrs.customer_id ?? ''),
      lsSubscriptionId: String(event.data?.id ?? ''),
      lsVariantId: String(attrs.variant_id ?? ''),
      subscriptionStatus: status === 'active' ? 'active' : status,
      generationsLimit: planConfig?.generationsLimit ?? 5,
      generationsUsed: 0,
    },
  })
}

async function handleSubscriptionCancelled(event: LSEvent) {
  const attrs = event.data?.attributes
  if (!attrs) return

  const userId = event.meta?.custom_data?.userId as string | undefined
  if (!userId) return

  await prisma.user.update({
    where: { clerkId: userId },
    data: {
      plan: 'FREE',
      subscriptionStatus: 'canceled',
      lsSubscriptionId: null,
      lsVariantId: null,
      generationsLimit:   5,
    },
  })
}

async function handlePaymentFailed(event: LSEvent) {
  const attrs = event.data?.attributes
  if (!attrs) return

  const userId = event.meta?.custom_data?.userId as string | undefined
  if (userId) {
    await prisma.user.update({
      where: { clerkId: userId },
      data: { subscriptionStatus: 'past_due' },
    })
  }
}

/** Infer plan from variant ID as a fallback */
function inferPlan(variantId: number | string | undefined): PlanKey | undefined {
  if (!variantId) return undefined
  const id = String(variantId)
  if (id === process.env.LS_VARIANT_STARTER) return 'STARTER'
  if (id === process.env.LS_VARIANT_PRO) return 'PRO'
  if (id === process.env.LS_VARIANT_AGENCY) return 'AGENCY'
  return undefined
}

// ---- Types (minimal) ----
interface LSEvent {
  meta?: {
    event_name?: string
    custom_data?: Record<string, unknown>
  }
  data?: {
    id?: string | number
    attributes?: {
      status?: string
      customer_id?: number | string
      variant_id?: number | string
      [key: string]: unknown
    }
  }
}
