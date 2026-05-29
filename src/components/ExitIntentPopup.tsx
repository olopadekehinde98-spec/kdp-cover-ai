'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function ExitIntentPopup() {
  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem('exit-popup-shown')) return

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 10 && !dismissed) {
        setShow(true)
        sessionStorage.setItem('exit-popup-shown', '1')
      }
    }

    document.addEventListener('mouseleave', handleMouseLeave)
    return () => document.removeEventListener('mouseleave', handleMouseLeave)
  }, [dismissed])

  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
      <div className="bg-gray-900 border border-violet-700/60 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl shadow-violet-900/30 relative">
        <button
          onClick={() => { setShow(false); setDismissed(true) }}
          className="absolute top-3 right-4 text-gray-600 hover:text-gray-300 text-xl"
        >✕</button>

        <div className="text-5xl mb-3">🎁</div>
        <h2 className="text-2xl font-black text-white mb-2">Wait — get 20% off!</h2>
        <p className="text-gray-400 text-sm mb-5">
          Before you go — use code <span className="text-violet-400 font-bold font-mono">STAY20</span> for 20% off any plan. Limited time.
        </p>

        <div className="bg-gray-800 border border-violet-700/40 rounded-xl px-5 py-3 mb-5 flex items-center justify-between">
          <span className="font-mono text-white text-lg font-bold tracking-widest">STAY20</span>
          <button
            onClick={() => navigator.clipboard?.writeText('STAY20')}
            className="text-xs text-violet-400 hover:text-violet-300"
          >Copy</button>
        </div>

        <Link
          href="/pricing"
          onClick={() => setShow(false)}
          className="block w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 rounded-xl transition mb-3"
        >
          Claim My 20% Discount →
        </Link>
        <button
          onClick={() => { setShow(false); setDismissed(true) }}
          className="text-xs text-gray-600 hover:text-gray-400"
        >
          No thanks, I&apos;ll pay full price
        </button>
      </div>
    </div>
  )
}
