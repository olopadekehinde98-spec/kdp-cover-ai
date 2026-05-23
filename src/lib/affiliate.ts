export const EXCHANGE_RATE = 1370 // $1 = ₦1,370

export const PLAN_PRICES: Record<string, number> = {
  STARTER: 10,
  PRO: 30,
  AGENCY: 80,
}

/**
 * EQUAL & FAIR commission system.
 * One flat percentage per tier — identical for ALL plans.
 * Commissions naturally scale with plan price (more expensive plan = higher $ for affiliate).
 *
 * Tier thresholds (active PAYING referrals):
 *   L1:  0 –  9
 *   L2: 10 – 19
 *   L3: 20 – 39
 *   L4: 40 – 59
 *   L5: 60+  ← maximum (15.5% of any plan price)
 *
 * Dollar amounts per referral per month (paid affiliate):
 *   L1: 5%  → Starter $0.50 · Pro $1.50 · Agency $4.00
 *   L2: 8%  → Starter $0.80 · Pro $2.40 · Agency $6.40
 *   L3: 10% → Starter $1.00 · Pro $3.00 · Agency $8.00
 *   L4: 13% → Starter $1.30 · Pro $3.90 · Agency $10.40
 *   L5: 15.5% → Starter $1.55 · Pro $4.65 · Agency $12.40
 *
 * Free affiliates earn 50% of each rate.
 */
const TIER_RATES: Record<string, number> = {
  L1: 0.050,
  L2: 0.080,
  L3: 0.100,
  L4: 0.130,
  L5: 0.155,
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
  return 60
}

/**
 * Commission rate (0–1) for current tier.
 * Same rate for all plans — applied to plan price to get dollar amount.
 * Free affiliates earn 50%.
 */
export function getCommissionRate(
  activeReferrals: number,
  _plan: string, // kept for API compatibility — rate is plan-agnostic
  isPaidUser: boolean,
): number {
  const tier = getTierLabel(activeReferrals)
  const rate = TIER_RATES[tier] ?? TIER_RATES.L1
  return isPaidUser ? rate : rate * 0.5
}

/**
 * Flat dollar commission for a referral on a given plan.
 * = plan_price × tier_rate (× 0.5 for free affiliates)
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

/** Pre-computed dollar amounts for each tier/plan (paid affiliate full rate) */
export const COMMISSION_TABLE: Record<string, Record<string, number>> = {
  STARTER: { L1: 0.50, L2: 0.80, L3: 1.00, L4: 1.30, L5: 1.55 },
  PRO:     { L1: 1.50, L2: 2.40, L3: 3.00, L4: 3.90, L5: 4.65 },
  AGENCY:  { L1: 4.00, L2: 6.40, L3: 8.00, L4: 10.40, L5: 12.40 },
}

/** Tier rate as percentage string e.g. "15.5%" */
export function getTierRatePct(activeReferrals: number): string {
  const tier = getTierLabel(activeReferrals)
  return `${(TIER_RATES[tier] * 100).toFixed(1)}%`
}
