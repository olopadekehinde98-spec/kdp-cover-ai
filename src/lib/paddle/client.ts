/**
 * Paddle Billing client — direct REST API, no SDK needed.
 *
 * Required env vars:
 *   PADDLE_API_KEY            pdl_live_xxxx  (or pdl_test_xxxx for sandbox)
 *   PADDLE_WEBHOOK_SECRET     pdlntfy_xxxx
 *   NEXT_PUBLIC_PADDLE_CLIENT_TOKEN  test_xxxx or live_xxxx  (for frontend JS)
 *   NEXT_PUBLIC_APP_URL       https://your-domain.vercel.app
 *
 * Price IDs from your Paddle dashboard:
 *   PADDLE_PRICE_STARTER      pri_xxxx
 *   PADDLE_PRICE_PRO          pri_xxxx
 *   PADDLE_PRICE_AGENCY       pri_xxxx
 */

const BASE = process.env.PADDLE_SANDBOX === 'true'
  ? 'https://sandbox-api.paddle.com'
  : 'https://api.paddle.com'

function headers() {
  const key = process.env.PADDLE_API_KEY
  if (!key) throw new Error('PADDLE_API_KEY is not set')
  return {
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
  }
}

export const PLANS = {
  STARTER: {
    priceId: () => {
      const id = process.env.PADDLE_PRICE_STARTER
      if (!id) throw new Error('PADDLE_PRICE_STARTER env var is not set')
      return id
    },
    name: 'Starter',
  },
  PRO: {
    priceId: () => {
      const id = process.env.PADDLE_PRICE_PRO
      if (!id) throw new Error('PADDLE_PRICE_PRO env var is not set')
      return id
    },
    name: 'Pro',
  },
  AGENCY: {
    priceId: () => {
      const id = process.env.PADDLE_PRICE_AGENCY
      if (!id) throw new Error('PADDLE_PRICE_AGENCY env var is not set')
      return id
    },
    name: 'Agency',
  },
} as const

export type PlanKey = keyof typeof PLANS

/**
 * Create a Paddle checkout transaction and return the hosted checkout URL.
 */
export async function createCheckoutUrl(
  plan: PlanKey,
  email: string,
  userId: string,
): Promise<string> {
  const appUrl  = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const priceId = PLANS[plan].priceId()

  const res = await fetch(`${BASE}/transactions`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      items: [{ price_id: priceId, quantity: 1 }],
      customer: { email },
      custom_data: { userId, plan },
      checkout: {
        url: `${appUrl}/dashboard?payment=success`,
      },
    }),
  })

  const json = await res.json()
  if (json.error) {
    throw new Error(`Paddle checkout error: ${json.error.detail ?? JSON.stringify(json.error)}`)
  }

  const checkoutUrl = json.data?.checkout?.url
  if (!checkoutUrl) throw new Error('Paddle did not return a checkout URL')
  return checkoutUrl as string
}

/**
 * Get the Paddle customer portal URL so users can manage their subscription.
 */
export async function getPortalUrl(paddleCustomerId: string): Promise<string> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''

  const res = await fetch(
    `${BASE}/customers/${paddleCustomerId}/portal-sessions`,
    {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        return_url: `${appUrl}/dashboard`,
      }),
    }
  )

  const json = await res.json()
  if (json.error) {
    throw new Error(`Paddle portal error: ${json.error.detail ?? JSON.stringify(json.error)}`)
  }

  return json.data?.urls?.general?.overview as string
}

/**
 * Verify a Paddle webhook using HMAC-SHA256.
 * https://developer.paddle.com/webhooks/signature-verification
 */
export async function verifyPaddleWebhook(
  rawBody: string,
  signature: string,
): Promise<boolean> {
  const secret = process.env.PADDLE_WEBHOOK_SECRET
  if (!secret) return false

  // Paddle signature format: ts=xxx;h1=xxx
  const parts: Record<string, string> = {}
  signature.split(';').forEach(part => {
    const [k, v] = part.split('=')
    if (k && v) parts[k] = v
  })

  const ts   = parts['ts']
  const h1   = parts['h1']
  if (!ts || !h1) return false

  const payload = `${ts}:${rawBody}`
  const enc     = new TextEncoder()
  const key     = await crypto.subtle.importKey(
    'raw', enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload))
  const hex = Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

  return hex === h1
}
