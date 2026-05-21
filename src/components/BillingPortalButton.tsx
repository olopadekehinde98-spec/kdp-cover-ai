'use client'

import { useState } from 'react'

export default function BillingPortalButton() {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error ?? 'Could not open billing portal. Please try again.')
      }
    } catch {
      alert('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
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
  )
}
