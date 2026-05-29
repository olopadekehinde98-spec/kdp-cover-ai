'use client'

import { useState } from 'react'

export default function EmailLimitHittersButton({ count }: { count: number }) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')

  async function send() {
    if (!confirm(`Send UPGRADE20 email to ${count} users who hit their free limit?`)) return
    setLoading(true)
    const res = await fetch('/api/admin/email-limit-hitters', { method: 'POST' })
    const data = await res.json()
    setResult(res.ok ? `✓ Sent to ${data.sent} users` : `Error: ${data.error}`)
    setLoading(false)
  }

  return (
    <div className="flex items-center gap-3">
      {result && <span className={`text-sm ${result.startsWith('✓') ? 'text-green-400' : 'text-red-400'}`}>{result}</span>}
      <button
        onClick={send}
        disabled={loading || count === 0}
        className="bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white font-semibold px-4 py-2 rounded-xl text-sm transition"
      >
        {loading ? 'Sending…' : `📧 Email UPGRADE20 → ${count} limit hitters`}
      </button>
    </div>
  )
}
