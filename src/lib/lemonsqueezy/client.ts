/**
 * Lemon Squeezy API client — no SDK needed, direct REST calls.
 *
 * Env vars required:
 *   LEMONSQUEEZY_API_KEY      — from your LS dashboard → API Keys
 *   LEMONSQUEEZY_STORE_ID     — numeric store ID
 *   LEMONSQUEEZY_WEBHOOK_SECRET — from Webhooks settings
 *   LS_VARIANT_STARTER        — variant ID for Starter plan
 *   LS_VARIANT_PRO            — variant ID for Pro plan
 *   LS_VARIANT_AGENCY         — variant ID for Agency plan
 */

const LS_API = 'https://api.lemonsqueezy.com/v1'

function lsHeaders() {
  const key = process.env.LEMONSQUEEZY_API_KEY
  if (!key) throw new Error('LEMONSQUEEZY_API_KEY is not set')
  return {
    'Authorization': `Bearer ${key}`,
    'Accept': 'application/vnd.api+json',
    'Content-Type': 'application/vnd.api+json',
  }
}

export const PLANS = {
  STARTER: {
    name: 'Starter',
    price: 9,
    variantId: () => process.env.LS_VARIANT_STARTER ?? '',
    generationsLimit: 15,
    features: [
      '20 covers per month',
      'All trim sizes',
      'KDP-ready PDF export',
      'Email support',
    ],
  },
  PRO: {
    name: 'Pro',
    price: 29,
    variantId: () => process.env.LS_VARIANT_PRO ?? '',
    generationsLimit: 999_999,
    features: [
      'Unlimited covers',
      'All trim sizes',
      'KDP-ready PDF export',
      'Commercial use rights',
      'Series branding',
      'AI back cover description',
      'Priority support',
    ],
  },
  AGENCY: {
    name: 'Agency',
    price: 79,
    variantId: () => process.env.LS_VARIANT_AGENCY ?? '',
    generationsLimit: 999_999,
    features: [
      'Everything in Pro',
      'Team accounts (up to 5)',
      'Bulk generation queue',
      'Priority rendering',
      'White-label export',
      'Dedicated support',
    ],
  },
} as const

export type PlanKey = keyof typeof PLANS

/** Create a Lemon Squeezy checkout URL for a given plan */
export async function createCheckoutUrl(
  plan: PlanKey,
  email: string,
  userId: string,
  affiliateRef?: string
): Promise<string> {
  const storeId = process.env.LEMONSQUEEZY_STORE_ID
  if (!storeId) throw new Error('LEMONSQUEEZY_STORE_ID is not set')

  const variantId = PLANS[plan].variantId()
  if (!variantId) throw new Error(`LS_VARIANT_${plan} is not set`)

  const body = {
    data: {
      type: 'checkouts',
      attributes: {
        checkout_data: {
          email,
          custom: { userId, plan },
        },
        product_options: {
          redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
        },
        // Pass affiliate ref if present (Lemon Squeezy handles tracking automatically)
        ...(affiliateRef ? { affiliate: affiliateRef } : {}),
      },
      relationships: {
        store: { data: { type: 'stores', id: storeId } },
        variant: { data: { type: 'variants', id: variantId } },
      },
    },
  }

  const res = await fetch(`${LS_API}/checkouts`, {
    method: 'POST',
    headers: lsHeaders(),
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`LS checkout failed ${res.status}: ${text}`)
  }

  const json = await res.json()
  return json.data.attributes.url as string
}

/** Get a Lemon Squeezy customer portal URL */
export async function getCustomerPortalUrl(lsCustomerId: string): Promise<string> {
  const res = await fetch(`${LS_API}/customers/${lsCustomerId}`, {
    headers: lsHeaders(),
  })

  if (!res.ok) throw new Error(`LS customer fetch failed ${res.status}`)

  const json = await res.json()
  return json.data.attributes.urls?.customer_portal as string
}

/** Verify a Lemon Squeezy webhook signature */
export async function verifyLSWebhook(
  rawBody: string,
  signature: string
): Promise<boolean> {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET
  if (!secret) throw new Error('LEMONSQUEEZY_WEBHOOK_SECRET is not set')

  // LS uses HMAC-SHA256 hex digest
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign']
  )
  const sigBuffer = await crypto.subtle.sign('HMAC', key, enc.encode(rawBody))
  const computed = Array.from(new Uint8Array(sigBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

  return computed === signature
}
