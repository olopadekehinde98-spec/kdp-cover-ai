'use client'

import { useState } from 'react'

interface RatingModalProps {
  coverId: string
  onClose: () => void
}

export default function RatingModal({ coverId, onClose }: RatingModalProps) {
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
        body: JSON.stringify({ coverId, rating, comment }),
      })
      setSubmitted(true)
    } catch {
      // still show success
      setSubmitted(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        {!submitted ? (
          <>
            <h2 className="text-white font-bold text-lg mb-1">How did we do?</h2>
            <p className="text-gray-400 text-sm mb-5">Rate your cover generation experience</p>

            {/* Stars */}
            <div className="flex gap-2 justify-center mb-5">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  className="text-3xl transition-transform hover:scale-110"
                >
                  <span className={(hovered || rating) >= star ? 'text-amber-400' : 'text-gray-600'}>
                    ★
                  </span>
                </button>
              ))}
            </div>

            {/* Comment */}
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Optional comment..."
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500 resize-none mb-4"
            />

            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-400 font-semibold py-2.5 rounded-xl text-sm transition"
              >
                Skip
              </button>
              <button
                onClick={handleSubmit}
                disabled={!rating || loading}
                className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm transition"
              >
                {loading ? 'Submitting...' : 'Submit Rating'}
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="text-4xl mb-3">🙏</div>
            <h2 className="text-white font-bold text-lg mb-2">Thank you!</h2>
            <p className="text-gray-400 text-sm mb-5">
              Your feedback helps us improve KDP Cover AI.
            </p>
            <a
              href="https://search.google.com/local/writereview?placeid=kdpcoverai"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition mb-3"
            >
              ⭐ Leave us a Google Review
            </a>
            <br />
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-300 text-sm transition"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
