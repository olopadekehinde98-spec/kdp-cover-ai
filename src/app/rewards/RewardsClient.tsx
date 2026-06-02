'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'

// ── Update these URLs to your actual social media pages ──────────────────────
const SOCIAL_PLATFORMS = [
  {
    id: 'instagram',
    name: 'Instagram',
    icon: '📸',
    color: 'from-pink-600 to-purple-600',
    borderColor: 'border-pink-700/50',
    url: process.env.NEXT_PUBLIC_INSTAGRAM_URL || 'https://instagram.com/kdpcoverai',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: '🎵',
    color: 'from-gray-800 to-gray-900',
    borderColor: 'border-gray-600/50',
    url: process.env.NEXT_PUBLIC_TIKTOK_URL || 'https://tiktok.com/@kdpcoverai',
  },
  {
    id: 'twitter',
    name: 'Twitter / X',
    icon: '𝕏',
    color: 'from-sky-700 to-sky-900',
    borderColor: 'border-sky-700/50',
    url: process.env.NEXT_PUBLIC_TWITTER_URL || 'https://x.com/kdpcoverai',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: '👥',
    color: 'from-blue-700 to-blue-900',
    borderColor: 'border-blue-700/50',
    url: process.env.NEXT_PUBLIC_FACEBOOK_URL || 'https://facebook.com/kdpcoverai',
  },
]

const REFERRALS_FOR_PRO = 3

interface Status {
  followedPlatforms: string[]
  followCount: number
  allFollowed: boolean
  referralCount: number
  referralsNeeded: number
  starterUnlocked: boolean
  proUnlocked: boolean
  earnedPlan: string | null
  earnedPlanExpiresAt: string | null
  referralCode: string | null
  currentPlan: string
}

