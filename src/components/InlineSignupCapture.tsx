'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function InlineSignupCapture() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    try {
      await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source: 'homepage-inline' }),
      })
      setSubmitted(true)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-3">📬</div>
        <p className="text-white font-semibold text-lg mb-1">Check your inbox!</p>
        <p className="text-gray-400 text-sm">Confirm your email to get KDP tips + early access to new features.</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="inline-flex items-center gap-2 bg-violet-950/60 border border-violet-700/40 text-violet-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
        📩 Free KDP Tips — No Spam
      </div>
      <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
        Not ready to generate yet?
      </h3>
      <p className="text-gray-400 mb-6 text-sm leading-relaxed">
        Get weekly KDP cover tips, genre trends, and be first to know about new AI styles.
        Unsubscribe any time.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="flex-1 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-semibold px-5 py-3 rounded-xl text-sm transition whitespace-nowrap"
        >
          {loading ? 'Sending…' : 'Send Me Tips →'}
        </button>
      </form>
      <p className="text-gray-600 text-xs mt-3">
        By subscribing you confirm you are 16+ and agree to receive emails from KDP Cover AI.
        {' '}<Link href="/privacy" className="underline hover:text-gray-400">Privacy policy</Link>.
      </p>
    </div>
  )
}
