'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

/**
 * Silently captures ?ref=CODE from the URL and stores it in sessionStorage.
 * Renders nothing. Mount this inside a Suspense boundary on the sign-up page.
 */
export default function RefCapture() {
  const params = useSearchParams()

  useEffect(() => {
    const code = params.get('ref')
    if (code && code.length > 0) {
      sessionStorage.setItem('kdp_ref_code', code.toUpperCase())
    }
  }, [params])

  return null
}
