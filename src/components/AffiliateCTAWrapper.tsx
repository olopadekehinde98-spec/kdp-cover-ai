'use client'

import dynamic from 'next/dynamic'

interface Props {
  label?: string
  size?: 'sm' | 'lg'
  variant?: 'amber' | 'violet'
}

// ssr: false prevents useAuth() running during prerender (no ClerkProvider in SSR)
const AffiliateCTA = dynamic(() => import('./AffiliateCTA'), {
  ssr: false,
  loading: () => (
    <a
      href="/sign-up"
      className="inline-flex bg-amber-500 hover:bg-amber-400 text-black font-bold px-10 py-4 rounded-2xl text-lg transition shadow-lg shadow-amber-900/40"
    >
      Get Your Referral Link Free →
    </a>
  ),
})

export default function AffiliateCTAWrapper(props: Props) {
  return <AffiliateCTA {...props} />
}
