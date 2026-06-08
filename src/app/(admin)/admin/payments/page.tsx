'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Submission = {
  id: string
  amount: number
  currency: string
  bankUsed: string
  receiptBase64: string
  receiptMime: string
  note: string | null
  detectedPlan: string
  status: string
  planAssigned: string | null
  adminNote: string | null
  createdAt: string
  user: { email: string; name: string | null; plan: string }
}

const PLAN_COLORS: Record<string, string> = {
  FREE: 'text-gray-400 bg-gray-800',
  STARTER: 'text-blue-400 bg-blue-900/30',
  PRO: 'text-violet-400 bg-violet-900/30',
  AGENCY: 'text-amber-400 bg-amber-900/30',
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'text-yellow-400 bg-yellow-900/30',
  APPROVED: 'text-green-400 bg-green-900/30',
  REJECTED: 'text-red-400 bg-red-900/30',
}

export default function AdminPaymentsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Submission | null>(null)
  const [overridePlan, setOverridePlan] = useState('')
  const [adminNote, setAdminNote] = useState('')
  const [acting, setActing] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => { fetchSubmissions() }, [])

  async function fetchSubmissions() {
    setLoading(true)
    const res = await fetch('/api/admin/payments')
    const data = await res.json()
    setSubmissions(data.submissions || [])
    setLoading(false)
  }

  async function handleAction(action: 'approve' | 'reject') {
    if (!selected) return
    setActing(true)
    setMsg('')
    const res = await fetch(`/api/admin/payments/${selected.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, plan: overridePlan || selected.detectedPlan, adminNote }),
    })
    const data = await res.json()
    setMsg(data.message || data.error)
    setActing(false)
    if (res.ok) {
      setSelected(null)
      setOverridePlan('')
      setAdminNote('')
      fetchSubmissions()
    }
  }

  const pending = submissions.filter(s => s.status === 'PENDING').length

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Admin Nav */}
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">A</div>
            <span className="font-semibold text-white text-sm">Admin Panel</span>
          </div>
          <div className="flex gap-4 text-sm flex-wrap">
            <Link href="/admin" className="text-gray-400 hover:text-white">Dashboard</Link>
            <Link href="/admin/users" className="text-gray-400 hover:text-white">Users</Link>
            <Link href="/admin/covers" className="text-gray-400 hover:text-white">Covers</Link>
            <Link href="/admin/financials" className="text-gray-400 hover:text-white">Financials</Link>
            <Link href="/admin/payments" className="text-white font-medium">
              Payments {pending > 0 && <span className="ml-1 bg-yellow-500 text-black text-xs rounded-full px-1.5 py-0.5">{pending}</span>}
            </Link>
            <Link href="/admin/support" className="text-gray-400 hover:text-white">Support</Link>
            <Link href="/admin/fraud" className="text-gray-400 hover:text-white">Fraud</Link>
            <Link href="/admin/affiliates" className="text-gray-400 hover:text-white">Affiliates</Link>
          </div>
        </div>
        <Link href="/dashboard" className="text-xs text-gray-500 hover:text-gray-300">← Back to app</Link>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Payment Submissions</h1>
            <p className="text-gray-400 text-sm mt-1">Manual bank transfer receipts — approve to upgrade user plan</p>
          </div>
          <div className="flex gap-3">
            <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-xl px-4 py-2 text-center">
              <div className="text-yellow-400 font-bold text-xl">{pending}</div>
              <div className="text-yellow-300 text-xs">Pending</div>
            </div>
            <div className="bg-green-900/30 border border-green-700/50 rounded-xl px-4 py-2 text-center">
              <div className="text-green-400 font-bold text-xl">{submissions.filter(s => s.status === 'APPROVED').length}</div>
              <div className="text-green-300 text-xs">Approved</div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-20">Loading submissions...</div>
        ) : submissions.length === 0 ? (
          <div className="text-center text-gray-500 py-20">
            <div className="text-5xl mb-4">📭</div>
            <p>No payment submissions yet.</p>
            <p className="text-sm mt-2">When users submit payment proof, they'll appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map(sub => (
              <div
                key={sub.id}
                className="bg-gray-900 border border-gray-700 rounded-xl p-5 flex items-center justify-between gap-4 hover:border-gray-500 transition"
              >
                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-medium text-sm truncate">{sub.user.email}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${PLAN_COLORS[sub.user.plan] || 'text-gray-400 bg-gray-800'}`}>
                      {sub.user.plan}
                    </span>
                  </div>
                  <div className="text-gray-400 text-xs">{sub.user.name || 'No name'}</div>
                </div>

                {/* Payment Info */}
                <div className="text-center">
                  <div className="text-white font-bold text-lg">
                    {sub.currency === 'USD' ? '$' : '₦'}{sub.amount.toLocaleString()}
                  </div>
                  <div className="text-gray-400 text-xs">{sub.bankUsed}</div>
                </div>

                {/* Detected Plan */}
                <div className="text-center">
                  <div className="text-xs text-gray-400 mb-1">Detected Plan</div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${PLAN_COLORS[sub.detectedPlan] || 'text-gray-400 bg-gray-800'}`}>
                    {sub.detectedPlan}
                  </span>
                </div>

                {/* Status */}
                <div className="text-center">
                  <span className={`text-xs font-medium px-3 py-1 rounded-full ${STATUS_COLORS[sub.status]}`}>
                    {sub.status}
                  </span>
                  {sub.planAssigned && (
                    <div className="text-green-400 text-xs mt-1">→ {sub.planAssigned}</div>
                  )}
                </div>

                {/* Date */}
                <div className="text-gray-500 text-xs text-right">
                  {new Date(sub.createdAt).toLocaleDateString()}<br />
                  {new Date(sub.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>

                {/* Action */}
                <button
                  onClick={() => { setSelected(sub); setOverridePlan(sub.detectedPlan); setAdminNote(''); setMsg('') }}
                  className="bg-gray-800 hover:bg-gray-700 text-white text-xs px-4 py-2 rounded-lg transition whitespace-nowrap"
                >
                  {sub.status === 'PENDING' ? '👁 Review' : '🔍 View'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-white font-bold text-lg">Review Payment</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white text-xl">✕</button>
            </div>

            <div className="p-6 space-y-5">
              {/* User */}
              <div className="bg-gray-800 rounded-xl p-4">
                <div className="text-xs text-gray-400 mb-1">User</div>
                <div className="text-white font-medium">{selected.user.email}</div>
                <div className="text-gray-400 text-sm">Current plan: <span className="text-white">{selected.user.plan}</span></div>
              </div>

              {/* Payment Details */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-800 rounded-xl p-4">
                  <div className="text-xs text-gray-400 mb-1">Amount Paid</div>
                  <div className="text-white font-bold text-xl">
                    {selected.currency === 'USD' ? '$' : '₦'}{selected.amount.toLocaleString()}
                  </div>
                </div>
                <div className="bg-gray-800 rounded-xl p-4">
                  <div className="text-xs text-gray-400 mb-1">Bank Used</div>
                  <div className="text-white text-sm">{selected.bankUsed}</div>
                </div>
              </div>

              {/* Receipt Image */}
              <div>
                <div className="text-xs text-gray-400 mb-2">Receipt / Screenshot</div>
                <img
                  src={`data:${selected.receiptMime};base64,${selected.receiptBase64}`}
                  alt="Payment receipt"
                  className="w-full rounded-xl border border-gray-700 max-h-80 object-contain bg-gray-800"
                />
              </div>

              {/* User Note */}
              {selected.note && (
                <div className="bg-gray-800 rounded-xl p-4">
                  <div className="text-xs text-gray-400 mb-1">User Note</div>
                  <div className="text-gray-300 text-sm">{selected.note}</div>
                </div>
              )}

              {selected.status === 'PENDING' && (
                <>
                  {/* Plan Override */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Plan to Grant <span className="text-gray-500">(auto-detected: {selected.detectedPlan})</span>
                    </label>
                    <select
                      value={overridePlan}
                      onChange={e => setOverridePlan(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500"
                    >
                      <option value="STARTER">STARTER — 20 generations</option>
                      <option value="PRO">PRO — Unlimited</option>
                      <option value="AGENCY">AGENCY — Unlimited + White-label</option>
                    </select>
                  </div>

                  {/* Admin Note */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Admin Note (optional)</label>
                    <textarea
                      value={adminNote}
                      onChange={e => setAdminNote(e.target.value)}
                      rows={2}
                      placeholder="Internal note about this approval/rejection..."
                      className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500 resize-none"
                    />
                  </div>

                  {msg && (
                    <div className="bg-green-900/30 border border-green-700/50 rounded-xl p-3 text-green-400 text-sm">{msg}</div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAction('approve')}
                      disabled={acting}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition"
                    >
                      {acting ? 'Processing...' : '✅ Approve & Upgrade Plan'}
                    </button>
                    <button
                      onClick={() => handleAction('reject')}
                      disabled={acting}
                      className="flex-1 bg-red-900/50 hover:bg-red-800 disabled:opacity-50 text-red-400 hover:text-white py-3 rounded-xl font-semibold border border-red-700/50 transition"
                    >
                      ❌ Reject
                    </button>
                  </div>
                </>
              )}

              {selected.status !== 'PENDING' && (
                <div className={`rounded-xl p-4 text-sm ${selected.status === 'APPROVED' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                  <span className="font-bold">{selected.status}</span>
                  {selected.planAssigned && <span> — Plan granted: {selected.planAssigned}</span>}
                  {selected.adminNote && <div className="mt-1 text-xs opacity-80">{selected.adminNote}</div>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
