'use client'

import { useState } from 'react'

interface ReferralData {
  referralCode: string | null
  referralLink: string | null
  referredByCode: string | null
  discountApplied: number
  stats: { referralCount: number; activeReferrals: number }
}

export default function ReferralCard({ data }: { data: ReferralData }) {
  const [copied, setCopied] = useState(false)
  const [codeInput, setCodeInput] = useState('')
  const [applyMsg, setApplyMsg] = useState('')
  const [applying, setApplying] = useState(false)

  function copyLink() {
    if (!data.referralLink) return
    navigator.clipboard.writeText(data.referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function applyCode() {
    if (!codeInput.trim()) return
    setApplying(true)
    setApplyMsg('')
    try {
      const res = await fetch('/api/referral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeInput.trim() }),
      })
      const json = await res.json()
      setApplyMsg(json.message ?? json.error ?? 'Unknown error')
      if (res.ok) {
        setCodeInput('')
        setTimeout(() => window.location.reload(), 1500)
      }
    } catch {
      setApplyMsg('Something went wrong. Try again.')
    } finally {
      setApplying(false)
    }
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xl">🎁</span>
        <h3 className="text-white font-bold text-sm">Referral Program</h3>
      </div>

      {/* Your referral link */}
      {data.referralCode && (
        <div>
          <p className="text-gray-500 text-xs mb-2">Your referral link — share it with authors:</p>
          <div className="flex gap-2">
            <div className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-300 font-mono truncate">
              {data.referralLink}
            </div>
            <button
              onClick={copyLink}
              className="flex-shrink-0 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold px-3 py-2 rounded-xl transition">
              {copied ? '✓ Copied!' : 'Copy'}
            </button>
          </div>
          <p className="text-gray-600 text-xs mt-1.5">
            They get <span className="text-green-400 font-medium">10% off</span> their first month ·
            You earn <span className="text-amber-400 font-medium">10% commission</span> for 1 month
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-800 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-white">{data.stats.referralCount}</p>
          <p className="text-gray-500 text-xs mt-0.5">Total Referred</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-green-400">{data.stats.activeReferrals}</p>
          <p className="text-gray-500 text-xs mt-0.5">Active Subscribers</p>
        </div>
      </div>

      {/* Apply a code (only for free users without a code applied) */}
      {!data.referredByCode ? (
        <div>
          <p className="text-gray-500 text-xs mb-2">Have a referral code? Apply it for 10% off your first month:</p>
          <div className="flex gap-2">
            <input
              value={codeInput}
              onChange={e => setCodeInput(e.target.value.toUpperCase())}
              placeholder="KDP-XXXXXX"
              className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-gray-600 focus:outline-none focus:border-violet-500"
            />
            <button
              onClick={applyCode}
              disabled={applying || !codeInput.trim()}
              className="flex-shrink-0 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-semibold px-3 py-2 rounded-xl transition">
              {applying ? '...' : 'Apply'}
            </button>
          </div>
          {applyMsg && (
            <p className={`text-xs mt-1.5 ${applyMsg.includes('10%') ? 'text-green-400' : 'text-red-400'}`}>
              {applyMsg}
            </p>
          )}
        </div>
      ) : (
        <div className="bg-green-950/30 border border-green-700/30 rounded-xl px-4 py-3 text-xs text-green-300">
          ✓ Referral code <strong>{data.referredByCode}</strong> applied —{' '}
          {data.discountApplied}% off your first month
        </div>
      )}
    </div>
  )
}
