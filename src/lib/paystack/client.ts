/**
 * Paystack billing client — direct REST API, no SDK needed.
 *
 * Required env vars:
 *   PAYSTACK_SECRET_KEY      sk_live_xxxx  (or sk_test_xxxx for testing)
 *   PAYSTACK_PUBLIC_KEY      pk_live_xxxx
 *   NEXT_PUBLIC_APP_URL      https://your-domain.vercel.app
 *
 * Plan codes are created in your Paystack dashboard and stored as:
 *   PAYSTACK_PLAN_STARTER    PLN_xxxx
 *   PAYSTACK_PLAN_PRO        PLN_xxxx
 *   PAYSTACK_PLAN_AGENCY     PLN_xxxx
 */

const BASE = 'https://api.paystack.co'

function headers() {
  const key = process.env.PAYSTACK_SECRET_KEY
  if (!key) throw new Error('PAYSTACK_SECRET_KEY is not set')
  return {
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
  }
}

export const PLANS = {
  STARTER: {
    code: () => {
      const c = process.env.PAYSTACK_PLAN_STARTER
      if (!c) throw new Error('PAYSTACK_PLAN_STARTER env var is not set')
      return c
    },
    amount: 1370000, // ₦13,700 in kobo
    name: 'Starter',
  },
  PRO: {
    code: () => {
      const c = process.env.PAYSTACK_PLAN_PRO
      if (!c) throw new Error('PAYSTACK_PLAN_PRO env var is not set')
      return c
    },
    amount: 4110000, // ₦41,100 in kobo
    name: 'Pro',
  },
  AGENCY: {
    code: () => {
      const c = process.env.PAYSTACK_PLAN_AGENCY
      if (!c) throw new Error('PAYSTACK_PLAN_AGENCY env var is not set')
      return c
    },
    amount: 10960000, // ₦109,600 in kobo
    name: 'Agency',
  },
} as const

export type PlanKey = keyof typeof PLANS

/**
 * Initialize a Paystack transaction (subscription checkout).
 * Returns the authorization_url to redirect the customer to.
 */
export async function createCheckoutUrl(
  plan: PlanKey,
  email: string,
  userId: string,
): Promise<string> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const planCode = PLANS[plan].code()

  const res = await fetch(`${BASE}/transaction/initialize`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      email,
      amount: PLANS[plan].amount,   // Paystack uses kobo/cents — $9 = 900 cents
      currency: 'NGN',
      plan: planCode,
      callback_url: `${appUrl}/dashboard?payment=success`,
      metadata: {
        userId,
        plan,
        cancel_action: `${appUrl}/pricing`,
      },
    }),
  })

  const json = await res.json()
  if (!json.status) {
    throw new Error(`Paystack checkout error: ${json.message ?? 'Unknown error'}`)
  }

  return json.data.authorization_url as string
}

/**
 * Cancel (disable) a Paystack subscription.
 */
export async function cancelSubscription(
  subscriptionCode: string,
  emailToken: string,
): Promise<void> {
  const res = await fetch(`${BASE}/subscription/disable`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      code: subscriptionCode,
      token: emailToken,
    }),
  })
  const json = await res.json()
  if (!json.status) {
    throw new Error(`Paystack cancel error: ${json.message ?? 'Unknown error'}`)
  }
}

/**
 * Fetch a customer's subscriptions so we can show manage options.
 */
export async function getCustomerSubscriptions(email: string) {
  const res = await fetch(
    `${BASE}/subscription?perPage=5`,
    { headers: headers() }
  )
  const json = await res.json()
  return json.data ?? []
}

/**
 * Verify a Paystack webhook signature.
 * Paystack signs with HMAC-SHA512.
 */
export async function verifyPaystackWebhook(
  rawBody: string,
  signature: string,
): Promise<boolean> {
  const secret = process.env.PAYSTACK_SECRET_KEY
  if (!secret) return false

  const enc  = new TextEncoder()
  const key  = await crypto.subtle.importKey(
    'raw', enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-512' },
    false, ['sign']
  )
  const sig  = await crypto.subtle.sign('HMAC', key, enc.encode(rawBody))
  const hex  = Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

  return hex === signature
}
