import Link from 'next/link'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import AffiliateCTA from '@/components/AffiliateCTAWrapper'

/**
 * Affiliate commission: percentage of monthly plan price, by tier.
 *
 * Tier based on ACTIVE PAYING referrals:
 *   L1: 0–9 | L2: 10–19 | L3: 20–39 | L4: 40–59 | L5: 60+ (max, 30% on Pro)
 *
 * Rates:
 *   Starter($9):  8 / 12 / 18 / 22 / 25%
 *   Pro($29):    10 / 15 / 22 / 27 / 30%
 *   Agency($79):  5 /  8 / 10 / 12 / 15%
 *
 * Free affiliates earn 50% of each rate.
 */

// Equal % for all plans — same rate every tier, amounts scale with plan price
const TIERS = [
  { key: 'L1', label: 'Level 1', range: '0 – 9',   pct: 5.0,  bg: 'bg-gray-800 text-gray-400',
    starter: { earn: 0.45 }, pro: { earn: 1.45 }, agency: { earn: 3.95 } },
  { key: 'L2', label: 'Level 2', range: '10 – 19', pct: 8.0,  bg: 'bg-blue-900/50 text-blue-300',
    starter: { earn: 0.72 }, pro: { earn: 2.32 }, agency: { earn: 6.32 } },
  { key: 'L3', label: 'Level 3', range: '20 – 39', pct: 10.0, bg: 'bg-violet-900/50 text-violet-300',
    starter: { earn: 0.90 }, pro: { earn: 2.90 }, agency: { earn: 7.90 } },
  { key: 'L4', label: 'Level 4', range: '40 – 59', pct: 13.0, bg: 'bg-violet-900/70 text-violet-200',
    starter: { earn: 1.17 }, pro: { earn: 3.77 }, agency: { earn: 10.27 } },
  { key: 'L5', label: 'Level 5', range: '60+',     pct: 15.5, bg: 'bg-amber-900/50 text-amber-300',
    starter: { earn: 1.40 }, pro: { earn: 4.50 }, agency: { earn: 12.25 } },
]

const HOW = [
  { n: '01', title: 'Sign up free',         desc: 'Create your KDP Cover AI account and get your unique referral link instantly from your affiliate dashboard.' },
  { n: '02', title: 'Share everywhere',     desc: 'Post in self-publishing communities, YouTube, TikTok, WhatsApp groups, newsletters — wherever authors hang out.' },
  { n: '03', title: 'Grow your referrals',  desc: 'Every person who signs up through your link and subscribes counts as an active referral. More referrals = higher tier = more $ per referral.' },
  { n: '04', title: 'Get paid monthly',     desc: 'Request your payout from the dashboard. Admin processes payments within 2–3 business days via bank transfer (NGN or USD).' },
]

const RULES = [
  { rule: 'Cookie Duration',     detail: '60 days — if someone clicks your link and subscribes within 60 days, you earn the commission.' },
  { rule: 'Qualified Referral',  detail: 'Only paying subscribers count toward your tier and commission. Free accounts do not count.' },
  { rule: 'Commission',          detail: 'You earn a flat dollar amount per referral that converts to a paid subscriber. The amount depends on your current tier.' },
  { rule: 'Tier Timing',         detail: 'Your tier is live — it updates immediately as your active referrals grow. No need to wait until the 1st of the month.' },
  { rule: 'Holding Period',      detail: '30 days — commissions are held for 30 days to account for refunds and chargebacks.' },
  { rule: 'Minimum Payout',      detail: '$10 minimum before a payout can be requested. Unpaid balance rolls over.' },
  { rule: 'Payment Methods',     detail: 'Bank transfer (NGN or USD). You provide your account details in the affiliate dashboard when requesting payout.' },
  { rule: 'Chargeback Rule',     detail: 'If a referred user requests a refund, the commission for that payment is reversed.' },
  { rule: 'Self-referral',       detail: 'You may not refer yourself or create fake accounts. Violations result in permanent account ban.' },
  { rule: 'Free vs Paid',        detail: 'Free affiliates earn 50% of the listed rate. Upgrade to any paid plan (Starter, Pro, or Agency) to earn the full rate.' },
]

