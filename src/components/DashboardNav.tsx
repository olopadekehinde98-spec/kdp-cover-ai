'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { UserButton } from '@clerk/nextjs'

interface Props {
  plan: string
  email: string
  firstName: string | null
}

export default function DashboardNav({ plan, email, firstName }: Props) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const planColor =
    plan === 'PRO'     ? 'bg-violet-900/60 text-violet-300' :
    plan === 'AGENCY'  ? 'bg-amber-900/60 text-amber-300'  :
    plan === 'STARTER' ? 'bg-blue-900/60 text-blue-300'    :
    'bg-gray-800 text-gray-400'

  const links = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/generate',  label: '✨ Generate' },
    { href: '/history',   label: 'My Covers' },
    { href: '/pricing',   label: 'Pricing' },
    { href: '/help',      label: 'Help' },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center font-black text-sm text-white">K</div>
          <span className="font-bold text-white hidden sm:block">KDP Cover AI</span>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition
                ${pathname === l.href
                  ? 'bg-violet-900/40 text-violet-300'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Plan badge */}
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full hidden sm:block ${planColor}`}>
            {plan}
          </span>

          {/* Upgrade button for free users */}
          {plan === 'FREE' && (
            <Link
              href="/pricing"
              className="hidden sm:flex items-center bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
            >
              Upgrade ↑
            </Link>
          )}

          {/* Clerk user button (avatar + sign out) */}
          <UserButton />

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 text-gray-400 hover:text-white"
            aria-label="Menu"
          >
            {open ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-800 bg-gray-950 px-6 py-4 space-y-1">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition
                ${pathname === l.href
                  ? 'bg-violet-900/40 text-violet-300'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
            >
              {l.label}
            </Link>
          ))}
          <div className="border-t border-gray-800 pt-3 mt-3 space-y-1">
            <Link href="/affiliate" onClick={() => setOpen(false)} className="block px-4 py-2.5 rounded-xl text-sm text-gray-500 hover:text-white hover:bg-gray-800 transition">💰 Affiliates</Link>
            <Link href="/privacy"   onClick={() => setOpen(false)} className="block px-4 py-2.5 rounded-xl text-sm text-gray-500 hover:text-white hover:bg-gray-800 transition">Privacy Policy</Link>
            <Link href="/terms"     onClick={() => setOpen(false)} className="block px-4 py-2.5 rounded-xl text-sm text-gray-500 hover:text-white hover:bg-gray-800 transition">Terms of Service</Link>
          </div>
          {plan === 'FREE' && (
            <Link href="/pricing" onClick={() => setOpen(false)}
              className="block mt-2 text-center bg-violet-600 hover:bg-violet-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition">
              Upgrade to Pro ↑
            </Link>
          )}
        </div>
      )}
    </header>
  )
}
