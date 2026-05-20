/**
 * Flutterwave billing client — direct REST API, no SDK needed.
 *
 * Required env vars:
 *   FLW_SECRET_KEY           FLWSECK_xxxx
 *   FLW_PUBLIC_KEY           FLWPUBK_xxxx
 *   FLW_ENCRYPTION_KEY       xxxx  (from Flutterwave dashboard)
 *   NEXT_PUBLIC_APP_URL      https://your-domain.vercel.app
 *
 * Plan IDs are created in your Flutterwave dashboard:
 *   FLW_PLAN_STARTER         plan id number e.g. 12345
 *   FLW_PLAN_PRO             plan id number
 *   FLW_PLAN_AGENCY          plan id number
 */

const BASE = 'https://api.flutterwave.com/v3'

function headers() {
  const key = process.env.FLW_SECRET_KEY
  if (!key) throw new Error('FLW_SECRET_KEY is not set')
  return {
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
  }
}

export const PLANS = {
  STARTER: {
    id: () => {
      const id = process.env.FLW_PLAN_STARTER
      if (!id) throw new Error('FLW_PLAN_STARTER env var is not set')
      return id
    },
    amount: 9,
    name: 'Starter',
  },
  PRO: {
    id: () => {
      const id = process.env.FLW_PLAN_PRO
      if (!id) throw new Error('FLW_PLAN_PRO env var is not set')
      return id
    },
    amount: 29,
    name: 'Pro',
  },
  AGENCY: {
    id: () => {
      const id = process.env.FLW_PLAN_AGENCY
      if (!id) throw new Error('FLW_PLAN_AGENCY env var is not set')
      return id
    },
    amount: 79,
    name: 'Agency',
  },
} as const

export type PlanKey = keyof typeof PLANS

/**
 * Create a Flutterwave payment link for a subscription plan.
 * Returns the hosted payment page URL to redirect the customer to.
 */
export async function createCheckoutUrl(
  plan: PlanKey,
  email: string,
  userId: string,
  userName: string,
): Promise<string> {
  const appUrl  = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const planId  = PLANS[plan].id()
  const txRef   = `kdp-${userId}-${Date.now()}`

  const res = await fetch(`${BASE}/payments`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      tx_ref:           txRef,
      amount:           PLANS[plan].amount,
      currency:         'USD',
      redirect_url:     `${appUrl}/dashboard?payment=success`,
      payment_options:  'card',
      customer: {
        email,
        name: userName,
      },
      payment_plan: planId,
      meta: {
        userId,
        plan,
      },
      customizations: {
        title:       'KDP Cover AI',
        description: `${PLANS[plan].name} Plan — Monthly`,
        logo:        `${appUrl}/logo.png`,
      },
    }),
  })

  const json = await res.json()
  if (json.status !== 'success') {
    throw new Error(`Flutterwave checkout error: ${json.message ?? 'Unknown error'}`)
  }

  return json.data.link as string
}

/**
 * Cancel a Flutterwave subscription.
 */
export async function cancelSubscription(subscriptionId: string): Promise<void> {
  const res = await fetch(`${BASE}/subscriptions/${subscriptionId}/cancel`, {
    method: 'PUT',
    headers: headers(),
  })
  const json = await res.json()
  if (json.status !== 'success') {
    throw new Error(`Flutterwave cancel error: ${json.message ?? 'Unknown error'}`)
  }
}

/**
 * Verify a Flutterwave webhook signature.
 * Flutterwave sends a secret hash in the verif-hash header.
 */
export function verifyFlutterwaveWebhook(signature: string): boolean {
  const secret = process.env.FLW_WEBHOOK_HASH
  if (!secret) return false
  return signature === secret
}
