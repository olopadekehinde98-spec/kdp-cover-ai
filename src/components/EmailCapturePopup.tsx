'use client'
import { useState, useEffect } from 'react'

export default function EmailCapturePopup() {
  const [show, setShow]       = useState(false)
  const [email, setEmail]     = useState('')
  const [status, setStatus]   = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    // Don't show if already interacted with
    const dismissed = localStorage.getItem('kdp_popup_dismissed')
    if (dismissed) return

    // Show after 8 seconds on page
    const t = setTimeout(() => setShow(true), 8000)
    return () => clearTimeout(t)
  }, [])

  function dismiss() {
    localStorage.setItem('kdp_popup_dismissed', '1')
    setShow(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source: 'homepage-popup' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Something went wrong')
      setStatus('done')
      setMessage(data?.alreadySubscribed ? "You're already subscribed! 🎉" : 'Check your email to confirm. 📬')
      localStorage.setItem('kdp_popup_dismissed', '1')
      setTimeout(() => setShow(false), 3000)
    } catch (err: any) {
      setStatus('error')
      setMessage(err.message)
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-0">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={dismiss}
      />

      {/* Card */}
      <div className="relative bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-md mx-auto p-6 sm:p-8 z-10">
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-300 text-lg leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-800 transition"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="text-center mb-5">
          <div className="text-4xl mb-3">📚</div>
          <h2 className="text-xl font-bold text-white mb-2">
            Get Free KDP Cover Tips
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Join <strong className="text-gray-200">authors using KDP Cover AI</strong> — get new feature updates, KDP formatting tips, and exclusive tricks straight to your inbox. No spam, ever.
          </p>
        </div>

        {status === 'done' ? (
          <div className="text-center py-4">
            <div className="text-3xl mb-2">✅</div>
            <p className="text-green-400 font-semibold">{message}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Your email address"
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500 placeholder-gray-500"
            />
            {status === 'error' && (
              <p className="text-red-400 text-xs">{message}</p>
            )}
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2"
            >
              {status === 'loading'
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Subscribing...</>
                : '✉️ Get Free Tips & Updates'}
            </button>
            <p className="text-xs text-gray-600 text-center">
              We'll send a confirmation email first. Unsubscribe anytime.
            </p>
          </form>
        )}

        <div className="mt-5 pt-4 border-t border-gray-800 grid grid-cols-3 gap-3 text-center">
          {[
            { icon: '🎨', label: 'Cover styles' },
            { icon: '📐', label: 'KDP tips' },
            { icon: '✨', label: 'New features' },
          ].map(item => (
            <div key={item.label} className="text-xs text-gray-500">
              <div className="text-lg mb-1">{item.icon}</div>
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
