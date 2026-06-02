'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function RewardsBanner() {
  const [data, setData] = useState<{ followCount: number; referralCount: number; earnedPlan: string | null; currentPlan: string } | null>(null)

  useEffect(() => {
    fetch('/api/rewards/status')
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setData(d))
      .catch(() => {})
  }, [])

  if (!data) return null
  // Don't show if already on Pro or Agency (paid plan)
  if (data.currentPlan === 'PRO' || data.currentPlan === 'AGENCY') return null

  const allDone = data.followCount >= 4 && data.referralCount >= 3

  return (
    <Link href="/rewards" className="block">
      <div className="bg-gradient-to-r from-violet-950/60 to-pink-950/40 border border-violet-700/40 rounded-2xl p-4 hover:border-violet-600/60 transition cursor-pointer">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎁</span>
            <div>
              <p className="text-white font-bold text-sm">Earn free Starter & Pro plans</p>
              <p className="text-gray-400 text-xs">
                Follow our socials → free Starter · Refer 3 friends → free Pro
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-gray-500">Progress</p>
              <p className="text-xs text-violet-300 font-semibold">{data.followCount}/4 follows · {data.referralCount}/3 referrals</p>
            </div>
            <span className="text-violet-400 font-bold text-sm">View →</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
