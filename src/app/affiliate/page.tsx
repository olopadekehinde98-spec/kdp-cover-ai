import Link from 'next/link'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import AffiliateCTA from '@/components/AffiliateCTAWrapper'

// Commission matrix: [tier index][plan index] = percentage
const TIERS = [
  { label: 'Level 1', range: '1 – 19 active users',  rates: { starter: 0.08, pro: 0.10, agency: 0.08 } },
  { label: 'Level 2', range: '20 – 39 active users', rates: { starter: 0.12, pro: 0.20, agency: 0.15 } },
  { label: 'Level 3', range: '40 – 59 active users', rates: { starter: 0.15, pro: 0.25, agency: 0.20 } },
  { label: 'Level 4', range: '60+ active users',     rates: { starter: 0.18, pro: 0.30, agency: 0.25 } },
]

// How many months you earn commission PER referred user, per plan
const PLAN_DURATION: Record<string, number> = {
  starter: 6,
  pro:     3,
  agency:  6,
}

const PLANS = [
  { key: 'starter', name: 'Starter', price: 9,  color: 'blue' },
  { key: 'pro',     name: 'Pro',     price: 29, color: 'violet' },
  { key: 'agency',  name: 'Agency',  price: 79, color: 'amber' },
]

const RULES = [
  { rule: 'Cookie Duration',       detail: '60 days — if someone clicks your link and subscribes within 60 days, you earn the commission.' },
  { rule: 'Qualified Referral',    detail: 'Only paying subscribers count toward your tier. Free accounts do not count.' },
  { rule: 'Commission Duration',   detail: 'You earn on each referred user for a limited time: Starter = 6 months, Pro = 3 months, Agency = 6 months. After this period, commission on that user ends.' },
  { rule: 'Tier Calculation',      detail: 'Your tier is calculated on the 1st of each month based on how many of your referrals are actively paying.' },
  { rule: 'Holding Period',        detail: '30 days — commissions are held for 30 days to account for refunds and chargebacks.' },
  { rule: 'Payout Date',           detail: "The 15th of every month for the previous month's approved commissions." },
  { rule: 'Minimum Payout',        detail: '$20 minimum before a payout is issued. Unpaid balance rolls over to next month.' },
  { rule: 'Payment Method',        detail: 'PayPal only. You must have a verified PayPal account to receive payment.' },
  { rule: 'Chargeback Rule',       detail: 'If a referred user requests a refund, the commission for that payment is reversed.' },
  { rule: 'Self-referral',         detail: 'You may not refer yourself or use fake accounts. Violations result in permanent ban.' },
]

const HOW = [
  { n: '01', title: 'Sign up free',         desc: 'Create your KDP Cover AI account and get your unique referral link instantly from your dashboard.' },
  { n: '02', title: 'Share everywhere',     desc: 'Post in self-publishing communities, YouTube, TikTok, newsletters, Reddit — wherever authors hang out.' },
  { n: '03', title: 'Grow your active base',desc: 'More active paying referrals = higher tier = higher commission on ALL your referrals.' },
  { n: '04', title: 'Get paid the 15th',    desc: 'We calculate your earnings on the 1st, hold 30 days, and pay via PayPal on the 15th.' },
]

