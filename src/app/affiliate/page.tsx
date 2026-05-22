import Link from 'next/link'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import AffiliateCTA from '@/components/AffiliateCTAWrapper'

/**
 * Affiliate program page — flat-dollar commission per referral.
 *
 * L1 (0–9 active):   $3 per referral
 * L2 (10–19 active): $5 per referral
 * L3 (20–39 active): $10 per referral
 * L4 (40+ active):   $15 per referral (no further cap)
 *
 * Free (unpaid) affiliates earn 50% of each tier.
 */

const TIERS = [
  { label: 'Level 1', range: '0 – 9 active referrals',  earn: 3,  freeEarn: 1.5,  color: 'text-gray-300',   bg: 'bg-gray-800 text-gray-400' },
  { label: 'Level 2', range: '10 – 19 active referrals', earn: 5,  freeEarn: 2.5,  color: 'text-blue-300',   bg: 'bg-blue-900/50 text-blue-300' },
  { label: 'Level 3', range: '20 – 39 active referrals', earn: 10, freeEarn: 5,    color: 'text-violet-300', bg: 'bg-violet-900/50 text-violet-300' },
  { label: 'Level 4', range: '40+ active referrals',     earn: 15, freeEarn: 7.5,  color: 'text-amber-300',  bg: 'bg-amber-900/50 text-amber-300' },
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
          Start at <strong className="text-white">$3 per referral</strong> and grow to{' '}
          <strong className="text-white">$15 per referral</strong> as your network scales.
          Simple flat amounts — no percentage math, no plan dependency.
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
        <h2 className="text-3xl font-bold text-white text-center mb-3">Commission Tiers</h2>
        <p className="text-gray-400 text-center text-sm mb-8">
          Flat dollar per referral. Your tier updates live as your referrals grow.
        </p>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 text-xs text-gray-500">
                <th className="text-left px-5 py-4 font-medium">Tier</th>
                <th className="text-left px-5 py-4 font-medium">Active Referrals</th>
                <th className="text-right px-5 py-4 font-medium">Paid Affiliate</th>
                <th className="text-right px-5 py-4 font-medium">Free Affiliate (50%)</th>
                <th className="text-right px-5 py-4 font-medium">In NGN (paid rate)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {TIERS.map((tier, i) => (
                <tr key={tier.label} className={i === 3 ? 'bg-amber-950/10' : ''}>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${tier.bg}`}>
                      {tier.label}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-300 text-xs">{tier.range}</td>
                  <td className="px-5 py-4 text-right">
                    <span className={`font-bold font-mono text-lg ${tier.color}`}>${tier.earn}</span>
                    <span className="text-gray-500 text-xs block">per referral</span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className="text-gray-400 font-mono">${tier.freeEarn.toFixed(2)}</span>
                    <span className="text-gray-600 text-xs block">per referral</span>
                  </td>
                  <td className="px-5 py-4 text-right text-green-400 font-mono">
                    ₦{(tier.earn * 1370).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Example earnings */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <p className="text-white font-semibold mb-3">📊 Example: 10 referrals</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">First 10 (L1 rate × 10)</span><span className="text-white font-mono">$3 × 10 = $30</span></div>
              <div className="flex justify-between border-t border-gray-800 pt-2"><span className="text-gray-400">Total earned</span><span className="text-green-400 font-bold font-mono">$30 (₦41,100)</span></div>
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <p className="text-white font-semibold mb-3">🚀 Example: 40 referrals</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">First 10 (L1 × 10)</span><span className="text-white font-mono">$30</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Next 10 (L2 × 10)</span><span className="text-white font-mono">$50</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Next 20 (L3 × 20)</span><span className="text-white font-mono">$200</span></div>
              <div className="flex justify-between border-t border-gray-800 pt-2"><span className="text-gray-400">Total earned</span><span className="text-amber-400 font-bold font-mono">$280 (₦383,600)</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* Scale scenario */}
      <section className="max-w-5xl mx-auto px-6 py-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-1">🚀 What if you refer 60+ people?</h2>
          <p className="text-xs text-gray-500 mb-5">At Level 4 ($15 per referral), referrals 41 onwards each earn you $15.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { label: '60 referrals total',   value: '$380 earned', sub: '(mixed tiers)',  color: 'text-white' },
              { label: 'From referral 41–60',  value: '$300 earned', sub: '(20 × $15)',     color: 'text-amber-400' },
              { label: '100 referrals total',  value: '$980 earned', sub: '(60 @ L4)',      color: 'text-violet-400' },
              { label: 'In Nigerian Naira',    value: '₦1,344,600', sub: '(100 refs)',      color: 'text-green-400' },
            ].map(s => (
              <div key={s.label} className="bg-gray-800 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                <p className={`text-lg font-bold font-mono ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-600 mt-1">{s.sub}</p>
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

      {/* Free vs Paid comparison */}
      <section className="max-w-3xl mx-auto px-6 py-4 pb-10">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Free Affiliate vs Paid Affiliate</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-400 font-semibold mb-3 text-sm">Free Affiliate (any user)</p>
              <ul className="space-y-2 text-sm">
                {[
                  'L1: $1.50 per referral',
                  'L2: $2.50 per referral',
                  'L3: $5.00 per referral',
                  'L4: $7.50 per referral',
                  'No cost to join',
                  'Same referral link',
                ].map(item => (
                  <li key={item} className="flex items-center gap-2 text-gray-300">
                    <span className="text-gray-500">○</span> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-amber-400 font-semibold mb-3 text-sm">Paid Affiliate (any paid plan)</p>
              <ul className="space-y-2 text-sm">
                {[
                  'L1: $3 per referral',
                  'L2: $5 per referral',
                  'L3: $10 per referral',
                  'L4: $15 per referral',
                  '2× earnings vs free',
                  'Priority support',
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
                Upgrade to a paid plan →
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
