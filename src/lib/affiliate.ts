export const EXCHANGE_RATE = 1370 // $1 = ₦1,370

/**
 * Flat dollar amount earned per successful PAID referral.
 * Tier is based on how many active paying referrals you currently have.
 *
 * L1:  0 –  9 active referrals → $3 per referral
 * L2: 10 – 19 active referrals → $5 per referral
 * L3: 20 – 39 active referrals → $10 per referral
 * L4: 40+   active referrals   → $15 per referral (no cap, same above 40)
 *
 * Free (unpaid) affiliates earn 50% of the standard rate.
 */
export function getCommissionAmount(
  activeReferrals: number,
  isPaidUser: boolean,
): number {
  let base: number
  if (activeReferrals >= 40) base = 15
  else if (activeReferrals >= 20) base = 10
  else if (activeReferrals >= 10) base = 5
  else base = 3

  return isPaidUser ? base : base * 0.5
}

/** @deprecated legacy alias — use getCommissionAmount instead */
export function getCommissionRate(
  activeReferrals: number,
  _plan: string,
  isPaidUser: boolean,
): number {
  return getCommissionAmount(activeReferrals, isPaidUser)
}

export function usdToNgn(usd: number): number {
  return Math.round(usd * EXCHANGE_RATE)
}

export function getTierLabel(activeReferrals: number): string {
  if (activeReferrals >= 40) return 'L4'
  if (activeReferrals >= 20) return 'L3'
  if (activeReferrals >= 10) return 'L2'
  return 'L1'
}

export function getNextTierThreshold(activeReferrals: number): number {
  if (activeReferrals < 10) return 10
  if (activeReferrals < 20) return 20
  if (activeReferrals < 40) return 40
  return 40 // already at max tier
}

/** Dollar amount for a given tier string */
export function getTierEarning(tier: string, isPaidUser: boolean): number {
  const base: Record<string, number> = { L1: 3, L2: 5, L3: 10, L4: 15 }
  const b = base[tier] ?? 3
  return isPaidUser ? b : b * 0.5
}
