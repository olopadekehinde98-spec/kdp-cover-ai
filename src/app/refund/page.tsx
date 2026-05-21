import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'

const LAST_UPDATED = 'May 20, 2025'

export const metadata = {
  title: 'Refund Policy — KDP Cover AI',
  description: 'KDP Cover AI refund and cancellation policy.',
}

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <SiteHeader />

      <main className="flex-1 max-w-3xl mx-auto px-6 py-16 w-full">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-white mb-3">Refund Policy</h1>
          <p className="text-gray-500 text-sm">Last updated: {LAST_UPDATED}</p>
        </div>

        {/* Quick summary box */}
        <div className="bg-violet-950/30 border border-violet-700/40 rounded-2xl p-5 mb-10">
          <p className="text-violet-300 font-semibold text-sm mb-2">📌 Summary</p>
          <p className="text-gray-300 text-sm leading-relaxed">
            We offer a <strong className="text-white">7-day money-back guarantee</strong> on your first subscription month.
            No questions asked. After 7 days, subscriptions are non-refundable but you may cancel at any time.
          </p>
        </div>

        <div className="space-y-10 text-gray-300 text-sm leading-relaxed">

          <Section title="1. Money-Back Guarantee">
            <p>
              If you are not satisfied with your first paid subscription, you may request a full refund
              within <strong className="text-white">7 days</strong> of your initial payment.
              This applies to new subscriptions only (Starter, Pro, or Agency plans).
            </p>
            <p>
              To claim your refund, email{' '}
              <a href="mailto:support@kdpcoverai.com" className="text-violet-400 hover:text-violet-300">support@kdpcoverai.com</a>{' '}
              with subject line <strong className="text-white">"Refund Request"</strong> and your account email address.
              We will process it within 3–5 business days.
            </p>
          </Section>

          <Section title="2. Non-Refundable Situations">
            <ul className="list-disc list-inside space-y-2 text-gray-400">
              <li>Refund requests made more than 7 days after initial payment</li>
              <li>Renewal charges (subsequent monthly payments after the first)</li>
              <li>Accounts that have been banned for policy violations</li>
              <li>Partial month refunds (we do not pro-rate)</li>
              <li>Cases where a promotional discount or referral discount was applied</li>
            </ul>
          </Section>

          <Section title="3. Cancellation Policy">
            <p>
              You can cancel your subscription at any time from your billing portal
              (Dashboard → Billing). Cancellation takes effect at the end of your current billing period.
              You continue to have full access until that date.
            </p>
            <p>
              Cancelling does <strong className="text-white">not</strong> automatically trigger a refund.
              If you want both a cancellation and a refund, you must request the refund separately
              within the 7-day window described above.
            </p>
          </Section>

          <Section title="4. Downgrade Policy">
            <p>
              If you downgrade from a higher plan to a lower plan or to Free mid-cycle,
              the change takes effect at the start of your next billing period.
              No credit or refund is issued for the unused portion of the current period.
            </p>
          </Section>

          <Section title="5. Disputed Charges">
            <p>
              If you believe you were charged in error, please contact us before
              filing a chargeback with your bank. We resolve billing disputes quickly and
              chargebacks result in immediate account suspension.
            </p>
            <p>
              Email: <a href="mailto:billing@kdpcoverai.com" className="text-violet-400 hover:text-violet-300">billing@kdpcoverai.com</a>
            </p>
          </Section>

          <Section title="6. Affiliate & Referral Commissions">
            <p>
              Affiliate commissions and referral rewards are reversed if the original
              payment is refunded. Commission payouts are held for 30 days to account
              for refunds and chargebacks.
            </p>
          </Section>

          <Section title="7. How Long Refunds Take">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mt-2">
              <div className="grid grid-cols-2 gap-3 text-xs">
                {[
                  { step: 'You email us', time: 'Any time within 7 days' },
                  { step: 'We confirm', time: '1–2 business days' },
                  { step: 'Paddle issues refund', time: '3–5 business days' },
                  { step: 'Credit appears on your statement', time: '5–10 business days (bank dependent)' },
                ].map(r => (
                  <div key={r.step}>
                    <p className="text-white font-medium">{r.step}</p>
                    <p className="text-gray-500">{r.time}</p>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          <Section title="8. Contact">
            <p>
              For any refund or billing questions:{' '}
              <a href="mailto:support@kdpcoverai.com" className="text-violet-400 hover:text-violet-300">
                support@kdpcoverai.com
              </a>
            </p>
          </Section>

        </div>
      </main>

      <SiteFooter />
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-white font-bold text-lg mb-3">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  )
}
