'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const MESSAGES = [
  '🔥 3 free covers today — no credit card, no catch',
  '✅ KDP-compliant dimensions auto-calculated every time',
  '⚡ Average generation time: 28 seconds',
  '📚 Every genre supported — thriller, romance, fantasy, self-help & more',
]

export default function AnnounceBanner() {
  const [idx, setIdx] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => {
      setIdx(i => (i + 1) % MESSAGES.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  if (!visible) return null

  return (
    <div className="relative bg-gradient-to-r from-violet-700 via-violet-600 to-pink-600 text-white text-sm py-2.5 px-4 text-center font-medium">
      <span key={idx} className="inline-block animate-fade-in">
        {MESSAGES[idx]}
      </span>
      <Link href="/sign-up" className="ml-3 underline underline-offset-2 font-bold hover:text-violet-200 transition">
        Start free →
      </Link>
      <button
        onClick={() => setVisible(false)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition text-lg leading-none"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  )
}
