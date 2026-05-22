'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface FraudLog {
  id: string
  ipAddress: string
  isBanned: boolean
  userIds: string[]
}

export default function FraudActions({ log }: { log: FraudLog }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function toggleBan() {
    setLoading(true)
    try {
      await fetch('/api/admin/fraud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logId: log.id, action: log.isBanned ? 'unban' : 'ban', userIds: log.userIds }),
      })
      router.refresh()
    } catch {}
    setLoading(false)
  }

  return (
    <button
      onClick={toggleBan}
      disabled={loading}
      className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition disabled:opacity-50 shrink-0 ml-4 ${
        log.isBanned
          ? 'bg-green-900/50 hover:bg-green-800/50 border border-green-700/50 text-green-400'
          : 'bg-red-900/50 hover:bg-red-800/50 border border-red-700/50 text-red-400'
      }`}
    >
      {loading ? '...' : log.isBanned ? 'Unban Users' : 'Ban Users'}
    </button>
  )
}
