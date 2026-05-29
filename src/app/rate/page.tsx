'use client'

import { useState } from 'react'
import Link from 'next/link'

const GOOGLE_REVIEW_URL = 'https://www.google.com/search?q=KDP+Cover+AI+kdpcoverai.site+review'

export default function RatePage() {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit() {
    if (!rating) return
    setLoading(true)
    try {
      await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment }),
      })
    } catch {}
    setSubmitted(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {!submitted ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center shadow-2xl">
            <div className="text-5xl mb-4">⭐</div>
            <h1 className="text-white font-bold text-xl mb-1">Rate KDP Cover AI</h1>
            <p className="text-gray-400 text-sm mb-6">How was your experience?</p>

            <div className="flex gap-3 justify-center mb-6">
              {[1,2,3,4,5].map(star => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  className="text-4xl transition-transform hover:scale-125"
                >
                  <span className={(hovered || rating) >= star ? 'text-amber-400' : 'text-gray-700'}>★</span>
                </button>
              ))}
            </div>

            {rating > 0 && (
              <p className="text-sm mb-4 font-semibold" style={{color: rating >= 4 ? '#34d399' : rating === 3 ? '#fbbf24' : '#f87171'}}>
                {rating === 5 ? '🎉 Amazing!' : rating === 4 ? '😊 Great!' : rating === 3 ? '😐 Okay' : rating === 2 ? '😞 Could be better' : '😔 Not good'}
              </p>
            )}

            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Optional comment..."
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500 resize-none mb-4"
            />

            <button
              onClick={handleSubmit}
              disabled={!rating || loading}
              className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white font-bold py-3 rounded-xl transition"
            >
              {loading ? 'Submitting...' : 'Submit Rating'}
            </button>

            <Link href="/dashboard" className="block mt-3 text-gray-600 hover:text-gray-400 text-sm transition">
              ← Back to dashboard
            </Link>
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center shadow-2xl">
            <div className="text-5xl mb-4">🙏</div>
            <h2 className="text-white font-bold text-xl mb-2">Thank you!</h2>
            <p className="text-gray-400 text-sm mb-6">
              Your feedback helps us improve KDP Cover AI for every author.
            </p>
            <a
              href={GOOGLE_REVIEW_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 rounded-xl transition mb-3"
            >
              ⭐ Leave a Google Review
            </a>
            <p className="text-gray-600 text-xs mb-4">Takes 30 seconds · Helps other authors find us</p>
            <Link href="/dashboard" className="block text-gray-500 hover:text-gray-300 text-sm transition">
              ← Back to dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
// cache bust Fri May 29 20:16:37 WCAST 2026
