import Link from 'next/link'

const TIERS = [
  { level: 1, range: '1 – 19',  commission: '10%', rate: 0.10, color: 'gray',   badge: 'Starter' },
  { level: 2, range: '20 – 39', commission: '20%', rate: 0.20, color: 'blue',   badge: 'Rising' },
  { level: 3, range: '40 – 59', commission: '25%', rate: 0.25, color: 'violet', badge: 'Partner' },
  { level: 4, range: '60+',     commission: '30%', rate: 0.30, color: 'amber',  badge: 'Elite' },
]

const PLANS = [
  { name: 'Starter', price: 9 },
  { name: 'Pro',     price: 29 },
  { name: 'Agency',  price: 79 },
]

const HOW = [
  { n: '01', title: 'Sign up free',       desc: 'Create your account and get your unique referral link instantly.' },
  { n: '02', title: 'Share your link',    desc: 'Post in author communities, YouTube, TikTok, newsletters, Facebook groups — anywhere self-publishers are.' },
  { n: '03', title: 'Grow your base',     desc: 'The more active paying referrals you maintain, the higher your commission tier.' },
  { n: '04', title: 'Get paid monthly',   desc: 'Payouts via PayPal every month. Minimum $20 threshold.' },
]

export default function AffiliatePage() {
  const tierColors: Record<string, { border: string; bg: string; text: string; badge: string }> = {
    gray:   { border: 'border-gray-600/50',   bg: 'bg-gray-800/30',   text: 'text-gray-300',   badge: 'bg-gray-800 text-gray-400' },
    blue:   { border: 'border-blue-600/50',   bg: 'bg-blue-950/20',   text: 'text-blue-400',   badge: 'bg-blue-900/50 text-blue-300' },
    violet: { border: 'border-violet-600/50', bg: 'bg-violet-950/20', text: 'text-violet-400', badge: 'bg-violet-900/50 text-violet-300' },
    amber:  { border: 'border-amber-500/50',  bg: 'bg-amber-950/20',  text: 'text-amber-400',  badge: 'bg-amber-900/50 text-amber-300' },
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Nav */}
      <nav className="border-b border-gray-900 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center font-bold text-sm">K</div>
          <span className="font-bold text-lg">KDP Cover AI</span>
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/pricing" className="text-gray-400 hover:text-white">Pricing</Link>
          <Link href="/sign-up" className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-4 py-2 rounded-xl transition">
            Join Affiliate Program
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-amber-950/60 border border-amber-700/50 text-amber-300 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
          💰 Earn up to 30% recurring commission
        </div>
        <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6">
          Refer. Grow. Earn.
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
            Up to 30% Commission
          </span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8 leading-relaxed">
          Start earning 10% and unlock higher tiers as your referrals grow.
          The more active paying users you maintain, the more you earn.
        </p>
        <Link href="/sign-up"
          className="inline-flex bg-amber-500 hover:bg-amber-400 text-black font-bold px-10 py-4 rounded-2xl text-lg transition shadow-lg shadow-amber-900/40">
          Start Earning Free →
        </Link>
        <p className="text-sm text-gray-600 mt-4">Free to join · No minimum traffic · Get your link instantly</p>
      </section>

      {/* How tiers work — key rule */}
      <section className="max-w-3xl mx-auto px-6 pb-10">
        <div className="bg-amber-900/20 border border-amber-700/40 rounded-2xl p-5 text-center">
          <p className="text-amber-300 font-semibold text-sm mb-1">⚡ How your tier is calculated</p>
          <p className="text-gray-300 text-sm leading-relaxed">
            Your commission rate is based on how many of your referrals are <strong className="text-white">actively paying</strong> right now.
            If you refer 60 people but only 40 are paying this month — you earn the <strong className="text-white">40-user rate (25%)</strong> on those 40.
            Once all 60 are paying — you unlock <strong className="text-white">30%</strong> on all 60.
          </p>
        </div>
      </section>

      {/* Commission Tiers */}
      <section className="max-w-5xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-bold text-white text-center mb-3">Commission Tiers</h2>
        <p className="text-gray-400 text-center mb-10">Maintain more active paying referrals → unlock higher rates.</p>
        <div className="grid md:grid-cols-4 gap-4">
          {TIERS.map((t, i) => {
            const c = tierColors[t.color]
            return (
              <div key={t.level} className={`border rounded-2xl p-6 relative ${c.border} ${c.bg}`}>
                {i === 3 && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                    MAX TIER
                  </div>
                )}
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.badge}`}>{t.badge}</span>
                <p className={`text-5xl font-black my-3 ${c.text}`}>{t.commission}</p>
                <p className="text-sm text-gray-400 font-medium">{t.range} active users</p>
                <div className="mt-4 border-t border-gray-700 pt-4 space-y-1">
                  {PLANS.map(p => (
                    <div key={p.name} className="flex justify-between text-xs">
                      <span className="text-gray-500">{p.name} ${p.price}</span>
                      <span className={`font-mono font-bold ${c.text}`}>${(p.price * t.rate).toFixed(2)}/mo</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Earnings Calculator Table */}
      <section className="max-w-5xl mx-auto px-6 py-10">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-800">
            <h2 className="text-lg font-bold text-white">Earnings Calculator — What you earn vs what KDP Cover AI earns</h2>
            <p className="text-xs text-gray-500 mt-1">Based on Pro plan ($29/mo) referrals. Figures are monthly recurring.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-500 text-xs">
                  <th className="text-left px-6 py-3">Active Users</th>
                  <th className="text-left px-6 py-3">Your Tier</th>
                  <th className="text-right px-6 py-3">Your Earnings</th>
                  <th className="text-right px-6 py-3">Platform Profit</th>
                  <th className="text-right px-6 py-3">Split</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {[
                  { users: 10,  tier: '10%', rate: 0.10 },
                  { users: 20,  tier: '20%', rate: 0.20 },
                  { users: 40,  tier: '25%', rate: 0.25 },
                  { users: 60,  tier: '30%', rate: 0.30 },
                ].map(row => {
                  const gross     = row.users * 29
                  const fee       = gross * 0.05
                  const affEarn   = gross * row.rate
                  const bizProfit = gross - fee - affEarn
                  const affPct    = Math.round(affEarn / (gross - fee) * 100)
                  const bizPct    = 100 - affPct
                  return (
                    <tr key={row.users} className={row.users === 60 ? 'bg-amber-950/10' : ''}>
                      <td className="px-6 py-4 text-white font-bold">{row.users} paying</td>
                      <td className="px-6 py-4">
                        <span className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full font-mono">{row.tier}</span>
                      </td>
                      <td className="px-6 py-4 text-right text-orange-400 font-mono font-bold">${affEarn.toFixed(0)}/mo</td>
                      <td className="px-6 py-4 text-right text-green-400 font-mono font-bold">${bizProfit.toFixed(0)}/mo</td>
                      <td className="px-6 py-4 text-right text-gray-400 text-xs">You {affPct}% · Platform {bizPct}%</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* 10 affiliates scenario */}
          <div className="px-6 py-5 bg-amber-950/20 border-t border-amber-800/30">
            <p className="text-amber-300 font-semibold text-sm mb-3">🚀 Scale scenario: 10 affiliates × 60 active users each = 600 paying users</p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-gray-500 mb-1">Total monthly revenue</p>
                <p className="text-xl font-bold text-white">$17,400</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">All affiliates paid</p>
                <p className="text-xl font-bold text-orange-400">$5,220</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Your profit</p>
                <p className="text-xl font-bold text-green-400">$11,310</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-bold text-white text-center mb-10">How It Works</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {HOW.map(h => (
            <div key={h.n} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <div className="text-3xl font-black text-amber-600 mb-3">{h.n}</div>
              <h3 className="text-white font-semibold mb-2">{h.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{h.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Perfect for */}
      <section className="max-w-4xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-bold text-white text-center mb-10">Perfect For</h2>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { icon: '📺', title: 'YouTubers & TikTokers', desc: 'Self-publishing, KDP, passive income content — your audience buys this instantly.' },
            { icon: '✍️', title: 'Book Bloggers', desc: 'Your readers are authors. A cover tool solves their #1 problem.' },
            { icon: '📧', title: 'Newsletter Writers', desc: 'One mention to your list = months of passive recurring income.' },
          ].map(c => (
            <div key={c.title} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="text-3xl mb-3">{c.icon}</div>
              <h3 className="text-white font-semibold mb-2">{c.title}</h3>
              <p className="text-gray-500 text-sm">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-6 py-20 text-center">
        <h2 className="text-4xl font-black text-white mb-4">Start at 10%. Scale to 30%.</h2>
        <p className="text-gray-400 mb-8">The more authors you help, the more you earn. No cap.</p>
        <Link href="/sign-up"
          className="inline-flex bg-amber-500 hover:bg-amber-400 text-black font-bold px-10 py-4 rounded-2xl text-xl transition">
          Join Affiliate Program Free →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-900 px-6 py-8 text-center text-sm text-gray-600">
        <div className="flex items-center justify-center gap-6 mb-4">
          <Link href="/" className="hover:text-gray-400">Home</Link>
          <Link href="/pricing" className="hover:text-gray-400">Pricing</Link>
          <Link href="/sign-up" className="hover:text-gray-400">Sign Up</Link>
        </div>
        <p>© {new Date().getFullYear()} KDP Cover AI. Affiliate commissions paid monthly via PayPal.</p>
      </footer>
    </div>
  )
}
