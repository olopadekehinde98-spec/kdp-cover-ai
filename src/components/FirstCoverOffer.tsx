'use client'

import Link from 'next/link'

export default function FirstCoverOffer({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
      <div className="bg-gray-900 border border-green-700/60 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl relative">
        <button onClick={onClose} className="absolute top-3 right-4 text-gray-600 hover:text-gray-300 text-lg">✕</button>

        <div className="text-5xl mb-3">🎉</div>
        <h2 className="text-xl font-black text-white mb-1">First cover done!</h2>
        <p className="text-gray-400 text-sm mb-4">
          You have 2 free covers left. Upgrade now and get <strong className="text-white">30% off your first month</strong> — offer expires in 24 hours.
        </p>

        <div className="bg-gray-800 border border-green-700/40 rounded-xl px-4 py-3 mb-4 flex items-center justify-between">
          <span className="font-mono text-white font-bold tracking-widest">FIRST30</span>
          <button onClick={() => navigator.clipboard?.writeText('FIRST30')} className="text-xs text-green-400 hover:text-green-300">Copy</button>
        </div>

        <Link
          href="/pricing"
          onClick={onClose}
          className="block w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition mb-2"
        >
          Claim 30% Off →
        </Link>
        <button onClick={onClose} className="text-xs text-gray-600 hover:text-gray-400">
          I&apos;ll use my remaining 2 free covers first
        </button>
      </div>
    </div>
  )
}
