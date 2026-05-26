'use client'

import { useState } from 'react'
import RatingModal from './RatingModal'

interface GoogleReviewBannerProps {
  latestCoverId?: string
}

const GOOGLE_REVIEW_URL = process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL ?? 'https://g.page/r/kdpcoverai/review'

export default function GoogleReviewBanner({ latestCoverId }: GoogleReviewBannerProps) {
  const [showModal, setShowModal] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <>
      {showModal && (
        <RatingModal
          coverId={latestCoverId ?? ''}
          googleReviewUrl={GOOGLE_REVIEW_URL}
          onClose={() => { setShowModal(false); setDismissed(true) }}
        />
      )}

      <div className="mx-6 mb-6 bg-gradient-to-r from-amber-900/30 to-yellow-900/20 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">⭐</span>
          <div>
            <p className="text-white font-semibold text-sm">
              Enjoying KDP Cover AI? Leave us a quick review
            </p>
            <p className="text-amber-300/80 text-xs mt-0.5">
              Takes 30 seconds — helps other authors discover us
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setShowModal(true)}
            className="bg-amber-500 hover:bg-amber-600 text-black font-bold px-4 py-2 rounded-xl text-sm transition whitespace-nowrap"
          >
            ⭐ Rate Us
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-gray-500 hover:text-gray-300 text-lg transition px-1"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      </div>
    </>
  )
}