export default function AffiliatePage() {
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
              Earn $3 – $15 Per Referral. No Cap. No Expiry.
            </h2>
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="flex items-center gap-1.5 text-gray-300">
                <span className="text-green-400">✓</span> Free to join
              </span>
              <span className="flex items-center gap-1.5 text-gray-300">
                <span className="text-green-400">✓</span> Flat dollar per referral — no confusing percentages
              </span>
              <span className="flex items-center gap-1.5 text-gray-300">
                <span className="text-green-400">✓</span> Paid in USD or NGN (₦1,370/$1)
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
              View My Dashboard
            </a>
          </div>
        </div>
      </section>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-14 text-center">
        <div className="inline-flex items-center gap-2 bg-amber-950/60 border border-amber-700/50 text-amber-300 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
          💰 Flat dollar commission — simple, transparent, no confusing percentages
        </div>
        <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6">
          Refer Authors.
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
            Earn Every Referral.
          </span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
          Start at <strong className="text-white">10% of Pro</strong> ($2.90/referral) and grow to{' '}
          <strong className="text-white">30% of Pro</strong> ($8.70/referral) at 60+ active referrals.
          Higher plan = higher absolute $ for you. Tier up as your network grows.
        </p>
        <AffiliateCTA label="Get Your Referral Link Free →" size="lg" variant="amber" />
        <p className="text-sm text-gray-600 mt-4">Free to join · No cap · Bank transfer payout · 60-day cookie</p>
      </section>

      {/* How tiers work — simple explainer */}
      <section className="max-w-3xl mx-auto px-6 pb-12">
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5">
          <p className="text-white font-semibold mb-2">⚡ How your tier works — simple version</p>
          <p className="text-gray-400 text-sm leading-relaxed">
            Your tier is based on how many of your referrals are <strong className="text-white">currently paying subscribers</strong>.
            The more active paying referrals you have, the higher your tier — and the more you earn per new referral.
            Your tier upgrades <em>immediately</em> as your referrals grow.
            There is <strong className="text-white">no time limit</strong> on earning — you keep earning on referrals as long as they stay subscribed.
          </p>
        </div>
      </section>

      {/* Commission Tier Table */}
      <section id="commission-table" className="max-w-5xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-bold text-white text-center mb-3">Full Commission Table</h2>
        <p className="text-gray-400 text-center text-sm mb-8">
          Equal % for all plans — same rate per tier, amounts scale with plan price · Max 15.5% at 60+ referrals
        </p>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700 text-xs">
                  <th className="text-left px-5 py-4 text-gray-400 font-medium">Tier</th>
                  <th className="text-left px-5 py-4 text-gray-400 font-medium">Active Refs</th>
                  <th className="text-center px-5 py-4 text-gray-400 font-medium">Rate</th>
                  <th className="text-center px-5 py-4 text-blue-400 font-bold">Starter<br/><span className="text-gray-500 font-normal">$9/mo</span></th>
                  <th className="text-center px-5 py-4 text-violet-400 font-bold">Pro<br/><span className="text-gray-500 font-normal">$29/mo</span></th>
                  <th className="text-center px-5 py-4 text-amber-400 font-bold">Agency<br/><span className="text-gray-500 font-normal">$79/mo</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {TIERS.map((tier, i) => (
                  <tr key={tier.key} className={i === 4 ? 'bg-amber-950/10' : ''}>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${tier.bg}`}>{tier.label}</span>
                      {i === 4 && <span className="text-amber-500 text-xs ml-2">max</span>}
                    </td>
                    <td className="px-5 py-4 text-gray-300 text-xs">{tier.range} active</td>
                    <td className="px-5 py-4 text-center">
                      <span className={`font-bold text-sm ${i === 4 ? 'text-amber-400' : 'text-gray-300'}`}>{tier.pct}%</span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="text-blue-400 font-bold font-mono">${tier.starter.earn.toFixed(2)}</div>
                      <div className="text-gray-600 text-xs">₦{Math.round(tier.starter.earn * 1370).toLocaleString()}</div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="text-violet-400 font-bold font-mono">${tier.pro.earn.toFixed(2)}</div>
                      <div className="text-gray-600 text-xs">₦{Math.round(tier.pro.earn * 1370).toLocaleString()}</div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="text-amber-400 font-bold font-mono">${tier.agency.earn.toFixed(2)}</div>
                      <div className="text-gray-600 text-xs">₦{Math.round(tier.agency.earn * 1370).toLocaleString()}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-gray-800 text-xs text-gray-500">
            Same % for every plan — fair and proportional. Free affiliates earn 50% of all rates above.
            Commission recurs monthly while your referral stays subscribed.
          </div>
        </div>

        {/* Real example: 60 referred, 12 per tier */}
        <div className="bg-gray-900 border border-amber-700/30 rounded-2xl p-6 mb-4">
          <p className="text-white font-bold mb-1">📊 Real Example: 60 active referrals — 12 people per tier</p>
          <p className="text-gray-500 text-xs mb-4">
            As you grew to 60, 12 people joined at each tier (4 Starter + 4 Pro + 4 Agency per group).
            Now all 60 are active → you are at <strong className="text-amber-400">Level 5 (15.5%)</strong>.
          </p>
          <p className="text-gray-300 text-xs font-semibold mb-2">Monthly recurring (all 60 pay again every month at your current L5 rate):</p>
          <div className="grid md:grid-cols-4 gap-3 mb-3">
            {[
              { label: '20 × Starter ($9)', calc: '20 × $1.40', total: '$28.00', ngn: '₦38,360', color: 'text-blue-400' },
              { label: '20 × Pro ($29)', calc: '20 × $4.50', total: '$90.00', ngn: '₦123,300', color: 'text-violet-400' },
              { label: '20 × Agency ($79)', calc: '20 × $12.25', total: '$245.00', ngn: '₦335,650', color: 'text-amber-400' },
              { label: 'YOU EARN per month', calc: 'all 60 users', total: '$363.00', ngn: '₦497,310', color: 'text-green-400' },
            ].map(s => (
              <div key={s.label} className="bg-gray-800 rounded-xl p-4">
                <p className="text-gray-500 text-xs mb-1">{s.label}</p>
                <p className="text-gray-400 text-xs font-mono mb-1">{s.calc}</p>
                <p className={`font-bold font-mono text-lg ${s.color}`}>{s.total}</p>
                <p className="text-gray-600 text-xs font-mono">{s.ngn}</p>
              </div>
            ))}
          </div>
          <p className="text-gray-500 text-xs">
            ₦497,310 comes in <strong className="text-white">every month</strong> those 60 stay subscribed — that repeats without doing any extra work.
          </p>
        </div>
      </section>

      {/* Scale scenario — 10 affiliates */}
      <section className="max-w-5xl mx-auto px-6 py-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-1">🚀 10 Affiliates × 60 Referrals Each = 600 Users</h2>
          <p className="text-xs text-gray-500 mb-5">Each affiliate at L5 (15.5%) · 20 Starter + 20 Pro + 20 Agency per affiliate</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-4">
            {[
              { label: '1 affiliate earns',     value: '$363/mo',    sub: '₦497,310/mo',     color: 'text-violet-400' },
              { label: '10 affiliates earn',    value: '$3,630/mo',  sub: '₦4,973,100/mo',   color: 'text-amber-400' },
              { label: 'Total revenue (600 users)', value: '$23,400/mo', sub: '₦32,058,000/mo', color: 'text-white' },
              { label: 'YOU keep after paying',  value: '$19,770/mo', sub: '₦27,084,900/mo',  color: 'text-green-400' },
            ].map(s => (
              <div key={s.label} className="bg-gray-800 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                <p className={`text-lg font-bold font-mono ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-600 mt-1">{s.sub}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            Affiliate payout = 15.5% of revenue. Owner keeps 84.5% before operational costs (hosting, payment fees, etc).
          </p>
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

      {/* Free vs Paid comparison */}
      <section className="max-w-3xl mx-auto px-6 py-4 pb-10">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Free Affiliate vs Paid Affiliate (Pro example)</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-400 font-semibold mb-3 text-sm">Free Affiliate (on free plan)</p>
              <ul className="space-y-2 text-sm">
                {[
                  'L1 — Pro referral: $1.45/mo each',
                  'L2 — Pro referral: $2.18/mo each',
                  'L3 — Pro referral: $3.19/mo each',
                  'L4 — Pro referral: $3.92/mo each',
                  'L5 — Pro referral: $4.35/mo each',
                  'No cost to join',
                ].map(item => (
                  <li key={item} className="flex items-center gap-2 text-gray-300">
                    <span className="text-gray-500">○</span> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-amber-400 font-semibold mb-3 text-sm">Paid Affiliate (any paid plan) — 2×</p>
              <ul className="space-y-2 text-sm">
                {[
                  'L1 — Pro referral: $2.90/mo each',
                  'L2 — Pro referral: $4.35/mo each',
                  'L3 — Pro referral: $6.38/mo each',
                  'L4 — Pro referral: $7.83/mo each',
                  'L5 — Pro referral: $8.70/mo each',
                  '2× earnings vs free affiliate',
                ].map(item => (
                  <li key={item} className="flex items-center gap-2 text-gray-300">
                    <span className="text-amber-400">✓</span> {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/pricing"
                className="mt-4 inline-block text-xs text-amber-400 hover:text-amber-300 underline"
              >
                Upgrade to a paid plan from $9/mo →
              </Link>
            </div>
          </div>
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
        <h2 className="text-4xl font-black text-white mb-4">Start at $3. Scale to $15.</h2>
        <p className="text-gray-400 mb-8">No cap. No confusing percentages. Just flat dollar earnings per referral.</p>
        <AffiliateCTA label="Join Free — Get Your Link →" size="lg" variant="amber" />
      </section>

      <SiteFooter />
    </div>
  )
}
