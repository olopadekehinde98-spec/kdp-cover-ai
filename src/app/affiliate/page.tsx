import Link from 'next/link'

const TIERS = [
  { name: 'Standard', sales: '1–4 sales/mo',  commission: '30%', color: 'blue',   example: '$8.70/mo per Pro referral' },
  { name: 'Partner',  sales: '5–19 sales/mo', commission: '35%', color: 'violet', example: '$10.15/mo per Pro referral' },
  { name: 'Elite',    sales: '20+ sales/mo',  commission: '40%', color: 'amber',  example: '$11.60/mo per Pro referral' },
]

const HOW = [
  { n: '01', title: 'Sign up free',       desc: 'Create your account and get your unique referral link instantly.' },
  { n: '02', title: 'Share your link',    desc: 'Post in author communities, YouTube, TikTok, newsletters — anywhere self-publishers hang out.' },
  { n: '03', title: 'Earn every month',   desc: 'Get 30–40% of every payment your referrals make, for 12 months.' },
  { n: '04', title: 'Get paid',           desc: 'Payouts via PayPal or bank transfer every month, minimum $20.' },
]

export default function AffiliatePage() {
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
          💰 Earn 30–40% recurring commission
        </div>
        <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6">
          Get Paid to Share
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
            KDP Cover AI
          </span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8 leading-relaxed">
          Refer self-publishers and earn 30% of every payment they make — for 12 months.
          No cap. No gimmicks. Real recurring income.
        </p>
        <Link href="/sign-up"
          className="inline-flex bg-amber-500 hover:bg-amber-400 text-black font-bold px-10 py-4 rounded-2xl text-lg transition shadow-lg shadow-amber-900/40">
          Start Earning Free →
        </Link>
        <p className="text-sm text-gray-600 mt-4">Free to join · No minimum traffic · Instant link</p>
      </section>

      {/* Stats */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: '30–40%', label: 'Recurring commission' },
            { value: '12 mo',  label: 'Commission duration' },
            { value: '$20',    label: 'Minimum payout' },
          ].map(s => (
            <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center">
              <p className="text-3xl font-black text-amber-400 mb-1">{s.value}</p>
              <p className="text-sm text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Commission tiers */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-white text-center mb-4">Commission Tiers</h2>
        <p className="text-gray-400 text-center mb-10">The more you refer, the more you earn.</p>
        <div className="grid md:grid-cols-3 gap-5">
          {TIERS.map(t => {
            const colors: Record<string, string> = {
              blue:   'border-blue-600/50 bg-blue-950/20',
              violet: 'border-violet-600/50 bg-violet-950/20',
              amber:  'border-amber-500/50 bg-amber-950/20',
            }
            const textColors: Record<string, string> = {
              blue: 'text-blue-400', violet: 'text-violet-400', amber: 'text-amber-400'
            }
            return (
              <div key={t.name} className={`border rounded-2xl p-6 ${colors[t.color]}`}>
                <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${textColors[t.color]}`}>{t.name}</p>
                <p className={`text-5xl font-black mb-1 ${textColors[t.color]}`}>{t.commission}</p>
                <p className="text-sm text-gray-400 mb-4">{t.sales}</p>
                <div className="border-t border-gray-700 pt-4">
                  <p className="text-xs text-gray-500">Example</p>
                  <p className="text-sm text-gray-300 font-medium">{t.example}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Earnings calculator */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-white mb-6 text-center">💰 Earnings Calculator</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700 text-gray-500 text-xs">
                  <th className="text-left py-2">Referrals / month</th>
                  <th className="text-right py-2">Starter ($9)</th>
                  <th className="text-right py-2">Pro ($29)</th>
                  <th className="text-right py-2">Agency ($79)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {[
                  { refs: 5,   comm: 0.30 },
                  { refs: 10,  comm: 0.30 },
                  { refs: 20,  comm: 0.35 },
                  { refs: 50,  comm: 0.40 },
                  { refs: 100, comm: 0.40 },
                ].map(({ refs, comm }) => (
                  <tr key={refs}>
                    <td className="py-3 text-white font-medium">{refs} referrals</td>
                    <td className="py-3 text-right text-green-400 font-mono">${(refs * 9 * comm).toFixed(0)}/mo</td>
                    <td className="py-3 text-right text-green-400 font-mono">${(refs * 29 * comm).toFixed(0)}/mo</td>
                    <td className="py-3 text-right text-green-400 font-mono">${(refs * 79 * comm).toFixed(0)}/mo</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-6 py-16">
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

      {/* Who it's for */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-white text-center mb-10">Perfect For</h2>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { icon: '📺', title: 'YouTubers & TikTokers', desc: 'Self-publishing, KDP, passive income audiences — they buy this instantly.' },
            { icon: '✍️', title: 'Book Bloggers', desc: 'Your readers are authors. This solves their #1 pain point.' },
            { icon: '📧', title: 'Newsletter Writers', desc: 'One mention to your list = months of recurring income.' },
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
        <h2 className="text-4xl font-black text-white mb-4">Ready to earn?</h2>
        <p className="text-gray-400 mb-8">Join free. Get your link. Start earning today.</p>
        <Link href="/sign-up"
          className="inline-flex bg-amber-500 hover:bg-amber-400 text-black font-bold px-10 py-4 rounded-2xl text-xl transition">
          Join Affiliate Program →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-900 px-6 py-8 text-center text-sm text-gray-600">
        <div className="flex items-center justify-center gap-6 mb-4">
          <Link href="/" className="hover:text-gray-400">Home</Link>
          <Link href="/pricing" className="hover:text-gray-400">Pricing</Link>
          <Link href="/sign-up" className="hover:text-gray-400">Sign Up</Link>
        </div>
        <p>© {new Date().getFullYear()} KDP Cover AI. Affiliate program powered by Lemon Squeezy.</p>
      </footer>
    </div>
  )
}
