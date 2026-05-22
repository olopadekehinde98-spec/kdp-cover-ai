'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type AffiliatePayout = {
  id: string
  amountUsd: number
  amountNgn: number
  status: string
  requestedAt: string
  paidAt: string | null
  adminNote: string | null
}

type AffiliateProfile = {
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
  user: { email: string; name: string | null; plan: string }
  commissions: Array<{ amountUsd: number; isPaid: boolean }>
  payouts: AffiliatePayout[]
}

export default function AdminAffiliatesPage() {
  const [profiles, setProfiles] = useState<AffiliateProfile[]>([])
  const [totalOwed, setTotalOwed] = useState(0)
  const [totalPaid, setTotalPaid] = useState(0)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [adminNote, setAdminNote] = useState('')

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/affiliates')
      const data = await res.json()
      setProfiles(data.profiles || [])
      setTotalOwed(data.totalOwed || 0)
      setTotalPaid(data.totalPaid || 0)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handlePayoutAction(profileId: string, payoutId: string, action: 'approve-payout' | 'reject-payout') {
    setActionLoading(payoutId)
    try {
      await fetch(`/api/admin/affiliates/${profileId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, payoutId, adminNote }),
      })
      await load()
      setAdminNote('')
    } catch {}
    setActionLoading(null)
  }

  const pendingPayouts = profiles.flatMap(p =>
    p.payouts.filter(po => po.status === 'PENDING').map(po => ({ ...po, profile: p }))
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link href="/admin" className="text-gray-500 hover:text-gray-300 text-sm">← Admin</Link>
        <h1 className="text-white font-bold">Affiliate Management</h1>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <p className="text-xs text-gray-500 mb-1">Total Affiliates</p>
            <p className="text-2xl font-bold text-white">{profiles.length}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <p className="text-xs text-gray-500 mb-1">Total Owed</p>
            <p className="text-2xl font-bold text-amber-400">${totalOwed.toFixed(2)}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <p className="text-xs text-gray-500 mb-1">Total Paid Out</p>
            <p className="text-2xl font-bold text-green-400">${totalPaid.toFixed(2)}</p>
          </div>
        </div>

        {/* Pending payouts */}
        {pendingPayouts.length > 0 && (
          <div className="bg-amber-950/20 border border-amber-700/40 rounded-2xl overflow-hidden mb-8">
            <div className="px-5 py-4 border-b border-amber-800/40">
              <h2 className="text-sm font-semibold text-amber-300">Pending Payout Requests ({pendingPayouts.length})</h2>
            </div>
            <div className="divide-y divide-amber-900/30">
              {pendingPayouts.map(po => (
                <div key={po.id} className="px-5 py-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-white font-medium">{po.profile.user.email}</p>
                      <p className="text-xs text-gray-400">
                        Bank: {po.profile.bankName} · Account: {po.profile.accountNumber} · Name: {po.profile.accountName}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Requested: {new Date(po.requestedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-amber-300 font-bold font-mono">${po.amountUsd.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">₦{po.amountNgn.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <input
                      value={adminNote}
                      onChange={e => setAdminNote(e.target.value)}
                      placeholder="Admin note (optional)"
                      className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-violet-500"
                    />
                    <button
                      onClick={() => handlePayoutAction(po.profile.id, po.id, 'approve-payout')}
                      disabled={actionLoading === po.id}
                      className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                    >
                      {actionLoading === po.id ? '...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handlePayoutAction(po.profile.id, po.id, 'reject-payout')}
                      disabled={actionLoading === po.id}
                      className="bg-red-900/50 hover:bg-red-800/50 border border-red-700/50 disabled:opacity-50 text-red-300 text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All affiliates */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-800">
            <h2 className="text-sm font-semibold text-white">All Affiliates</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-xs text-gray-500">
                <th className="text-left px-5 py-3">Email</th>
                <th className="text-left px-5 py-3">Code</th>
                <th className="text-right px-5 py-3">Referrals</th>
                <th className="text-right px-5 py-3">Active</th>
                <th className="text-right px-5 py-3">Earned</th>
                <th className="text-right px-5 py-3">Paid Out</th>
                <th className="text-left px-5 py-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {profiles.map(p => {
                const unpaid = p.commissions.filter(c => !c.isPaid).reduce((s, c) => s + c.amountUsd, 0)
                return (
                  <tr key={p.id} className="hover:bg-gray-800/30">
                    <td className="px-5 py-3 text-white">{p.user.email}</td>
                    <td className="px-5 py-3 text-violet-400 font-mono text-xs">{p.referralCode}</td>
                    <td className="px-5 py-3 text-right text-gray-300">{p.totalReferrals}</td>
                    <td className="px-5 py-3 text-right text-green-400">{p.activeReferrals}</td>
                    <td className="px-5 py-3 text-right text-amber-400 font-mono">${p.totalEarnedUsd.toFixed(2)}</td>
                    <td className="px-5 py-3 text-right text-green-400 font-mono">${p.totalPaidUsd.toFixed(2)}</td>
                    <td className="px-5 py-3 text-gray-500 text-xs">{new Date(p.joinedAt).toLocaleDateString()}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {profiles.length === 0 && (
            <div className="px-5 py-8 text-center text-gray-500 text-sm">No affiliates yet.</div>
          )}
        </div>
      </div>
    </div>
  )
}
