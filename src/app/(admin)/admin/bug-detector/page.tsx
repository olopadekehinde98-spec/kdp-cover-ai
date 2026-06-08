'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface PatternGroup {
  route: string
  sample: string
  count: number
  affectedUsers: number
  fixed: boolean
}

interface AnalysisResponse {
  windowDays: number
  totalErrorEvents: number
  uniquePatterns: number
  topPatterns: PatternGroup[]
  aiSummary: string | null
  aiAvailable: boolean
}

export default function BugDetectorPage() {
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Apology bonus controls
  const [audience, setAudience] = useState<'failed' | 'all'>('failed')
  const [bonusCount, setBonusCount] = useState(6)
  const [preview, setPreview] = useState<number | null>(null)
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState<string | null>(null)

  const loadAnalysis = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/bug-analysis')
      if (!res.ok) throw new Error(`Request failed (${res.status})`)
      const data = await res.json() as AnalysisResponse
      setAnalysis(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load analysis')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadAnalysis() }, [loadAnalysis])

  async function runDryRun() {
    setPreview(null)
    setSendResult(null)
    const res = await fetch('/api/admin/apology-bonus', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audience, bonusCount, dryRun: true }),
    })
    if (res.ok) {
      const data = await res.json() as { recipientCount: number }
      setPreview(data.recipientCount)
    }
  }

  async function sendApologyEmails() {
    if (!confirm(`Send apology emails + ${bonusCount} bonus generations to ${audience === 'failed' ? 'users who had a failed generation' : 'ALL current users'}? This cannot be undone.`)) return
    setSending(true)
    setSendResult(null)
    try {
      const res = await fetch('/api/admin/apology-bonus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audience, bonusCount }),
      })
      const data = await res.json() as { sent: number; failed: number; totalRecipients: number }
      if (res.ok) {
        setSendResult(`✅ Sent ${data.sent}/${data.totalRecipients} emails (${data.failed} failed). Each recipient got +${bonusCount} generations.`)
        setPreview(null)
      } else {
        setSendResult('❌ Failed to send. Check server logs.')
      }
    } catch {
      setSendResult('❌ Network error while sending.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950">
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
            <Link href="/admin/payments" className="text-gray-400 hover:text-white">Payments</Link>
            <Link href="/admin/support" className="text-gray-400 hover:text-white">Support</Link>
            <Link href="/admin/fraud" className="text-gray-400 hover:text-white">Fraud</Link>
            <Link href="/admin/affiliates" className="text-gray-400 hover:text-white">Affiliates</Link>
            <Link href="/admin/analytics" className="text-gray-400 hover:text-white">📊 Analytics</Link>
            <Link href="/admin/discounts" className="text-gray-400 hover:text-white">🎟️ Discounts</Link>
            <Link href="/admin/non-subscribers" className="text-gray-400 hover:text-white">👥 Non-Subscribers</Link>
            <Link href="/admin/bug-detector" className="text-violet-400 font-medium">🐛 Bug Detector</Link>
          </div>
        </div>
        <Link href="/dashboard" className="text-xs text-gray-500 hover:text-gray-300">← Back to app</Link>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-white">🐛 AI Bug Detector</h1>
          <button
            onClick={loadAnalysis}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm text-gray-200 disabled:opacity-50"
          >
            {loading ? 'Analyzing…' : '🔄 Re-run analysis'}
          </button>
        </div>
        <p className="text-gray-400 text-sm mb-8">
          Scans error logs and failed generations from the last 30 days, groups them into recurring patterns, and (if an OpenAI key is configured) asks AI to diagnose likely root causes and unresolved routes.
        </p>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-950 border border-red-800 text-red-300 text-sm">{error}</div>
        )}

        {analysis && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <StatCard label="Error events (30d)" value={analysis.totalErrorEvents} color="red" />
              <StatCard label="Unique patterns" value={analysis.uniquePatterns} color="amber" />
              <StatCard label="Window" value={`${analysis.windowDays} days`} color="gray" />
            </div>

            {/* AI Summary */}
            <div className="mb-8 p-6 rounded-xl bg-gradient-to-br from-violet-950/40 to-gray-900 border border-violet-800/40">
              <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">🤖 AI Diagnosis</h2>
              {analysis.aiSummary ? (
                <pre className="whitespace-pre-wrap text-sm text-gray-200 font-sans leading-relaxed">{analysis.aiSummary}</pre>
              ) : analysis.aiAvailable ? (
                <p className="text-gray-400 text-sm">No recurring error patterns found in the last 30 days — looking healthy! 🎉</p>
              ) : (
                <p className="text-gray-400 text-sm">AI analysis unavailable — <code className="text-gray-300">OPENAI_API_KEY</code> is not configured. Showing raw error patterns below.</p>
              )}
            </div>

            {/* Pattern table */}
            <div className="mb-10">
              <h2 className="text-lg font-semibold text-white mb-3">Top recurring error patterns</h2>
              {analysis.topPatterns.length === 0 ? (
                <p className="text-gray-500 text-sm">No errors logged in the last 30 days. 🎉</p>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-800">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-900 text-gray-400 text-left">
                        <th className="px-4 py-3 font-medium">Route</th>
                        <th className="px-4 py-3 font-medium">Sample message</th>
                        <th className="px-4 py-3 font-medium text-right">Occurrences</th>
                        <th className="px-4 py-3 font-medium text-right">Users affected</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.topPatterns.map((p, i) => (
                        <tr key={i} className="border-t border-gray-800 text-gray-200">
                          <td className="px-4 py-3 font-mono text-xs text-violet-300">{p.route}</td>
                          <td className="px-4 py-3 text-gray-400 text-xs max-w-md truncate" title={p.sample}>{p.sample}</td>
                          <td className="px-4 py-3 text-right">{p.count}</td>
                          <td className="px-4 py-3 text-right">{p.affectedUsers}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* Apology Bonus controls */}
        <div className="mb-10 p-6 rounded-xl bg-gray-900 border border-gray-800">
          <h2 className="text-lg font-semibold text-white mb-1">📧 Send apology + bonus generations</h2>
          <p className="text-gray-400 text-sm mb-5">
            Email an apology and automatically grant extra free generations. Choose who receives it — only users whose generation failed, or every current user.
          </p>

          <div className="flex flex-wrap items-end gap-4 mb-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Audience</label>
              <select
                value={audience}
                onChange={e => { setAudience(e.target.value as 'failed' | 'all'); setPreview(null); setSendResult(null) }}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
              >
                <option value="failed">Users with a failed generation</option>
                <option value="all">All current users</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Bonus generations</label>
              <input
                type="number"
                min={1}
                max={50}
                value={bonusCount}
                onChange={e => { setBonusCount(Number(e.target.value) || 1); setPreview(null); setSendResult(null) }}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white w-28"
              />
            </div>
            <button
              onClick={runDryRun}
              className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm text-gray-200 border border-gray-700"
            >
              👀 Preview recipient count
            </button>
            <button
              onClick={sendApologyEmails}
              disabled={sending}
              className="px-5 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-sm text-white font-medium disabled:opacity-50"
            >
              {sending ? 'Sending…' : '✉️ Send apology emails now'}
            </button>
          </div>

          {preview !== null && (
            <p className="text-sm text-amber-300 mb-2">📋 This will email <strong>{preview}</strong> recipient{preview === 1 ? '' : 's'} and grant +{bonusCount} generations each.</p>
          )}
          {sendResult && (
            <p className="text-sm text-gray-200">{sendResult}</p>
          )}
        </div>

        {/* Export */}
        <div className="mb-16 p-6 rounded-xl bg-gray-900 border border-gray-800">
          <h2 className="text-lg font-semibold text-white mb-1">⬇️ Export users</h2>
          <p className="text-gray-400 text-sm mb-5">
            Download a CSV of users — including their plan, generation usage, and the most recent error/failure they ran into — so you can see exactly what people are facing.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="/api/admin/export-users?mode=all"
              className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm text-gray-200 border border-gray-700"
            >
              📄 Download all users (CSV)
            </a>
            <a
              href="/api/admin/export-users?mode=issues"
              className="px-4 py-2 rounded-lg bg-amber-900/40 hover:bg-amber-900/60 text-sm text-amber-200 border border-amber-800/50"
            >
              ⚠️ Download users with issues only (CSV)
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: 'red' | 'amber' | 'gray' }) {
  const colors = {
    red:   'border-red-800/40 bg-red-950/30 text-red-300',
    amber: 'border-amber-800/40 bg-amber-950/30 text-amber-300',
    gray:  'border-gray-800 bg-gray-900 text-gray-300',
  }
  return (
    <div className={`p-4 rounded-xl border ${colors[color]}`}>
      <p className="text-xs uppercase tracking-wide opacity-70 mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  )
}
