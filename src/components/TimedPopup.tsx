'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function TimedPopup() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem('timed-popup-shown')) return
    const t = setTimeout(() => {
      setShow(true)
      sessionStorage.setItem('timed-popup-shown', '1')
    }, 30000)
    return () => clearTimeout(t)
  }, [])

  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="bg-gray-900 border border-violet-700/60 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative">
        <button onClick={() => setShow(false)} className="absolute top-3 right-4 text-gray-600 hover:text-gray-300 text-lg">✕</button>
        <div className="text-3xl mb-2">📚</div>
        <h3 className="text-white font-bold text-lg mb-1">Your free cover is waiting</h3>
        <p className="text-gray-400 text-sm mb-4">3 free professional KDP covers. No credit card. Takes 30 seconds.</p>
        <Link
          href="/sign-up"
          onClick={() => setShow(false)}
          className="block w-full text-center bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 rounded-xl transition mb-2"
        >
          Create My Free Cover →
        </Link>
        <button onClick={() => setShow(false)} className="block w-full text-center text-xs text-gray-600 hover:text-gray-400">
          Not now
        </button>
      </div>
    </div>
  )
}
