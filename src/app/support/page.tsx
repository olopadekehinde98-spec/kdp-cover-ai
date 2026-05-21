import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import Link from 'next/link'

export const metadata = {
  title: 'Support — KDP Cover AI',
  description: 'Get help with KDP Cover AI. Contact our support team or browse common solutions.',
}

const QUICK_LINKS = [
  {
    icon: '📄',
    title: 'Refund Policy',
    desc: '7-day money-back guarantee. How to request a refund.',
    href: '/refund',
    cta: 'Read policy →',
  },
  {
    icon: '❓',
    title: 'Help Center',
    desc: 'FAQs covering generation, export, billing, and affiliates.',
    href: '/help',
    cta: 'Browse FAQs →',
  },
  {
    icon: '💳',
    title: 'Billing Portal',
    desc: 'Cancel, upgrade, or download invoices from your plan.',
    href: '/dashboard',
    cta: 'Go to dashboard →',
  },
  {
    icon: '💰',
    title: 'Affiliate Program',
    desc: 'Earn recurring commissions by referring authors.',
    href: '/affiliate',
    cta: 'Learn more →',
  },
]

const COMMON_ISSUES = [
  {
    q: 'My cover was rejected by KDP',
    a: 'Email us with your cover ID (from History) and the rejection message from KDP. We will re-export with corrected dimensions within 24 hours at no charge.',
  },
  {
    q: 'I was charged but my plan did not upgrade',
    a: 'This can happen if the Paddle webhook is delayed. Wait 5 minutes and refresh. If it still shows FREE, email billing@kdpcoverai.com with your payment receipt.',
  },
  {
    q: 'My generation failed or is stuck',
    a: 'If a generation shows "Failed" or is stuck on "Generating" for more than 2 minutes, your generation credit has NOT been used. Simply try again with the same or adjusted prompt.',
  },
  {
    q: 'I cannot download my export',
    a: 'Try a hard refresh (Ctrl+Shift+R). If the download link is broken, open the cover in History and click "Re-export". If the issue persists, contact support with your cover ID.',
  },
  {
    q: 'I forgot to apply my referral discount',
    a: 'Referral discounts are applied at sign-up via your unique referral link. If you signed up without one, email support within 7 days of your first payment and we will apply the discount manually.',
  },
  {
    q: 'How do I cancel my subscription?',
    a: 'Go to Dashboard → click "Manage Billing" → Cancel. Your plan stays active until the end of the current billing period. No cancellation fees.',
  },
]

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <SiteHeader />

      <main className="flex-1">

        {/* Hero */}
        <section className="bg-gray-900 border-b border-gray-800 py-16 px-6 text-center">
          <div className="text-4xl mb-4">🛟</div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            Support Center
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto mb-8">
            We typically reply within a few hours. Monday – Friday, 9am – 6pm UTC.
          </p>
          {/* Primary CTA */}
          <a
            href="mailto:support@kdpcoverai.com?subject=Support%20Request"
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-bold px-8 py-4 rounded-2xl transition text-base"
          >
            ✉️ Email Support
          </a>
          <p className="text-gray-600 text-xs mt-3">support@kdpcoverai.com</p>
        </section>

        {/* Quick links */}
        <section className="max-w-5xl mx-auto px-6 py-14">
          <h2 className="text-xl font-bold text-white mb-6">Quick Links</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {QUICK_LINKS.map(l => (
              <Link
                key={l.href}
                href={l.href}
                className="bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-2xl p-5 group transition"
              >
                <div className="text-3xl mb-3">{l.icon}</div>
                <p className="text-white font-semibold text-sm mb-1 group-hover:text-violet-300 transition">{l.title}</p>
                <p className="text-gray-500 text-xs mb-4 leading-relaxed">{l.desc}</p>
                <span className="text-violet-400 text-xs font-medium">{l.cta}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Common issues */}
        <section className="max-w-3xl mx-auto px-6 pb-20">
          <h2 className="text-xl font-bold text-white mb-6">Common Issues</h2>
          <div className="space-y-3">
            {COMMON_ISSUES.map(issue => (
              <details
                key={issue.q}
                className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden group"
              >
                <summary className="px-6 py-4 cursor-pointer text-white font-medium text-sm flex items-center justify-between list-none hover:bg-gray-800/50 transition">
                  {issue.q}
                  <svg
                    className="w-4 h-4 text-gray-500 flex-shrink-0 group-open:rotate-180 transition-transform"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 pb-5 pt-1 text-gray-400 text-sm leading-relaxed border-t border-gray-800">
                  {issue.a}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* Email topic shortcuts */}
        <section className="bg-gray-900 border-t border-gray-800 py-14 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-bold text-white mb-2 text-center">Contact by Topic</h2>
            <p className="text-gray-500 text-sm text-center mb-8">
              Using the right subject line helps us route your ticket faster.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  subject: 'Billing / Refund',
                  email: 'billing@kdpcoverai.com',
                  icon: '💳',
                  desc: 'Charges, upgrades, refunds, invoices',
                },
                {
                  subject: 'Cover Issue',
                  email: 'support@kdpcoverai.com',
                  icon: '🎨',
                  desc: 'Generation failures, KDP rejections, export problems',
                },
                {
                  subject: 'Affiliate / Referral',
                  email: 'support@kdpcoverai.com',
                  icon: '💰',
                  desc: 'Commission questions, payout requests, tracking',
                },
              ].map(t => (
                <a
                  key={t.subject}
                  href={`mailto:${t.email}?subject=${encodeURIComponent(t.subject)}`}
                  className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-2xl p-5 transition group"
                >
                  <div className="text-2xl mb-2">{t.icon}</div>
                  <p className="text-white font-semibold text-sm group-hover:text-violet-300 transition">{t.subject}</p>
                  <p className="text-gray-500 text-xs mt-1 leading-relaxed">{t.desc}</p>
                  <p className="text-violet-400 text-xs mt-3 font-mono">{t.email}</p>
                </a>
              ))}
            </div>
          </div>
        </section>

      </main>

      <SiteFooter />
    </div>
  )
}
