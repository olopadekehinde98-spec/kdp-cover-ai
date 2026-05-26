'use client'

import { useState } from 'react'

export default function BillingPortalButton() {
  const [loading, setLoading] = useState(false)
  const [info, setInfo] = useState<string | null>(null)

  async function handleClick() {
    setLoading(true)
    setInfo(null)
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else if (data.error) {
        // Show as info message (not alert) — covers manually-granted plans
        setInfo(data.error)
      }
    } catch {
      setInfo('Something went wrong. Please try again or contact support@kdpcoverai.com')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <button
        onClick={handleClick}
        disabled={loading}
        className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-600 transition group w-full text-left"
      >
        <div className="text-2xl mb-2">💳</div>
        <p className="text-sm font-semibold text-white group-hover:text-violet-300 transition">
          {loading ? 'Opening...' : 'Manage Billing'}
        </p>
        <p className="text-xs text-gray-500 mt-1">Invoices, cancel, or change plan</p>
      </button>
      {info && (
        <p className="mt-2 text-xs text-amber-400 bg-amber-950/40 border border-amber-800/40 rounded-xl px-4 py-2">
          {info}
        </p>
      )}
    </div>
  )
}
