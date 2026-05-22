export const EXCHANGE_RATE = 1370 // $1 = ₦1,370

export function getCommissionRate(
  activeReferrals: number,
  plan: string,
  isPaidUser: boolean
): number {
  const RATES: Record<string, Record<string, number>> = {
    starter: { L1: 0.08, L2: 0.12, L3: 0.15, L4: 0.18 },
    pro:     { L1: 0.10, L2: 0.20, L3: 0.25, L4: 0.30 },
    agency:  { L1: 0.08, L2: 0.15, L3: 0.20, L4: 0.25 },
  }
  const tier =
    activeReferrals >= 60 ? 'L4' :
    activeReferrals >= 40 ? 'L3' :
    activeReferrals >= 20 ? 'L2' : 'L1'
  const rate = RATES[plan.toLowerCase()]?.[tier] ?? 0.08
  return isPaidUser ? rate : rate * 0.5
}

export function usdToNgn(usd: number): number {
  return Math.round(usd * EXCHANGE_RATE)
}

export function getTierLabel(activeReferrals: number): string {
  if (activeReferrals >= 60) return 'L4'
  if (activeReferrals >= 40) return 'L3'
  if (activeReferrals >= 20) return 'L2'
  return 'L1'
}

export function getNextTierThreshold(activeReferrals: number): number {
  if (activeReferrals >= 60) return 60
  if (activeReferrals >= 40) return 60
  if (activeReferrals >= 20) return 40
  return 20
}
