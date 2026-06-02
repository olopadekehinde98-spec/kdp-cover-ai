'use client'

import { useEffect, useState, useRef } from 'react'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'

const SOCIAL_PLATFORMS = [
  {
    id: 'instagram',
    name: 'Instagram',
    handle: '@kdpcoverai.official',
    icon: '📸',
    borderColor: 'border-pink-700/50',
    url: 'https://instagram.com/kdpcoverai.official',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    handle: '@KdpCoveraiofficial',
    icon: '▶️',
    borderColor: 'border-red-700/50',
    url: 'https://youtube.com/@KdpCoveraiofficial',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    handle: '@kdpcoverai_official',
    icon: '🎵',
    borderColor: 'border-gray-600/50',
    url: 'https://tiktok.com/@kdpcoverai_official',
  },
]

// Seconds user must wait on social page before they can confirm follow
const FOLLOW_WAIT_SECONDS = 20
const REFERRALS_FOR_PRO = 3

interface Status {
  emailVerified: boolean
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
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [claimingPro, setClaimingPro] = useState(false)

  // Per-platform timer state: null = not started, number = countdown seconds remaining, 0 = ready to confirm
  const [timers, setTimers] = useState<Record<string, number | null>>({})
  const [confirming, setConfirming] = useState<string | null>(null)
  const timerRefs = useRef<Record<string, ReturnType<typeof setInterval>>>({})

  async function loadStatus() {
    try {
      const res = await fetch('/api/rewards/status')
      if (res.ok) setStatus(await res.json())
    } catch {}
    setLoading(false)
  }

  useEffect(() => { loadStatus() }, [])

