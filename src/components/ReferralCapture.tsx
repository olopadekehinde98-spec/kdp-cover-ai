'use client'

/**
 * ReferralCapture — runs on EVERY page.
 *
 * On landing:  reads ?ref=CODE from URL → saves to localStorage
 * On dashboard: reads saved code → auto-applies to logged-in user via POST /api/referral
 */

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export default function ReferralCapture({ applyOnLoad = false }: { applyOnLoad?: boolean }) {
  const searchParams = useSearchParams()

  // Step 1 — Capture from URL (runs on any page)
  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref && ref.length >= 3) {
      localStorage.setItem('kdp_pending_ref', ref.toUpperCase())
    }
  }, [searchParams])

  // Step 2 — Auto-apply stored code once user is signed in (applyOnLoad=true on dashboard)
  useEffect(() => {
    if (!applyOnLoad) return
    const stored = localStorage.getItem('kdp_pending_ref')
    if (!stored) return

    fetch('/api/referral', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: stored }),
    })
      .then(async (res) => {
        if (res.ok || res.status === 400) {
          // 400 = "already applied" or "own code" — still clear storage
          localStorage.removeItem('kdp_pending_ref')
        }
      })
      .catch(() => {
        // silently fail — will retry next page load
      })
  }, [applyOnLoad])

  return null
}
