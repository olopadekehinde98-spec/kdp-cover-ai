'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const NAV_LINKS = [
  { href: '/pricing',   label: 'Pricing' },
  { href: '/affiliate', label: 'Affiliates' },
  { href: '/help',      label: 'Help' },
  { href: '/about',     label: 'About' },
]

export default function SiteHeader() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="border-b border-gray-900 bg-gray-950/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <img src="/logo.svg" alt="KDP Cover AI" className="h-10 w-auto" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition ${
                pathname === link.href
                  ? 'text-white font-medium'
                  : 'text-gray-400 hover:text-white'
              }`}>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3 text-sm">
          <Link href="/sign-in" className="text-gray-400 hover:text-white transition">
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-4 py-2 rounded-xl transition shadow-lg shadow-violet-900/30">
            Start Free →
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-gray-400 hover:text-white p-1"
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Toggle menu">
          {menuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-800 bg-gray-950 px-6 py-4 space-y-4">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="block text-gray-300 hover:text-white text-sm py-1"
              onClick={() => setMenuOpen(false)}>
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-gray-800 space-y-3">
            <Link href="/sign-in" className="block text-gray-400 text-sm" onClick={() => setMenuOpen(false)}>
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="block bg-violet-600 text-white text-center font-semibold px-4 py-2.5 rounded-xl text-sm"
              onClick={() => setMenuOpen(false)}>
              Start Free →
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
