'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'

const PLANS = [
  {
    key: 'STARTER',
    name: 'Starter',
    price: 9,
    desc: 'Perfect for new authors',
    features: [
      '15 covers per month',
      'All trim sizes supported',
      'KDP-ready PDF export',
      'Email support',
    ],
    cta: 'Get Starter',
    highlight: false,
    color: 'blue',
  },
  {
    key: 'PRO',
    name: 'Pro',
    price: 29,
    desc: 'Most popular for serious authors',
    features: [
      'Unlimited cover generation',
      'All trim sizes',
      'KDP-ready PDF export (no watermark)',
      'Commercial use rights',
      'Series branding presets',
      'AI back cover description writer',
      'Priority email support',
    ],
    cta: 'Get Pro',
    highlight: true,
    color: 'violet',
  },
  {
    key: 'AGENCY',
    name: 'Agency',
    price: 79,
    desc: 'For publishers & book formatters',
    features: [
      'Everything in Pro',
      'White-label PDF export',
      'No "KDP Cover AI" metadata in exports',
      'Export in PDF, PNG, and JPG',
      'Dedicated support (24h response)',
      'Commercial use on all client work',
    ],
    cta: 'Get Agency',
    highlight: false,
    color: 'amber',
  },
]

const NGN_RATE = 1370
const NGN_PRICES: Record<string, number> = {
  STARTER: 12330,
  PRO: 39730,
  AGENCY: 108230,
}

