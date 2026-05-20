import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'

const LAST_UPDATED = 'May 20, 2025'

export const metadata = {
  title: 'Terms of Service — KDP Cover AI',
  description: 'Terms and conditions for using KDP Cover AI.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <SiteHeader />

      <main className="flex-1 max-w-3xl mx-auto px-6 py-16 w-full">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-white mb-3">Terms of Service</h1>
          <p className="text-gray-500 text-sm">Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="space-y-10 text-gray-300 text-sm leading-relaxed">

          <Section title="1. Acceptance of Terms">
            <p>
              By creating an account or using KDP Cover AI, you agree to be bound by these Terms of Service
              and our Privacy Policy. If you do not agree, do not use the service.
              These terms apply to all users including free, paid, and affiliate users.
            </p>
          </Section>

          <Section title="2. Description of Service">
            <p>
              KDP Cover AI is an AI-powered book cover generation tool designed for Amazon KDP
              self-publishers. We generate full-wrap print-ready PDF covers (front, spine, back)
              based on user inputs. The service is provided &quot;as is&quot; and features may change
              without notice.
            </p>
          </Section>

          <Section title="3. Account Registration">
            <ul className="list-disc list-inside space-y-2 text-gray-400">
              <li>You must be 18 years or older to create an account</li>
              <li>You are responsible for maintaining the security of your account</li>
              <li>One account per person — multi-account abuse will result in bans</li>
              <li>You must provide accurate information during sign-up</li>
              <li>You may not share account credentials or resell account access</li>
            </ul>
          </Section>

          <Section title="4. Intellectual Property & Content Rights">
            <div className="space-y-3">
              <p><strong className="text-white">Free plan:</strong> Covers include a watermark. You may use covers for personal/non-commercial purposes only.</p>
              <p><strong className="text-white">Paid plans (Starter, Pro, Agency):</strong> You own full commercial rights to covers you export. You may use them on Amazon KDP, other platforms, and for resale.</p>
              <p><strong className="text-white">Restrictions:</strong> You may not claim that AI-generated artwork is your own original artwork in competitions or contexts where AI origin is relevant. You may not use the covers to create content that is illegal, hateful, or violates third-party rights.</p>
              <p><strong className="text-white">Our rights:</strong> KDP Cover AI retains rights to the platform, technology, and service. We do not claim ownership of your specific exported covers.</p>
            </div>
          </Section>

          <Section title="5. Prohibited Uses">
            <p>You may not use KDP Cover AI to:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-400 mt-2">
              <li>Generate content that is pornographic, violent, hateful, or illegal</li>
              <li>Infringe on copyrights, trademarks, or third-party intellectual property</li>
              <li>Abuse the generation system with automated scripts or bots</li>
              <li>Attempt to reverse-engineer, scrape, or exploit the platform</li>
              <li>Circumvent usage limits using multiple accounts</li>
              <li>Resell or redistribute the platform itself</li>
            </ul>
            <p className="mt-3">Violations may result in immediate account suspension without refund.</p>
          </Section>

          <Section title="6. Subscriptions & Billing">
            <ul className="list-disc list-inside space-y-2 text-gray-400">
              <li>Subscriptions are billed monthly in advance via Lemon Squeezy</li>
              <li>Prices are shown in USD and include applicable taxes where required</li>
              <li>You may cancel at any time — access continues until the end of your billing period</li>
              <li>We reserve the right to change pricing with 30 days notice</li>
              <li>Failed payments may result in plan downgrade to Free after a grace period</li>
            </ul>
          </Section>

          <Section title="7. Referral Program">
            <ul className="list-disc list-inside space-y-2 text-gray-400">
              <li>Each user receives a unique referral code upon account creation</li>
              <li>When a referred user subscribes, the referrer earns a 10% commission for the first month of that subscription</li>
              <li>The referred user receives 10% off their first month&apos;s subscription</li>
              <li>Referral commissions are paid via PayPal within 30 days of the referred user&apos;s first successful payment</li>
              <li>Self-referrals (referring yourself) are strictly prohibited and will result in account termination</li>
              <li>We reserve the right to cancel referral rewards in cases of fraud or abuse</li>
            </ul>
          </Section>

          <Section title="8. Affiliate Program">
            <p>
              The affiliate program is governed by separate Affiliate Program Terms available on
              the <a href="/affiliate" className="text-violet-400 hover:text-violet-300">Affiliates page</a>.
              Participating affiliates must comply with both these Terms and the Affiliate Terms.
            </p>
          </Section>

          <Section title="9. Disclaimer of Warranties">
            <p>
              THE SERVICE IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED.
              We do not guarantee that covers will be accepted by Amazon KDP in every case, as Amazon&apos;s
              requirements may change. We do not guarantee uptime, accuracy of AI outputs, or
              fitness for a particular purpose.
            </p>
          </Section>

          <Section title="10. Limitation of Liability">
            <p>
              To the maximum extent permitted by law, KDP Cover AI shall not be liable for
              indirect, incidental, or consequential damages including lost profits, data loss,
              or KDP submission rejections. Our total liability is limited to the amount you paid
              us in the 3 months preceding the claim.
            </p>
          </Section>

          <Section title="11. Termination">
            <p>
              We may suspend or terminate your account at any time for violations of these Terms.
              You may delete your account at any time from your account settings.
              Upon termination, your access to generated covers is revoked, though you keep any
              files you have already downloaded.
            </p>
          </Section>

          <Section title="12. Governing Law">
            <p>
              These Terms are governed by applicable law. Any disputes shall be resolved through
              binding arbitration rather than in court, except for small claims.
            </p>
          </Section>

          <Section title="13. Contact">
            <p>
              Questions about these Terms? Email us at{' '}
              <a href="mailto:legal@kdpcoverai.com" className="text-violet-400 hover:text-violet-300">legal@kdpcoverai.com</a>.
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
