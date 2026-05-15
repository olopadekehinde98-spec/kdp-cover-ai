'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const PLANS = [
  {
    key: 'STARTER',
    name: 'Starter',
    price: 19,
    desc: 'Perfect for new authors',
    features: [
      '15 covers per month',
      'All trim sizes supported',
      'PDF export',
      'Watermark preview',
      'Email support',
    ],
    cta: 'Start Starter',
    highlight: false,
  },
  {
    key: 'PRO',
    name: 'Pro',
    price: 49,
    desc: 'Most popular for serious authors',
    features: [
      'Unlimited cover generation',
      'All trim sizes',
      'KDP-ready PDF export',
      'Commercial use rights',
      'Series branding tools',
      'AI description generator',
      'Priority support',
    ],
    cta: 'Start Pro',
    highlight: true,
  },
  {
    key: 'AGENCY',
    name: 'Agency',
    price: 99,
    desc: 'For publishers & formatters',
    features: [
      'Everything in Pro',
      'Team accounts (up to 5)',
      'Bulk generation queue',
      'Priority rendering',
      'White-label export',
      'Dedicated support channel',
    ],
    cta: 'Start Agency',
    highlight: false,
  },
]

export default function PricingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  async function handleSubscribe(plan: string) {
    setLoading(plan)
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else if (res.status === 401) {
        router.push('/sign-up')
      }
    } catch {
      // silently fail — redirect to sign-up if not authed
      router.push('/sign-up')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">K</div>
          <span className="font-semibold text-white">KDP Cover AI</span>
        </Link>
        <div className="flex gap-4 text-sm">
          <Link href="/sign-in" className="text-gray-400 hover:text-white">Sign In</Link>
          <Link href="/sign-up" className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg transition">Get Started</Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-gray-400 text-xl max-w-2xl mx-auto">
            Start free. Upgrade when you need more. Cancel anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
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
                <h2 className="text-lg font-bold text-white">{plan.name}</h2>
                <p className="text-gray-500 text-sm mt-1">{plan.desc}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-white">${plan.price}</span>
                <span className="text-gray-500 text-sm">/month</span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                    <span className="text-green-400 flex-shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <button onClick={() => handleSubscribe(plan.key)} disabled={loading === plan.key}
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

        {/* Free plan */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 mb-12">
          <div>
            <h3 className="text-white font-semibold text-lg">Start Free</h3>
            <p className="text-gray-400 text-sm mt-1">3 free covers to test the platform. No credit card required.</p>
          </div>
          <Link href="/sign-up"
            className="bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold px-6 py-3 rounded-xl transition whitespace-nowrap">
            Create Free Account →
          </Link>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-5">
            {[
              { q: 'Will my covers pass Amazon KDP validation?', a: 'Yes. Our KDP Template Engine uses Amazon\'s exact published formulas to calculate spine width, bleed, safe zones, and total dimensions. Every export is validated before download.' },
              { q: 'Who owns the generated covers?', a: 'You do. Once you export a cover on a paid plan, you hold full commercial usage rights to that specific output.' },
              { q: 'What AI model do you use?', a: 'We use state-of-the-art image generation APIs (Ideogram, DALL-E 3) selected for their publishing-quality output. You benefit from the best available model at all times.' },
              { q: 'Can I cancel anytime?', a: 'Yes, cancel with one click from your account settings. No penalties, no long-term contracts.' },
              { q: 'What trim sizes are supported?', a: 'All major KDP trim sizes: 5×8, 5.5×8.5, 6×9, 6.14×9.21, 7×10, 8×10, 8.5×11, and more. Paperback and hardcover.' },
              { q: 'What format does the export come in?', a: 'KDP-ready PDF at 300 DPI with exact dimensions, 0.125" bleed on all sides, embedded fonts, and trim marks.' },
            ].map(faq => (
              <div key={faq.q} className="border border-gray-800 rounded-xl p-5">
                <p className="text-white font-semibold text-sm mb-2">{faq.q}</p>
                <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