  // Clean up timers on unmount
  useEffect(() => () => {
    Object.values(timerRefs.current).forEach(clearInterval)
  }, [])

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 5000)
  }

  // Step 1: open social page + start countdown
  function startFollow(platform: string, url: string) {
    window.open(url, '_blank', 'noopener,noreferrer')
    setTimers(t => ({ ...t, [platform]: FOLLOW_WAIT_SECONDS }))

    const interval = setInterval(() => {
      setTimers(prev => {
        const current = prev[platform]
        if (typeof current !== 'number' || current <= 1) {
          clearInterval(interval)
          return { ...prev, [platform]: 0 }
        }
        return { ...prev, [platform]: current - 1 }
      })
    }, 1000)
    timerRefs.current[platform] = interval
  }

  // Step 2: confirm they actually followed (timer must be 0)
  async function confirmFollow(platform: string) {
    setConfirming(platform)
    try {
      const res = await fetch('/api/rewards/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform }),
      })
      const data = await res.json()

      if (!res.ok) {
        if (data.code === 'EMAIL_NOT_VERIFIED') {
          showToast('⚠️ Verify your email first — check your inbox for the verification link.', 'error')
        } else {
          showToast(data.error || 'Something went wrong', 'error')
        }
        return
      }

      if (data.reward === 'starter_unlocked') {
        showToast('🎉 All 3 followed! Starter plan is now active — 20 covers for 30 days.')
      } else {
        showToast(`✓ ${platform} follow confirmed! ${3 - data.followCount} more to go.`)
      }
      setTimers(t => { const n = { ...t }; delete n[platform]; return n })
      await loadStatus()
    } catch {
      showToast('Something went wrong. Please try again.', 'error')
    } finally {
      setConfirming(null)
    }
  }

  async function claimPro() {
    setClaimingPro(true)
    try {
      const res = await fetch('/api/rewards/claim-pro', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        if (data.code === 'EMAIL_NOT_VERIFIED') {
          showToast('⚠️ Verify your email address first before claiming Pro.', 'error')
        } else {
          showToast(data.error || 'Something went wrong', 'error')
        }
        return
      }
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
          <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl text-sm font-semibold shadow-2xl max-w-sm text-center ${
            toast.type === 'success' ? 'bg-green-900 border border-green-700 text-green-100' : 'bg-red-900 border border-red-700 text-red-100'
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
              Follow us on social media and refer friends to unlock premium features completely free.
            </p>
          </div>

          {loading && (
            <div className="text-center text-gray-500 py-12">Loading your rewards...</div>
          )}

          {status && (
            <div className="space-y-6">

              {/* Email verification warning */}
              {!status.emailVerified && (
                <div className="bg-amber-950/30 border border-amber-700/50 rounded-2xl p-5 flex items-start gap-4">
                  <span className="text-2xl shrink-0">⚠️</span>
                  <div>
                    <p className="text-amber-300 font-bold mb-1">Verify your email to claim rewards</p>
                    <p className="text-gray-400 text-sm">
                      You must confirm your email address before any plan reward can be activated.
                      Check your inbox for the verification email from KDP Cover AI.
                    </p>
                  </div>
                </div>
              )}

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

              {/* ── TIER 1: Follow all 3 → Starter ── */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                <div className="px-6 pt-6 pb-4 border-b border-gray-800">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-violet-600/20 text-violet-300 text-xs font-bold px-2 py-0.5 rounded-full">TIER 1</span>
                        <span className="text-gray-500 text-xs">Social follows</span>
                      </div>
                      <h2 className="text-xl font-bold text-white">Follow us on all 3 platforms</h2>
                      <p className="text-gray-400 text-sm mt-1">
                        Earn <span className="text-violet-300 font-semibold">Starter plan free for 30 days</span> — 20 covers, all features
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-3xl font-black text-white">{status.followCount}<span className="text-gray-600 text-xl">/3</span></p>
                      <p className="text-gray-500 text-xs">followed</p>
                    </div>
                  </div>
                  <div className="mt-4 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-600 to-pink-500 rounded-full transition-all duration-500"
                      style={{ width: `${(status.followCount / 3) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  {SOCIAL_PLATFORMS.map(platform => {
                    const followed = status.followedPlatforms.includes(platform.id)
                    const timerVal = timers[platform.id]
                    const timerStarted = timerVal !== undefined && timerVal !== null
                    const timerDone = timerVal === 0
                    const isConfirming = confirming === platform.id

                    return (
                      <div key={platform.id} className={`rounded-xl border p-4 ${
                        followed ? 'bg-green-950/20 border-green-700/40' : `bg-gray-800 ${platform.borderColor}`
                      }`}>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl w-8 text-center">{followed ? '✅' : platform.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className={`font-semibold text-sm ${followed ? 'text-green-400' : 'text-white'}`}>
                              {platform.name}
                              <span className="text-gray-500 font-normal ml-2 text-xs">{platform.handle}</span>
                            </p>
                            {followed && <p className="text-xs text-green-500">Followed ✓</p>}
                            {!followed && !timerStarted && (
                              <p className="text-xs text-gray-500">Click to open page → follow → confirm</p>
                            )}
                            {!followed && timerStarted && !timerDone && (
                              <p className="text-xs text-amber-400">
                                ⏳ Follow the page now — confirm available in {timerVal}s
                              </p>
                            )}
                            {!followed && timerDone && (
                              <p className="text-xs text-green-400">✓ Timer done — click "I Followed" to confirm</p>
                            )}
                          </div>

                          {/* Action button */}
                          {!followed && !timerStarted && (
                            <button
                              onClick={() => startFollow(platform.id, platform.url)}
                              className="bg-violet-600 hover:bg-violet-700 text-white font-bold px-4 py-2 rounded-lg text-sm transition shrink-0"
                            >
                              Open & Follow →
                            </button>
                          )}
                          {!followed && timerStarted && !timerDone && (
                            <div className="flex items-center gap-2 shrink-0">
                              <div className="w-10 h-10 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
                              <span className="text-amber-400 font-black text-lg w-6">{timerVal}</span>
                            </div>
                          )}
                          {!followed && timerDone && (
                            <button
                              onClick={() => confirmFollow(platform.id)}
                              disabled={isConfirming}
                              className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold px-4 py-2 rounded-lg text-sm transition shrink-0"
                            >
                              {isConfirming ? 'Confirming...' : 'I Followed ✓'}
                            </button>
                          )}
                        </div>

                        {/* Timer progress bar */}
                        {!followed && timerStarted && !timerDone && typeof timerVal === 'number' && (
                          <div className="mt-3 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-500 rounded-full transition-all duration-1000"
                              style={{ width: `${((FOLLOW_WAIT_SECONDS - timerVal) / FOLLOW_WAIT_SECONDS) * 100}%` }}
                            />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* How it works note */}
                <div className="px-5 pb-5">
                  <div className="bg-gray-800/60 rounded-xl px-4 py-3 text-xs text-gray-500">
                    <strong className="text-gray-400">How it works:</strong> Click "Open & Follow" → the page opens in a new tab →
                    follow the account there → come back here and wait for the timer →
                    click "I Followed" to confirm. All 3 platforms must be followed to unlock Starter.
                  </div>
                </div>
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
                        Earn <span className="text-pink-300 font-semibold">Pro plan free for 30 days</span> — unlimited covers
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-3xl font-black text-white">{status.referralCount}<span className="text-gray-600 text-xl">/{REFERRALS_FOR_PRO}</span></p>
                      <p className="text-gray-500 text-xs">referred</p>
                    </div>
                  </div>
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

                      <div className="grid grid-cols-2 gap-2">
                        <a
                          href={`https://wa.me/?text=${encodeURIComponent(`Generate professional Amazon KDP book covers FREE in under 2 mins!\n\n${referralLink}`)}`}
                          target="_blank" rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 bg-green-800/30 hover:bg-green-800/50 border border-green-700/40 text-green-300 text-sm font-semibold py-3 rounded-xl transition"
                        >
                          💬 Share on WhatsApp
                        </a>
                        <a
                          href={`https://x.com/intent/tweet?text=${encodeURIComponent(`Get 5 FREE Amazon KDP book covers — no credit card!\n${referralLink}`)}`}
                          target="_blank" rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 bg-sky-900/30 hover:bg-sky-900/50 border border-sky-700/40 text-sky-300 text-sm font-semibold py-3 rounded-xl transition"
                        >
                          𝕏 Post on X
                        </a>
                      </div>

                      {status.referralCount < REFERRALS_FOR_PRO && (
                        <p className="text-gray-500 text-xs text-center">
                          {status.referralsNeeded} more friend{status.referralsNeeded !== 1 ? 's' : ''} need to sign up using your link
                        </p>
                      )}

                      {status.proUnlocked && status.earnedPlan !== 'PRO' && (
                        <button
                          onClick={claimPro}
                          disabled={claimingPro || !status.emailVerified}
                          className="w-full bg-gradient-to-r from-pink-600 to-orange-500 hover:opacity-90 disabled:opacity-50 text-white font-black py-4 rounded-xl transition text-lg"
                        >
                          {claimingPro ? 'Activating...' : !status.emailVerified ? '⚠️ Verify email first' : '🚀 Claim Your Free Pro Plan →'}
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

            </div>
          )}
        </div>
        <SiteFooter />
      </div>
    </>
  )
}
