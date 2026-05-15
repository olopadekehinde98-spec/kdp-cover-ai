import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
  typescript: true,
})

export const PLANS = {
  STARTER: {
    name: 'Starter',
    price: 1900,  // cents
    priceId: process.env.STRIPE_STARTER_PRICE_ID!,
    generationsLimit: 15,
    features: [
      '15 covers per month',
      'All trim sizes',
      'PDF export',
      'Watermark preview',
      'Email support',
    ],
  },
  PRO: {
    name: 'Pro',
    price: 4900,
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    generationsLimit: 999999,
    features: [
      'Unlimited covers',
      'All trim sizes',
      'KDP-ready PDF export',
      'Commercial rights',
      'Series branding',
      'AI description generator',
      'Priority support',
    ],
  },
  AGENCY: {
    name: 'Agency',
    price: 9900,
    priceId: process.env.STRIPE_AGENCY_PRICE_ID!,
    generationsLimit: 999999,
    features: [
      'Everything in Pro',
      'Team accounts (up to 5)',
      'Bulk generation',
      'Priority rendering',
      'White-label support',
      'Dedicated support',
    ],
  },
} as const

export async function createCheckoutSession(
  userId: string,
  email: string,
  plan: keyof typeof PLANS,
  stripeCustomerId?: string
) {
  const planConfig = PLANS[plan]

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer: stripeCustomerId ?? undefined,
    customer_email: stripeCustomerId ? undefined : email,
    line_items: [{ price: planConfig.priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    metadata: { userId, plan },
    subscription_data: { metadata: { userId, plan } },
    allow_promotion_codes: true,
  })

  return session
}

export async function createBillingPortalSession(stripeCustomerId: string) {
  return stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
  })
}
