'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Plan = 'FREE' | 'STARTER' | 'PRO' | 'AGENCY'

interface Props {
  userId: string
  currentPlan: Plan
  currentLimit: number
  isBanned: boolean
}

export default function UserActions({ userId, currentPlan, currentLimit, isBanned }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showLimitInput, setShowLimitInput] = useState(false)
  const [limitVal, setLimitVal] = useState(String(currentLimit))

  async function call(body: object) {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error('Failed')
      router.refresh()
    } catch {
      alert('Action failed')
    } finally {
      setLoading(false)
    }
  }

  const plans: Plan[] = ['FREE', 'STARTER', 'PRO', 'AGENCY']

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Plan selector */}
      <select
        disabled={loading}
        value={currentPlan}
        onChange={e => call({ action: 'setPlan', plan: e.target.value })}
        className="text-xs bg-gray-800 border border-gray-700 text-gray-200 rounded-lg px-2 py-1 cursor-pointer disabled:opacity-50"
      >
        {plans.map(p => <option key={p} value={p}>{p}</option>)}
      </select>

      {/* Gen limit */}
      {showLimitInput ? (
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={limitVal}
            onChange={e => setLimitVal(e.target.value)}
            className="text-xs bg-gray-800 border border-gray-700 text-gray-200 rounded-lg px-2 py-1 w-16"
          />
          <button
            disabled={loading}
            onClick={() => { call({ action: 'setLimit', limit: parseInt(limitVal) }); setShowLimitInput(false) }}
            className="text-xs bg-violet-700 hover:bg-violet-600 text-white rounded-lg px-2 py-1 disabled:opacity-50"
          >
            Set
          </button>
          <button onClick={() => setShowLimitInput(false)} className="text-xs text-gray-500 hover:text-gray-300">✕</button>
        </div>
      ) : (
        <button
          onClick={() => setShowLimitInput(true)}
          className="text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 rounded-lg px-2 py-1"
        >
          Limit: {currentLimit === 999999 ? '∞' : currentLimit}
        </button>
      )}

      {/* Ban / Unban */}
      {isBanned ? (
        <button
          disabled={loading}
          onClick={() => call({ action: 'unban' })}
          className="text-xs bg-green-900/40 hover:bg-green-800/40 text-green-400 border border-green-800 rounded-lg px-2 py-1 disabled:opacity-50"
        >
          Unban
        </button>
      ) : (
        <button
          disabled={loading}
          onClick={() => { if (confirm('Ban this user?')) call({ action: 'ban' }) }}
          className="text-xs bg-red-900/40 hover:bg-red-800/40 text-red-400 border border-red-800 rounded-lg px-2 py-1 disabled:opacity-50"
        >
          Ban
        </button>
      )}
    </div>
  )
}
