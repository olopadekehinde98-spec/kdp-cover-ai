'use client'

import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

interface Props {
  label?: string
  size?: 'sm' | 'lg'
  variant?: 'amber' | 'violet'
}

export default function AffiliateCTA({
  label = 'Get Your Referral Link Free →',
  size = 'lg',
  variant = 'amber',
}: Props) {
  const { isSignedIn } = useAuth()
  const router = useRouter()

  function handleClick() {
    // Already signed in → go to dashboard where referral link lives
    if (isSignedIn) {
      router.push('/dashboard')
    } else {
      router.push('/sign-up')
    }
  }

  const baseClass = size === 'lg'
    ? 'inline-flex items-center font-bold px-10 py-4 rounded-2xl text-lg transition shadow-lg'
    : 'inline-flex items-center font-semibold px-6 py-3 rounded-xl text-sm transition'

  const colorClass = variant === 'amber'
    ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-900/40'
    : 'bg-violet-600 hover:bg-violet-700 text-white shadow-violet-900/40'

  return (
    <button onClick={handleClick} className={`${baseClass} ${colorClass}`}>
      {isSignedIn ? 'Go to My Affiliate Link →' : label}
    </button>
  )
}
