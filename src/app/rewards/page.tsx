import type { Metadata } from 'next'
import RewardsClient from './RewardsClient'

export const metadata: Metadata = {
  title: 'Free Plan Rewards — KDP Cover AI',
  description: 'Follow our social media pages and earn a free Starter or Pro plan — no credit card needed.',
}

export default function RewardsPage() {
  return <RewardsClient />
}
