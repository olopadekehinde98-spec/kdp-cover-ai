import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { verifyFlutterwaveWebhook } from '@/lib/flutterwave/client'
import { getCommissionAmount } from '@/lib/affiliate'

const PLAN_LIMITS: Record<string, number> = {
  STARTER: 15,
  PRO:     999999,
  AGENCY:  999999,
}

const PLAN_PRICES: Record<string, number> = {
  STARTER: 9,
  PRO: 29,
  AGENCY: 79,
}

/** Credit affiliate commission when a referred user pays */
async function creditAffiliateCommission(userId: string, plan: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { referredByCode: true },
    })
    if (!user?.referredByCode) return

    const affiliate = await prisma.affiliateProfile.findUnique({
      where: { referralCode: user.referredByCode },
      include: { user: { select: { plan: true } } },
    })
    if (!affiliate || !affiliate.isActive) return

    const isPaidUser = affiliate.user.plan !== 'FREE'
    const commissionUsd = getCommissionAmount(affiliate.activeReferrals, isPaidUser)
    const rate = commissionUsd / Math.max(PLAN_PRICES[plan] ?? 9, 1) // stored for reference

    await prisma.$transaction([
      prisma.affiliateCommission.create({
        data: {
          affiliateId: affiliate.id,
          referredUserId: userId,
          plan,
          amountUsd: commissionUsd,
          percentage: rate,
        },
      }),
      prisma.affiliateProfile.update({
        where: { id: affiliate.id },
        data: {
          totalReferrals: { increment: 1 },
          activeReferrals: { increment: 1 },
          totalEarnedUsd: { increment: commissionUsd },
        },
      }),
    ])
  } catch (err) {
    console.error('Affiliate commission error:', err)
  }
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

        const updatedUsers = await prisma.user.findMany({ where: { email }, select: { id: true } })
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
        // Credit affiliate commission for the referred user
        for (const u of updatedUsers) await creditAffiliateCommission(u.id, plan)
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

        const activatedUsers = await prisma.user.findMany({ where: { email }, select: { id: true } })
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
        for (const u of activatedUsers) await creditAffiliateCommission(u.id, plan)
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