export default function RewardsClient() {
  const [status, setStatus] = useState<Status | null>(null)
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [claimingPro, setClaimingPro] = useState(false)

  async function loadStatus() {
    try {
      const res = await fetch('/api/rewards/status')
      if (res.ok) setStatus(await res.json())
    } catch { /* not signed in */ }
    setLoading(false)
  }

  useEffect(() => { loadStatus() }, [])

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  async function claimFollow(platform: string, url: string) {
    // Open the social page in a new tab first
    window.open(url, '_blank')

    // Wait a beat then record the claim
    setClaiming(platform)
    try {
      const res = await fetch('/api/rewards/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform }),
      })
      const data = await res.json()
      if (!res.ok) { showToast(data.error || 'Something went wrong', 'error'); return }

      if (data.reward === 'starter_unlocked') {
        showToast('🎉 Starter plan unlocked! You now have 20 covers for 30 days.')
      } else {
        showToast(`✓ ${platform} follow recorded! ${4 - data.followCount} more to go.`)
      }
      await loadStatus()
    } catch {
      showToast('Something went wrong. Please try again.', 'error')
    } finally {
      setClaiming(null)
    }
  }

  async function claimPro() {
    setClaimingPro(true)
    try {
      const res = await fetch('/api/rewards/claim-pro', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { showToast(data.error || 'Something went wrong', 'error'); return }
      showToast('🚀 Pro plan unlocked! Unlimited covers for 30 days!')
      await loadStatus()
    } catch {
      showToast('Something went wrong', 'error')
    } finally {
      setClaimingPro(false)
    }
  }

  const referralLink = status?.referralCode
    ? `${typeof window !== 'undefined' ? window.location.origin : 'https://kdpcoverai.site'}/sign-up?ref=${status.referralCode}`
    : null

  function copyReferralLink() {
    if (!referralLink) return
    navigator.clipboard.writeText(referralLink)
    showToast('Referral link copied!')
  }

  return (
    <>
      <div className="min-h-screen bg-gray-950 text-white">
        <SiteHeader />

        {/* Toast */}
        {toast && (
          <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl text-sm font-semibold shadow-2xl transition ${
            toast.type === 'success'
              ? 'bg-green-900 border border-green-700 text-green-100'
              : 'bg-red-900 border border-red-700 text-red-100'
          }`}>
            {toast.msg}
          </div>
        )}

        <div className="max-w-3xl mx-auto px-6 py-16">

          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-violet-950/60 border border-violet-700/40 text-violet-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
              🎁 Free Plan Rewards
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
              Earn Free Plans.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400">
                No Credit Card Ever.
              </span>
            </h1>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Support us on social media and we'll unlock premium features for free.
              Two ways to earn — the more you do, the more you get.
            </p>
          </div>

          {!loading && !status && (
            <div className="text-center bg-gray-900 border border-gray-800 rounded-2xl p-8">
              <p className="text-gray-400 mb-4">Sign in to start earning free plans</p>
              <Link href="/sign-in" className="inline-flex bg-violet-600 hover:bg-violet-700 text-white font-bold px-6 py-3 rounded-xl transition">
                Sign In →
              </Link>
            </div>
          )}

          {status && (
            <div className="space-y-6">

              {/* Active earned plan banner */}
              {status.earnedPlan && status.earnedPlanExpiresAt && (
                <div className="bg-green-950/30 border border-green-700/50 rounded-2xl p-5 flex items-center gap-4">
                  <div className="text-3xl">🎉</div>
                  <div>
                    <p className="text-green-400 font-bold">
                      {status.earnedPlan} plan active — earned for free!
                    </p>
                    <p className="text-gray-400 text-sm">
                      Expires {new Date(status.earnedPlanExpiresAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              )}

              {/* ── TIER 1: Social Follows → Starter ── */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                <div className="px-6 pt-6 pb-4 border-b border-gray-800">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-violet-600/20 text-violet-300 text-xs font-bold px-2 py-0.5 rounded-full">TIER 1</span>
                        <span className="text-gray-500 text-xs">Social follows</span>
                      </div>
                      <h2 className="text-xl font-bold text-white">Follow us on all 4 platforms</h2>
                      <p className="text-gray-400 text-sm mt-1">
                        Earn <span className="text-violet-300 font-semibold">Starter plan free for 30 days</span> — 20 covers, all features
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-3xl font-black text-white">{status.followCount}<span className="text-gray-600 text-xl">/4</span></p>
                      <p className="text-gray-500 text-xs">followed</p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-4 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-600 to-pink-500 rounded-full transition-all duration-500"
                      style={{ width: `${(status.followCount / 4) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SOCIAL_PLATFORMS.map(platform => {
                    const followed = status.followedPlatforms.includes(platform.id)
                    const isLoading = claiming === platform.id
                    return (
                      <button
                        key={platform.id}
                        onClick={() => !followed && claimFollow(platform.id, platform.url)}
                        disabled={followed || !!claiming}
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border transition text-left ${
                          followed
                            ? 'bg-green-950/30 border-green-700/40 cursor-default'
                            : `bg-gray-800 ${platform.borderColor} hover:bg-gray-750 cursor-pointer`
                        }`}
                      >
                        <span className="text-2xl w-8 text-center">{followed ? '✅' : platform.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold text-sm ${followed ? 'text-green-400' : 'text-white'}`}>
                            {platform.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {followed ? 'Followed ✓' : isLoading ? 'Opening...' : 'Click to follow & mark done'}
                          </p>
                        </div>
                        {!followed && (
                          <span className="text-xs text-violet-400 font-bold shrink-0">Follow →</span>
                        )}
                      </button>
                    )
                  })}
                </div>

                {status.allFollowed && !status.earnedPlan && (
                  <div className="px-4 pb-4">
                    <div className="bg-violet-950/40 border border-violet-700/40 rounded-xl p-4 text-center">
                      <p className="text-violet-300 font-semibold text-sm">
                        🎉 All followed! Your Starter plan has been activated automatically.
                      </p>
                    </div>
                  </div>
                )}

                {status.allFollowed && status.earnedPlan === 'STARTER' && (
                  <div className="px-4 pb-4">
                    <div className="bg-green-950/30 border border-green-700/40 rounded-xl p-3 text-center">
                      <p className="text-green-400 font-semibold text-sm">✅ Starter plan active — 20 covers for 30 days</p>
                    </div>
                  </div>
                )}
              </div>

              {/* ── TIER 2: Referrals → Pro ── */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                <div className="px-6 pt-6 pb-4 border-b border-gray-800">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-pink-600/20 text-pink-300 text-xs font-bold px-2 py-0.5 rounded-full">TIER 2</span>
                        <span className="text-gray-500 text-xs">Referrals</span>
                      </div>
                      <h2 className="text-xl font-bold text-white">Refer 3 friends who sign up</h2>
                      <p className="text-gray-400 text-sm mt-1">
                        Earn <span className="text-pink-300 font-semibold">Pro plan free for 30 days</span> — unlimited covers, all features
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-3xl font-black text-white">{status.referralCount}<span className="text-gray-600 text-xl">/{REFERRALS_FOR_PRO}</span></p>
                      <p className="text-gray-500 text-xs">referred</p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-4 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-pink-600 to-orange-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((status.referralCount / REFERRALS_FOR_PRO) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  {referralLink ? (
                    <>
                      <div>
                        <p className="text-gray-400 text-sm mb-2">Your unique referral link — share this:</p>
                        <div className="flex gap-2">
                          <div className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-300 font-mono truncate">
                            {referralLink}
                          </div>
                          <button
                            onClick={copyReferralLink}
                            className="bg-violet-600 hover:bg-violet-700 text-white font-bold px-4 py-3 rounded-xl transition text-sm shrink-0"
                          >
                            Copy
                          </button>
                        </div>
                      </div>

                      {/* Share shortcuts */}
                      <div className="grid grid-cols-2 gap-2">
                        <a
                          href={`https://wa.me/?text=${encodeURIComponent(`Generate professional Amazon KDP book covers in under 2 minutes — FREE!\n\n${referralLink}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 bg-green-800/30 hover:bg-green-800/50 border border-green-700/40 text-green-300 text-sm font-semibold py-3 rounded-xl transition"
                        >
                          <span>💬</span> Share on WhatsApp
                        </a>
                        <a
                          href={`https://x.com/intent/tweet?text=${encodeURIComponent(`Generate professional Amazon KDP book covers FREE in under 2 mins 📚\n${referralLink}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 bg-sky-900/30 hover:bg-sky-900/50 border border-sky-700/40 text-sky-300 text-sm font-semibold py-3 rounded-xl transition"
                        >
                          <span>𝕏</span> Post on X
                        </a>
                      </div>

                      {status.referralCount < REFERRALS_FOR_PRO && (
                        <p className="text-gray-500 text-xs text-center">
                          {status.referralsNeeded} more friend{status.referralsNeeded !== 1 ? 's' : ''} need to sign up using your link to unlock Pro
                        </p>
                      )}

                      {status.proUnlocked && status.earnedPlan !== 'PRO' && (
                        <button
                          onClick={claimPro}
                          disabled={claimingPro}
                          className="w-full bg-gradient-to-r from-pink-600 to-orange-500 hover:opacity-90 disabled:opacity-60 text-white font-black py-4 rounded-xl transition text-lg"
                        >
                          {claimingPro ? 'Activating...' : '🚀 Claim Your Free Pro Plan →'}
                        </button>
                      )}

                      {status.earnedPlan === 'PRO' && (
                        <div className="bg-green-950/30 border border-green-700/40 rounded-xl p-3 text-center">
                          <p className="text-green-400 font-semibold text-sm">✅ Pro plan active — unlimited covers for 30 days</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-500 text-sm text-center">Referral code loading...</p>
                  )}
                </div>
              </div>

              {/* How it works */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">How it works</h3>
                <div className="space-y-3">
                  {[
                    { step: '1', text: 'Click each social platform button above — it opens the page in a new tab' },
                    { step: '2', text: 'Follow us on that platform, then come back and the follow is recorded automatically' },
                    { step: '3', text: 'Follow all 4 → your Starter plan activates instantly (20 covers, 30 days)' },
                    { step: '4', text: 'Share your referral link. Every friend who signs up counts toward your Pro unlock' },
                    { step: '5', text: 'Reach 3 referrals → click "Claim Pro Plan" → unlimited covers for 30 days' },
                  ].map(item => (
                    <div key={item.step} className="flex gap-3 items-start">
                      <span className="w-6 h-6 rounded-full bg-violet-600/30 text-violet-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{item.step}</span>
                      <p className="text-gray-400 text-sm">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>

        <SiteFooter />
      </div>
    </>
  )
}