export default function PricingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [provider, setProvider] = useState<'flutterwave' | 'paddle'>('flutterwave')

  async function handleSubscribe(plan: string) {
    setLoading(plan)
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, provider }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else if (res.status === 401) {
        router.push('/sign-up')
      } else {
        alert('Something went wrong. Please try again.')
      }
    } catch {
      router.push('/sign-up')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <SiteHeader />
      <div className="flex-1 max-w-5xl mx-auto px-6 py-20 w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-gray-400 text-xl max-w-2xl mx-auto">
            Start free with 3 covers. Upgrade when you&apos;re ready. Cancel anytime.
          </p>
        </div>

        {/* Payment method toggle */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex items-center gap-1 bg-gray-900 border border-gray-800 rounded-2xl p-1.5">
            <button
              onClick={() => setProvider('flutterwave')}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition ${
                provider === 'flutterwave'
                  ? 'bg-green-700 text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              🇳🇬 Pay with Flutterwave (NGN)
            </button>
            <button
              onClick={() => setProvider('paddle')}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition ${
                provider === 'paddle'
                  ? 'bg-blue-700 text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              🌍 Pay with Card (USD)
            </button>
          </div>
        </div>
        {provider === 'flutterwave' && (
          <p className="text-center text-xs text-gray-500 mb-8">
            Prices shown in USD · NGN equivalent at ₦{NGN_RATE.toLocaleString()}/$1 shown below each plan
          </p>
        )}

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {PLANS.map(plan => (
            <div key={plan.key}
              className={`relative rounded-2xl border p-6 flex flex-col
                ${plan.highlight
                  ? 'border-violet-500 bg-violet-950/30 shadow-xl shadow-violet-900/20'
                  : 'border-gray-800 bg-gray-900'}`}>

              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-xs font-semibold px-4 py-1 rounded-full">
                  Most Popular
                </div>
              )}

              <div className="mb-5">
                <h2 className={`text-lg font-bold
                  ${plan.color === 'blue' ? 'text-blue-400' :
                    plan.color === 'violet' ? 'text-violet-300' : 'text-amber-400'}`}>
                  {plan.name}
                </h2>
                <p className="text-gray-500 text-sm mt-1">{plan.desc}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-white">${plan.price}</span>
                <span className="text-gray-500 text-sm">/month</span>
                {provider === 'flutterwave' && (
                  <div className="text-green-400 text-sm font-medium mt-1">
                    ≈ ₦{NGN_PRICES[plan.key].toLocaleString()} / month
                  </div>
                )}
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                    <span className="text-green-400 flex-shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.key)}
                disabled={loading === plan.key}
                className={`w-full py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2
                  ${plan.highlight
                    ? 'bg-violet-600 hover:bg-violet-700 text-white'
                    : 'bg-gray-800 hover:bg-gray-700 text-gray-200'}`}>
                {loading === plan.key ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Processing...</>
                ) : plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Free tier callout */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 mb-16">
          <div>
            <h3 className="text-white font-semibold text-lg">Try It Free First</h3>
            <p className="text-gray-400 text-sm mt-1">
              3 free covers, no credit card needed. Watermark on free exports.
            </p>
          </div>
          <Link href="/sign-up"
            className="bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold px-6 py-3 rounded-xl transition whitespace-nowrap">
            Create Free Account →
          </Link>
        </div>

        {/* Comparison: Free vs Paid */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden mb-16">
          <div className="px-6 py-4 border-b border-gray-800">
            <h2 className="text-white font-semibold">Plan Comparison</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-xs text-gray-500">
                <th className="text-left px-6 py-3">Feature</th>
                <th className="text-center px-4 py-3">Free</th>
                <th className="text-center px-4 py-3 text-blue-400">Starter</th>
                <th className="text-center px-4 py-3 text-violet-400">Pro</th>
                <th className="text-center px-4 py-3 text-amber-400">Agency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {[
                ['Covers per month', '3 total', '15', 'Unlimited', 'Unlimited'],
                ['PDF export', 'Watermark', '✓', '✓', '✓'],
                ['All trim sizes', '✓', '✓', '✓', '✓'],
                ['KDP-ready (no watermark)', '✗', '✓', '✓', '✓'],
                ['Commercial use rights', '✗', '✗', '✓', '✓'],
                ['AI back cover writer', '✗', '✗', '✓', '✓'],
                ['Series branding presets', '✗', '✗', '✓', '✓'],
                ['White-label export', '✗', '✗', '✗', '✓'],
              ].map(([feature, free, starter, pro, agency]) => (
                <tr key={feature}>
                  <td className="px-6 py-3 text-gray-300">{feature}</td>
                  <td className="px-4 py-3 text-center text-gray-500">{free}</td>
                  <td className="px-4 py-3 text-center text-gray-300">{starter}</td>
                  <td className="px-4 py-3 text-center text-gray-300">{pro}</td>
                  <td className="px-4 py-3 text-center text-gray-300">{agency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bank Transfer Payment */}
        <div className="max-w-3xl mx-auto mb-16">
          <div className="bg-gray-900 border border-amber-700/50 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🏦</span>
              <h2 className="text-xl font-bold text-white">Pay by Bank Transfer</h2>
            </div>
            <p className="text-gray-400 text-sm mb-6">
              Prefer to pay directly? Transfer to one of the accounts below, then submit your receipt and your plan will be upgraded.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
                <div className="text-xs text-blue-400 font-semibold mb-2">🇺🇸 Dollar Account (USD)</div>
                <div className="text-2xl font-mono font-bold text-white tracking-wider mb-1">216113472865</div>
                <div className="text-gray-300 text-sm">Samuel Olopade Kehinde</div>
                <div className="text-gray-500 text-xs mt-1">Lead Bank (via Grey)</div>
              </div>
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
                <div className="text-xs text-green-400 font-semibold mb-2">🇳🇬 Naira Account (NGN)</div>
                <div className="text-2xl font-mono font-bold text-white tracking-wider mb-1">7041389971</div>
                <div className="text-gray-300 text-sm">Olopade Samuel Kehinde</div>
                <div className="text-gray-500 text-xs mt-1">OPay</div>
              </div>
            </div>
            <div className="bg-gray-800 rounded-xl p-4 mb-6">
              <div className="text-xs text-gray-400 mb-3 font-semibold">Amount to Transfer</div>
              <div className="grid grid-cols-3 gap-3 text-center text-sm">
                <div><div className="text-white font-bold">STARTER</div><div className="text-gray-400">$9 · ₦14,000</div></div>
                <div><div className="text-violet-400 font-bold">PRO</div><div className="text-gray-400">$29 · ₦45,000</div></div>
                <div><div className="text-amber-400 font-bold">AGENCY</div><div className="text-gray-400">$79 · ₦122,000</div></div>
              </div>
            </div>
            <Link
              href="/payment-proof"
              className="block w-full text-center bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-xl font-semibold transition"
            >
              📎 Submit Payment Receipt
            </Link>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-5">
            {[
              {
                q: 'Will my covers pass Amazon KDP validation?',
                a: "Yes. Our KDP Template Engine uses Amazon's exact published formulas to calculate spine width, bleed, safe zones, and total dimensions. Every export is validated before download.",
              },
              {
                q: 'Who owns the generated covers?',
                a: 'You do. On paid plans you hold full commercial usage rights to every cover you export.',
              },
              {
                q: 'What payment methods are accepted?',
                a: 'All major credit and debit cards accepted worldwide via Paddle. Secure checkout — no card data ever touches our servers.',
              },
              {
                q: 'Can I cancel anytime?',
                a: 'Yes. Cancel with one click from your billing portal. Your plan stays active until the end of the billing period.',
              },
              {
                q: 'Do you have an affiliate program?',
                a: 'Yes! Earn up to 30% recurring commission for every author you refer. See the Affiliates page for details.',
              },
              {
                q: 'What format does the export come in?',
                a: 'KDP-ready PDF at 300 DPI with exact dimensions, 0.125" bleed on all sides, embedded fonts, and trim marks.',
              },
            ].map(faq => (
              <div key={faq.q} className="border border-gray-800 rounded-xl p-5">
                <p className="text-white font-semibold text-sm mb-2">{faq.q}</p>
                <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  )
}
