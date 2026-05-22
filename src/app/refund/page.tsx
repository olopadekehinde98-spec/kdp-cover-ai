import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'

const LAST_UPDATED = 'May 2026'

export const metadata = {
  title: 'Refund Policy — KDP Cover AI',
  description: 'KDP Cover AI refund policy for manual bank transfer payments (Grey/OPay).',
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

        <div className="bg-violet-950/30 border border-violet-700/40 rounded-2xl p-5 mb-10">
          <p className="text-violet-300 font-semibold text-sm mb-2">Summary</p>
          <p className="text-gray-300 text-sm leading-relaxed">
            KDP Cover AI processes payments via manual bank transfers (Grey Dollar or OPay Naira).
            Refunds are reviewed within <strong className="text-white">48 hours</strong> and issued within{' '}
            <strong className="text-white">7 business days</strong> — but only if your plan has not yet been
            activated and you have not generated any covers.
          </p>
        </div>

        <div className="space-y-10 text-gray-300 text-sm leading-relaxed">

          <Section title="1. How We Process Payments">
            <p>
              KDP Cover AI does not use Stripe, PayPal, or other automated processors.
              All payments are made via manual bank transfer to either:
            </p>
            <ul className="list-disc list-inside space-y-1.5 mt-2 text-gray-400">
              <li><strong className="text-white">Grey Dollar (Lead Bank)</strong> — USD transfers for international users</li>
              <li><strong className="text-white">OPay Naira</strong> — NGN transfers at ₦1,370 per $1</li>
            </ul>
            <p className="mt-3">
              After you submit your payment proof, our admin reviews it manually and upgrades your plan.
              This review typically happens within 24–48 hours.
            </p>
          </Section>

          <Section title="2. Refund Eligibility">
            <p>You may be eligible for a refund if:</p>
            <ul className="list-disc list-inside space-y-1.5 mt-2 text-gray-400">
              <li>Your plan has <strong className="text-white">not yet been activated</strong> (still pending review)</li>
              <li>You request the refund within <strong className="text-white">48 hours</strong> of your payment</li>
              <li>You have <strong className="text-white">not generated any covers</strong> using the paid plan</li>
            </ul>
          </Section>

          <Section title="3. No Refund After Plan Activation">
            <p>
              Once your plan has been activated and you have used any cover generations on a paid plan,
              refunds will <strong className="text-white">not</strong> be issued. This includes partial refunds.
            </p>
            <p className="mt-3">
              If you downgrade or cancel, your current plan remains active until the end of the billing cycle.
              No credit is issued for unused time.
            </p>
          </Section>

          <Section title="4. Partial Refunds for Technical Issues">
            <p>
              If a technical fault on our end prevents you from generating covers after your plan is activated,
              we will review your case and may offer a partial refund or an extended plan period as compensation.
              Contact support with your cover ID and a description of the issue.
            </p>
          </Section>

          <Section title="5. How to Request a Refund">
            <p>
              To request a refund, use the support chat widget at the bottom-right of any page.
              Alternatively, open a support ticket at{' '}
              <a href="/support" className="text-violet-400 hover:text-violet-300">kdpcoverai.com/support</a>.
            </p>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mt-3">
              <p className="text-white font-medium text-sm mb-2">Include in your request:</p>
              <ul className="list-disc list-inside space-y-1.5 text-gray-400 text-xs">
                <li>Your account email address</li>
                <li>The amount transferred and which bank you used</li>
                <li>Date of payment</li>
                <li>Reason for refund</li>
              </ul>
            </div>
          </Section>

          <Section title="6. Refund Timeline">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mt-2">
              <div className="grid grid-cols-2 gap-3 text-xs">
                {[
                  { step: 'Submit refund request via support chat', time: 'Any time within 48 hours' },
                  { step: 'Admin reviews your case', time: 'Within 48 hours' },
                  { step: 'Refund initiated (same bank used)', time: '2–7 business days' },
                  { step: 'Credit appears in your account', time: 'Depends on your bank' },
                ].map(r => (
                  <div key={r.step}>
                    <p className="text-white font-medium">{r.step}</p>
                    <p className="text-gray-500">{r.time}</p>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          <Section title="7. Affiliate Commission Reversals">
            <p>
              If a refund is issued, any affiliate commission earned from that payment will be reversed.
              Commission payouts are held for 30 days to account for refunds.
            </p>
          </Section>

          <Section title="8. Abuse Policy">
            <p>
              Accounts that repeatedly request refunds after activating plans, or that show signs of
              fraudulent activity (multiple accounts, fake payments), will be permanently banned without refund.
            </p>
          </Section>

          <Section title="9. Contact">
            <p>
              For refund inquiries, use the support chat on this site or email:{' '}
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
