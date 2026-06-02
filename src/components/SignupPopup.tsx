'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'

const DISMISSED_KEY = 'kdp_signup_popup_dismissed'

export default function SignupPopup() {
  const { isLoaded, isSignedIn } = useUser()
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!isLoaded) return
    // Don't show if already signed in
    if (isSignedIn) return
    // Don't show if already dismissed this session
    if (sessionStorage.getItem(DISMISSED_KEY)) return

    // Show after 5 seconds
    const timer = setTimeout(() => setShow(true), 5000)
    return () => clearTimeout(timer)
  }, [isLoaded, isSignedIn])

  function dismiss() {
    sessionStorage.setItem(DISMISSED_KEY, '1')
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={dismiss}
      />

      {/* Modal */}
      <div className="relative bg-gray-900 border border-violet-500/40 rounded-2xl p-8 w-full max-w-md shadow-2xl shadow-violet-900/30 animate-fadeIn">
        {/* Close */}
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-300 text-xl transition"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Icon */}
        <div className="text-center mb-5">
          <div className="w-16 h-16 bg-violet-600/20 border border-violet-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📚</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Generate Your First KDP Cover Free
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            5 free covers · No credit card · KDP-ready PDF · 30 seconds
          </p>
        </div>

        {/* Features */}
        <ul className="space-y-2 mb-6">
          {[
            '✓  All Amazon KDP trim sizes',
            '✓  Correct spine width calculated automatically',
            '✓  300 DPI print-ready PDF export',
            '✓  No design skills needed',
          ].map(f => (
            <li key={f} className="text-sm text-gray-300 flex items-center gap-2">
              {f}
            </li>
          ))}
        </ul>

        {/* CTAs */}
        <Link
          href="/sign-up"
          onClick={dismiss}
          className="block w-full text-center bg-violet-600 hover:bg-violet-700 text-white font-bold py-3.5 rounded-xl transition mb-3"
        >
          🚀 Create Free Account
        </Link>
        <Link
          href="/sign-in"
          onClick={dismiss}
          className="block w-full text-center bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold py-3 rounded-xl transition text-sm"
        >
          Already have an account? Sign in
        </Link>

        <p className="text-center text-gray-600 text-xs mt-4">
          Trusted by self-published authors on Amazon KDP
        </p>
      </div>
    </div>
  )
}
