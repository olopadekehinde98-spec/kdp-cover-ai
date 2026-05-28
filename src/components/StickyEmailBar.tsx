'use client'

import { useState, useEffect } from 'react'

export default function StickyEmailBar() {
  const [show, setShow] = useState(false)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle')
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Don't show if popup was already dismissed/submitted
    if (localStorage.getItem('kdp_popup_dismissed')) return
    if (localStorage.getItem('kdp_bar_dismissed')) return

    // Show after scrolling 30% of the page
    function onScroll() {
      const scrolled = window.scrollY / (document.body.scrollHeight - window.innerHeight)
      if (scrolled > 0.25) setShow(true)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function dismiss() {
    localStorage.setItem('kdp_bar_dismissed', '1')
    setDismissed(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')
    try {
      await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source: 'sticky-bar' }),
      })
      setStatus('done')
      localStorage.setItem('kdp_popup_dismissed', '1')
      localStorage.setItem('kdp_bar_dismissed', '1')
      setTimeout(() => setDismissed(true), 2500)
    } catch {
      setStatus('idle')
    }
  }

  if (!show || dismissed) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden">
      {/* The bar */}
      <div className="bg-gray-900 border-t border-violet-700/50 shadow-2xl px-4 py-3">
        {status === 'done' ? (
          <div className="flex items-center justify-center gap-2 py-1">
            <span className="text-green-400 text-sm font-semibold">✅ Check your email to confirm!</span>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-2">
              <p className="text-white text-xs font-semibold">
                📩 Get free KDP cover tips
              </p>
              <button
                onClick={dismiss}
                className="text-gray-500 hover:text-gray-300 text-base leading-none w-6 h-6 flex items-center justify-center"
                aria-label="Dismiss"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500 placeholder-gray-500 min-w-0"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-semibold px-3 py-2 rounded-lg text-sm transition shrink-0"
              >
                {status === 'loading' ? '…' : 'Subscribe'}
              </button>
            </form>
            <p className="text-gray-600 text-[10px] mt-1.5 text-center">
              Free tips & updates · Confirm via email · Unsubscribe anytime
            </p>
          </>
        )}
      </div>
    </div>
  )
}
