'use client'

import { useEffect } from 'react'

/**
 * On first render (after sign-up redirect), checks sessionStorage for a
 * pending referral code and silently applies it via POST /api/referral.
 * Clears the stored code regardless of success to avoid repeated calls.
 */
export default function RefApply() {
  useEffect(() => {
    const code = sessionStorage.getItem('kdp_ref_code')
    if (!code) return

    // Clear immediately so we only try once, even on error
    sessionStorage.removeItem('kdp_ref_code')

    fetch('/api/referral', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    }).catch(() => {
      // Silent failure — referral is optional, don't break the dashboard
    })
  }, [])

  return null
}
