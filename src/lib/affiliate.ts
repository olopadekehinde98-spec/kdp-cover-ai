export const EXCHANGE_RATE = 1370 // $1 = ₦1,370

export const PLAN_PRICES: Record<string, number> = {
  STARTER: 9,
  PRO: 29,
  AGENCY: 79,
}

/**
 * Commission rates by tier and plan (percentage of monthly plan price).
 *
 * Tier based on total ACTIVE PAYING referrals:
 *   L1:  0 –  9
 *   L2: 10 – 19
 *   L3: 20 – 39
 *   L4: 40 – 59
 *   L5: 60+  ← maximum tier, 30% on Pro
 *
 * Agency has lower % (higher $ cost to serve unlimited users).
 * Free affiliates earn 50% of each rate below.
 */
const RATES: Record<string, Record<string, number>> = {
  //           L1    L2    L3    L4    L5
  STARTER: { L1: 0.08, L2: 0.12, L3: 0.18, L4: 0.22, L5: 0.25 },
  PRO:     { L1: 0.10, L2: 0.15, L3: 0.22, L4: 0.27, L5: 0.30 },
  AGENCY:  { L1: 0.05, L2: 0.08, L3: 0.10, L4: 0.12, L5: 0.15 },
}

export function getTierLabel(activeReferrals: number): string {
  if (activeReferrals >= 60) return 'L5'
  if (activeReferrals >= 40) return 'L4'
  if (activeReferrals >= 20) return 'L3'
  if (activeReferrals >= 10) return 'L2'
  return 'L1'
}

export function getNextTierThreshold(activeReferrals: number): number {
  if (activeReferrals < 10) return 10
  if (activeReferrals < 20) return 20
  if (activeReferrals < 40) return 40
  if (activeReferrals < 60) return 60
  return 60 // already at max
}

/**
 * Returns the commission rate (0–1) for a given plan and referral count.
 * Free affiliates earn 50% of the standard rate.
 */
export function getCommissionRate(
  activeReferrals: number,
  plan: string,
  isPaidUser: boolean,
): number {
  const tier = getTierLabel(activeReferrals)
  const planKey = plan.toUpperCase()
  const rate = RATES[planKey]?.[tier] ?? RATES.STARTER[tier]
  return isPaidUser ? rate : rate * 0.5
}

/**
 * Returns the flat dollar commission for a referral on a given plan.
 * Free affiliates earn 50%.
 */
export function getCommissionAmount(
  activeReferrals: number,
  plan: string,
  isPaidUser: boolean,
): number {
  const rate = getCommissionRate(activeReferrals, plan, isPaidUser)
  const price = PLAN_PRICES[plan.toUpperCase()] ?? PLAN_PRICES.STARTER
  return parseFloat((price * rate).toFixed(2))
}

export function usdToNgn(usd: number): number {
  return Math.round(usd * EXCHANGE_RATE)
}

/** Convenience: dollar amounts for every tier/plan combo (paid user) */
export const COMMISSION_TABLE = {
  STARTER: { L1: 0.72, L2: 1.08, L3: 1.62, L4: 1.98, L5: 2.25 },
  PRO:     { L1: 2.90, L2: 4.35, L3: 6.38, L4: 7.83, L5: 8.70 },
  AGENCY:  { L1: 3.95, L2: 6.32, L3: 7.90, L4: 9.48, L5: 11.85 },
}
