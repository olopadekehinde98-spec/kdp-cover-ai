'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { EXCHANGE_RATE, getCommissionRate, getTierLabel, getNextTierThreshold, usdToNgn } from '@/lib/affiliate'

const PLAN_PRICES: Record<string, number> = { starter: 9, pro: 29, agency: 79 }

type Profile = {
  id: string
  referralCode: string
  totalReferrals: number
  activeReferrals: number
  totalEarnedUsd: number
  totalPaidUsd: number
  bankName: string | null
  accountNumber: string | null
  accountName: string | null
  isActive: boolean
  joinedAt: string
  commissions: Array<{
    id: string
    plan: string
    amountUsd: number
    percentage: number
    isPaid: boolean
    createdAt: string
  }>
  payouts: Array<{
    id: string
    amountUsd: number
    amountNgn: number
    status: string
    requestedAt: string
    paidAt: string | null
  }>
}

export default function AffiliateDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [unpaidBalance, setUnpaidBalance] = useState(0)
  const [pendingPayout, setPendingPayout] = useState(0)
  const [isPaidUser, setIsPaidUser] = useState(false)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [copied, setCopied] = useState(false)
  const [currency, setCurrency] = useState<'USD' | 'NGN'>('USD')
  const [showPayoutForm, setShowPayoutForm] = useState(false)
  const [bankName, setBankName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountName, setAccountName] = useState('')
  const [payoutMsg, setPayoutMsg] = useState('')
  const [payoutLoading, setPayoutLoading] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/affiliate/stats')
      const data = await res.json()
      setProfile(data.profile)
      setUnpaidBalance(data.unpaidBalance || 0)
      setPendingPayout(data.pendingPayout || 0)
      setIsPaidUser(data.isPaidUser || false)
      if (data.profile) {
        setBankName(data.profile.bankName || '')
        setAccountNumber(data.profile.accountNumber || '')
        setAccountName(data.profile.accountName || '')
      }
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function joinAffiliate() {
    setJoining(true)
    try {
      await fetch('/api/affiliate/join', { method: 'POST' })
      await load()
    } catch {}
    setJoining(false)
  }

  function copyLink() {
    if (!profile) return
    const link = `${window.location.origin}/?ref=${profile.referralCode}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function requestPayout() {
    if (!bankName || !accountNumber || !accountName) {
      setPayoutMsg('Please fill in all bank details.')
      return
    }
    setPayoutLoading(true)
    setPayoutMsg('')
    try {
      const res = await fetch('/api/affiliate/payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bankName, accountNumber, accountName }),
      })
      const data = await res.json()
      if (res.ok) {
        setPayoutMsg('Payout request submitted! Admin will process within 2–3 business days.')
        setShowPayoutForm(false)
        await load()
      } else {
        setPayoutMsg(data.error || 'Failed to submit payout request.')
      }
    } catch {
      setPayoutMsg('Network error. Please try again.')
    }
    setPayoutLoading(false)
  }

  function fmt(usd: number) {
    if (currency === 'NGN') return `₦${usdToNgn(usd).toLocaleString()}`
    return `$${usd.toFixed(2)}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex-1 py-16 px-6">
        <div className="max-w-xl mx-auto text-center">
          <div className="text-5xl mb-4">💰</div>
          <h1 className="text-3xl font-black text-white mb-3">Join the Affiliate Program</h1>
          <p className="text-gray-400 mb-6">
            Earn up to 30% recurring commission for every paying user you refer.
            Paid monthly in USD (or NGN at ₦1,370/$1).
          </p>

          <div className="grid grid-cols-3 gap-3 mb-8 text-sm">
            {[
              { label: 'Commission', value: 'Up to 30%' },
              { label: 'Payout', value: 'Monthly' },
              { label: 'Minimum', value: '$10' },
            ].map(item => (
              <div key={item.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <p className="text-gray-500 text-xs mb-1">{item.label}</p>
                <p className="text-white font-bold">{item.value}</p>
              </div>
            ))}
          </div>

          <button
            onClick={joinAffiliate}
            disabled={joining}
            className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold px-8 py-4 rounded-xl text-lg transition"
          >
            {joining ? 'Joining...' : 'Join as Affiliate — Free'}
          </button>
          <p className="text-gray-600 text-xs mt-3">No cost to join. Earn on every referral immediately.</p>
        </div>
      </div>
    )
  }

  const tier = getTierLabel(profile.activeReferrals)
  const nextThreshold = getNextTierThreshold(profile.activeReferrals)
  const progressPct = tier === 'L4' ? 100 :
    tier === 'L3' ? Math.min(100, ((profile.activeReferrals - 40) / 20) * 100) :
    tier === 'L2' ? Math.min(100, ((profile.activeReferrals - 20) / 20) * 100) :
    Math.min(100, (profile.activeReferrals / 20) * 100)

  const availableBalance = unpaidBalance - pendingPayout
  const referralLink = typeof window !== 'undefined' ? `${window.location.origin}/?ref=${profile.referralCode}` : `https://kdpcoverai.com/?ref=${profile.referralCode}`

  const TIER_COLORS: Record<string, string> = {
    L1: 'text-gray-300 bg-gray-800',
    L2: 'text-blue-300 bg-blue-900/50',
    L3: 'text-violet-300 bg-violet-900/50',
    L4: 'text-amber-300 bg-amber-900/50',
  }

  return (
    <div className="flex-1 py-10 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-white">Affiliate Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Code: <span className="font-mono text-violet-400">{profile.referralCode}</span></p>
          </div>
          <button
            onClick={() => setCurrency(v => v === 'USD' ? 'NGN' : 'USD')}
            className="text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 px-3 py-2 rounded-xl transition"
          >
            {currency === 'USD' ? 'Show NGN' : 'Show USD'}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Referrals', value: profile.totalReferrals.toString(), color: 'text-blue-400' },
            { label: 'Active Referrals', value: profile.activeReferrals.toString(), color: 'text-green-400' },
            { label: 'Total Earned', value: fmt(profile.totalEarnedUsd), color: 'text-violet-400' },
            { label: 'Available Balance', value: fmt(availableBalance), color: 'text-amber-400' },
          ].map(stat => (
            <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tier indicator */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className={`text-sm font-bold px-3 py-1 rounded-full ${TIER_COLORS[tier]}`}>{tier}</span>
              <span className="text-white font-semibold">
                {tier === 'L4' ? 'Level 4 — Maximum tier!' :
                 tier === 'L3' ? 'Level 3 — Almost to max!' :
                 tier === 'L2' ? 'Level 2 — Growing!' :
                 'Level 1 — Getting started'}
              </span>
            </div>
            {tier !== 'L4' && (
              <span className="text-xs text-gray-500">{profile.activeReferrals} / {nextThreshold} active users</span>
            )}
          </div>
          {tier !== 'L4' && (
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div
                className="bg-violet-600 h-2 rounded-full transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          )}
        </div>

        {/* Referral link */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-6">
          <p className="text-sm font-semibold text-white mb-3">Your Referral Link</p>
          <div className="flex gap-2">
            <input
              readOnly
              value={referralLink}
              className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-gray-300 text-sm font-mono"
            />
            <button
              onClick={copyLink}
              className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition shrink-0"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Commission rate table */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden mb-6">
          <div className="px-5 py-4 border-b border-gray-800">
            <p className="text-sm font-semibold text-white">Your Commission Rates ({tier})</p>
            <p className="text-xs text-gray-500 mt-0.5">{isPaidUser ? 'Paid user rates (full)' : 'Free user rates (50% of standard)'}</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-xs text-gray-500">
                <th className="text-left px-5 py-3">Plan</th>
                <th className="text-right px-5 py-3">Price/mo</th>
                <th className="text-right px-5 py-3">Your Rate</th>
                <th className="text-right px-5 py-3">Per Referral/mo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {['starter', 'pro', 'agency'].map(plan => {
                const rate = getCommissionRate(profile.activeReferrals, plan, isPaidUser)
                const earn = PLAN_PRICES[plan] * rate
                return (
                  <tr key={plan}>
                    <td className="px-5 py-3 text-white capitalize font-medium">{plan}</td>
                    <td className="px-5 py-3 text-right text-gray-400 font-mono">${PLAN_PRICES[plan]}</td>
                    <td className="px-5 py-3 text-right text-violet-400 font-bold">{(rate * 100).toFixed(0)}%</td>
                    <td className="px-5 py-3 text-right text-green-400 font-mono">{currency === 'NGN' ? `₦${usdToNgn(earn).toLocaleString()}` : `$${earn.toFixed(2)}`}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Payout section */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-white">Payout Request</p>
              <p className="text-xs text-gray-500 mt-0.5">Available: {fmt(availableBalance)} {pendingPayout > 0 && `· Pending: ${fmt(pendingPayout)}`}</p>
            </div>
            {availableBalance >= 10 && !showPayoutForm && (
              <button
                onClick={() => setShowPayoutForm(true)}
                className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition"
              >
                Request Payout
              </button>
            )}
          </div>

          {availableBalance < 10 && (
            <p className="text-gray-500 text-xs">Minimum payout is $10. Keep referring to unlock your first payout!</p>
          )}

          {payoutMsg && (
            <p className={`text-sm mb-3 ${payoutMsg.includes('submitted') ? 'text-green-400' : 'text-red-400'}`}>{payoutMsg}</p>
          )}

          {showPayoutForm && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Bank Name</label>
                <input value={bankName} onChange={e => setBankName(e.target.value)}
                  placeholder="e.g. OPay, Kuda, GTBank"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Account Number</label>
                <input value={accountNumber} onChange={e => setAccountNumber(e.target.value)}
                  placeholder="10-digit account number"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Account Name</label>
                <input value={accountName} onChange={e => setAccountName(e.target.value)}
                  placeholder="Name on account"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500" />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowPayoutForm(false)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-400 py-2.5 rounded-xl text-sm transition">
                  Cancel
                </button>
                <button onClick={requestPayout} disabled={payoutLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm transition">
                  {payoutLoading ? 'Submitting...' : `Request ${fmt(availableBalance)} Payout`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Commission history */}
        {profile.commissions.length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden mb-6">
            <div className="px-5 py-4 border-b border-gray-800">
              <p className="text-sm font-semibold text-white">Commission History</p>
            </div>
            <div className="divide-y divide-gray-800">
              {profile.commissions.slice(0, 20).map(c => (
                <div key={c.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white capitalize">{c.plan} plan referral</p>
                    <p className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleDateString()} · {(c.percentage * 100).toFixed(0)}% commission</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400 font-mono text-sm">{fmt(c.amountUsd)}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${c.isPaid ? 'bg-green-900/50 text-green-400' : 'bg-yellow-900/50 text-yellow-400'}`}>
                      {c.isPaid ? 'paid' : 'pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payout history */}
        {profile.payouts.length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-800">
              <p className="text-sm font-semibold text-white">Payout History</p>
            </div>
            <div className="divide-y divide-gray-800">
              {profile.payouts.map(p => (
                <div key={p.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white">{fmt(p.amountUsd)} payout</p>
                    <p className="text-xs text-gray-500">{new Date(p.requestedAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    p.status === 'PAID' ? 'bg-green-900/50 text-green-400' :
                    p.status === 'REJECTED' ? 'bg-red-900/50 text-red-400' :
                    'bg-yellow-900/50 text-yellow-400'
                  }`}>
                    {p.status.toLowerCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