export default function AffiliatePage() {
  const planColors: Record<string, string> = {
    blue:   'text-blue-400',
    violet: 'text-violet-400',
    amber:  'text-amber-400',
  }
  const planBg: Record<string, string> = {
    blue:   'bg-blue-900/30 border-blue-700/50',
    violet: 'bg-violet-900/30 border-violet-700/50',
    amber:  'bg-amber-900/30 border-amber-700/50',
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <SiteHeader />

      {/* Affiliate Recruitment Banner */}
      <section className="max-w-5xl mx-auto px-6 pt-10">
        <div className="bg-gradient-to-r from-amber-950/60 to-orange-950/60 border border-amber-700/50 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 bg-amber-600/30 text-amber-300 text-xs font-bold px-3 py-1 rounded-full mb-3">
              We are looking for affiliates!
            </div>
            <h2 className="text-2xl font-black text-white mb-2">
              Join Our Affiliate Program — Earn Up to 30%
            </h2>
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="flex items-center gap-1.5 text-gray-300">
                <span className="text-green-400">✓</span> Anyone can join — free to start
              </span>
              <span className="flex items-center gap-1.5 text-gray-300">
                <span className="text-green-400">✓</span> Paid users earn full rates
              </span>
              <span className="flex items-center gap-1.5 text-gray-300">
                <span className="text-green-400">✓</span> Paid in USD and NGN (₦1,370/$1)
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <a
              href="/sign-up?next=/affiliate-dashboard"
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-6 py-3 rounded-xl transition text-center whitespace-nowrap"
            >
              Join Now →
            </a>
            <a
              href="/affiliate-dashboard"
              className="bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold px-6 py-2.5 rounded-xl transition text-center text-sm"
            >
              View Dashboard
            </a>
          </div>
        </div>
      </section>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-14 text-center">
        <div className="inline-flex items-center gap-2 bg-amber-950/60 border border-amber-700/50 text-amber-300 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
          💰 Earn up to 30% recurring commission per referral
        </div>
        <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6">
          Refer Authors.
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
            Earn Every Month.
          </span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
          Start at 10% and grow to 30% as your referrals scale.
          Different rates for each plan — the bigger the plan, the bigger your payout.
        </p>
        <AffiliateCTA label="Get Your Referral Link Free →" size="lg" variant="amber" />
        <p className="text-sm text-gray-600 mt-4">Paid monthly via PayPal · Min $20 · 60-day cookie</p>
      </section>

      {/* Key rule callout */}
      <section className="max-w-3xl mx-auto px-6 pb-12">
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5">
          <p className="text-white font-semibold mb-2">⚡ How your tier works</p>
          <p className="text-gray-400 text-sm leading-relaxed">
            Your tier is calculated on the <strong className="text-white">1st of every month</strong> based on
            your total <strong className="text-white">active paying referrals</strong> across all plans.
            If you have 60 referrals but only 40 are paying — you earn at the <strong className="text-white">Level 3 rate</strong> on those 40.
            Once all 60 are paying, you unlock <strong className="text-white">Level 4</strong> on all 60.
            Commission rates differ by plan — Starter, Pro, and Agency each have their own percentage.
          </p>
        </div>
      </section>

      {/* Full Commission Matrix */}
      <section id="commission-table" className="max-w-5xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-bold text-white text-center mb-3">Full Commission Table</h2>
        <p className="text-gray-400 text-center text-sm mb-8">
          Your tier is based on <em>total active paying referrals</em>. Each plan has its own commission rate.
        </p>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 text-xs">
                <th className="text-left px-5 py-4 text-gray-400 font-medium">Tier</th>
                <th className="text-left px-5 py-4 text-gray-400 font-medium">Active Users</th>
                {PLANS.map(p => (
                  <th key={p.key} className={`text-center px-5 py-4 font-bold ${planColors[p.color]}`}>
                    {p.name}<br/>
                    <span className="font-normal text-gray-500 text-xs">${p.price}/mo</span><br/>
                    <span className="font-normal text-gray-600 text-xs">{PLAN_DURATION[p.key]}mo max</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {TIERS.map((tier, i) => (
                <tr key={tier.label} className={i === 3 ? 'bg-amber-950/10' : ''}>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      i === 3 ? 'bg-amber-900/50 text-amber-300' :
                      i === 2 ? 'bg-violet-900/50 text-violet-300' :
                      i === 1 ? 'bg-blue-900/50 text-blue-300' :
                      'bg-gray-800 text-gray-400'
                    }`}>{tier.label}</span>
                  </td>
                  <td className="px-5 py-4 text-gray-300 text-xs">{tier.range}</td>
                  {PLANS.map(p => {
                    const rate = tier.rates[p.key as keyof typeof tier.rates]
                    const earn = p.price * rate
                    const maxTotal = earn * PLAN_DURATION[p.key]
                    return (
                      <td key={p.key} className="px-5 py-4 text-center">
                        <div className={`font-bold ${planColors[p.color]}`}>{(rate * 100).toFixed(0)}%</div>
                        <div className="text-gray-500 text-xs font-mono">${earn.toFixed(2)}/mo</div>
                        <div className="text-gray-600 text-xs font-mono">${maxTotal.toFixed(2)} max</div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* What you earn at max tier */}
      <section className="max-w-5xl mx-auto px-6 py-4">
        <h2 className="text-xl font-bold text-white mb-1">At Level 4 (60+ users) — Earnings per referred user</h2>
        <p className="text-gray-500 text-sm mb-4">Commission duration: Starter = 6 months · Pro = 3 months · Agency = 6 months</p>
        <div className="grid md:grid-cols-3 gap-4">
          {PLANS.map(p => {
            const rate     = TIERS[3].rates[p.key as keyof typeof TIERS[3]['rates']]
            const earn     = p.price * rate
            const months   = PLAN_DURATION[p.key]
            const maxUser  = earn * months
            const biz      = p.price * 0.95 - earn
            return (
              <div key={p.key} className={`border rounded-2xl p-5 ${planBg[p.color]}`}>
                <p className={`text-sm font-bold mb-3 ${planColors[p.color]}`}>{p.name} — ${p.price}/mo · {months}mo</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Per user / month</span>
                    <span className="text-white font-mono font-bold">${earn.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Max per user ({months}mo)</span>
                    <span className={`font-mono font-bold ${planColors[p.color]}`}>${maxUser.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Platform keeps</span>
                    <span className="text-green-400 font-mono font-bold">${biz.toFixed(2)}/mo</span>
                  </div>
                  <div className="border-t border-gray-700 pt-2 flex justify-between">
                    <span className="text-gray-400">60 users × {months}mo max</span>
                    <span className={`font-mono font-bold ${planColors[p.color]}`}>${(maxUser * 60).toFixed(0)}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Scale scenario */}
      <section className="max-w-5xl mx-auto px-6 py-10">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-1">🚀 Scale scenario: 10 affiliates × 60 users = 600 paying users</h2>
          <p className="text-xs text-gray-500 mb-5">All on Pro plan, all at Level 4</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { label: 'Total Revenue',      value: '$17,400/mo', color: 'text-white' },
              { label: 'All Affiliates Paid', value: '$5,220/mo', color: 'text-orange-400' },
              { label: 'Platform Fees (5%)',  value: '$870/mo',   color: 'text-red-400' },
              { label: 'Your Profit',         value: '$11,310/mo',color: 'text-green-400' },
            ].map(s => (
              <div key={s.label} className="bg-gray-800 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                <p className={`text-lg font-bold font-mono ${s.color}`}>{s.value}</p>
              </div>
            ))}
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

      {/* Rules & Regulations */}
      <section className="max-w-4xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-bold text-white text-center mb-3">Rules & Regulations</h2>
        <p className="text-gray-400 text-center text-sm mb-8">Read before joining. Violations result in commission forfeiture.</p>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl divide-y divide-gray-800">
          {RULES.map(r => (
            <div key={r.rule} className="px-6 py-4 flex gap-4">
              <span className="text-violet-400 font-bold text-sm min-w-[160px] shrink-0">{r.rule}</span>
              <span className="text-gray-400 text-sm leading-relaxed">{r.detail}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-6 py-20 text-center">
        <h2 className="text-4xl font-black text-white mb-4">Start at 10%. Scale to 30%.</h2>
        <p className="text-gray-400 mb-8">No cap. No gimmicks. Real recurring monthly income.</p>
        <AffiliateCTA label="Join Free — Get Your Link →" size="lg" variant="amber" />
      </section>

      <SiteFooter />
    </div>
  )
}
