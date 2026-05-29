'use client'

import Link from 'next/link'

export default function UpgradeWall({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
      <div className="bg-gray-900 border border-amber-700/60 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl relative">
        <button onClick={onClose} className="absolute top-3 right-4 text-gray-600 hover:text-gray-300 text-lg">✕</button>

        <div className="text-5xl mb-3">🚀</div>
        <h2 className="text-2xl font-black text-white mb-2">You&apos;ve used all 3 free covers!</h2>
        <p className="text-gray-400 text-sm mb-6">
          Your covers are great — now unlock unlimited generation. Use code <span className="text-violet-400 font-bold font-mono">UPGRADE20</span> for <strong className="text-white">20% off</strong> your first month.
        </p>

        <div className="grid grid-cols-3 gap-3 mb-6 text-xs">
          {[
            { plan: 'Starter', price: '₦10,960', covers: '15/mo', color: 'border-blue-700/50 text-blue-400' },
            { plan: 'Pro', price: '₦32,880', covers: 'Unlimited', color: 'border-violet-700/50 text-violet-400', popular: true },
            { plan: 'Agency', price: '₦87,680', covers: 'Unlimited+', color: 'border-amber-700/50 text-amber-400' },
          ].map(p => (
            <div key={p.plan} className={`bg-gray-800 border rounded-xl p-3 relative ${p.color}`}>
              {p.popular && <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">Popular</span>}
              <p className={`font-bold text-sm ${p.color.split(' ')[1]}`}>{p.plan}</p>
              <p className="text-white font-bold mt-1">{p.price}</p>
              <p className="text-gray-500 text-[10px] mt-0.5">{p.covers}</p>
            </div>
          ))}
        </div>

        <Link
          href="/pricing"
          className="block w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 rounded-xl transition mb-3"
        >
          Upgrade Now — Use UPGRADE20 →
        </Link>
        <button onClick={onClose} className="text-xs text-gray-600 hover:text-gray-400">
          Maybe later
        </button>
      </div>
    </div>
  )
}
