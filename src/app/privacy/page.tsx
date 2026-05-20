import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'

const LAST_UPDATED = 'May 20, 2025'

export const metadata = {
  title: 'Privacy Policy — KDP Cover AI',
  description: 'How KDP Cover AI collects, uses, and protects your personal information.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <SiteHeader />

      <main className="flex-1 max-w-3xl mx-auto px-6 py-16 w-full">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-black text-white mb-3">Privacy Policy</h1>
          <p className="text-gray-500 text-sm">Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="prose-dark space-y-10 text-gray-300 text-sm leading-relaxed">

          <Section title="1. Who We Are">
            <p>
              KDP Cover AI (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is an AI-powered book cover generation
              service for Amazon KDP self-publishers. We are operated as an independent SaaS product.
              Our website is <a href="https://kdp-cover-ai.vercel.app" className="text-violet-400 hover:text-violet-300">kdp-cover-ai.vercel.app</a>.
            </p>
            <p>Contact us at: <a href="mailto:support@kdpcoverai.com" className="text-violet-400 hover:text-violet-300">support@kdpcoverai.com</a></p>
          </Section>

          <Section title="2. What Information We Collect">
            <SubTitle>Information you provide:</SubTitle>
            <ul className="list-disc list-inside space-y-1 text-gray-400 mt-2">
              <li>Email address and name (required to create an account)</li>
              <li>Book details you enter (title, genre, description, author name)</li>
              <li>Custom prompts and image generation inputs</li>
              <li>Payment information (processed by Lemon Squeezy — we never see raw card data)</li>
              <li>Support messages you send us</li>
            </ul>
            <SubTitle>Information collected automatically:</SubTitle>
            <ul className="list-disc list-inside space-y-1 text-gray-400 mt-2">
              <li>IP address, browser type, and device information</li>
              <li>Pages visited and actions taken within the app</li>
              <li>Session identifiers and authentication tokens (via Clerk)</li>
              <li>Referral codes used when signing up</li>
            </ul>
          </Section>

          <Section title="3. How We Use Your Information">
            <ul className="list-disc list-inside space-y-2 text-gray-400">
              <li>To create and manage your account</li>
              <li>To generate book covers and export PDFs as requested</li>
              <li>To process payments and manage subscriptions</li>
              <li>To track usage limits and enforce plan restrictions</li>
              <li>To calculate and pay affiliate and referral commissions</li>
              <li>To send transactional emails (receipts, usage alerts)</li>
              <li>To respond to support requests</li>
              <li>To improve our AI models and platform performance</li>
            </ul>
          </Section>

          <Section title="4. Third-Party Services">
            <p>We share data with trusted third parties only as necessary to operate the service:</p>
            <div className="mt-4 space-y-3">
              {[
                { name: 'Clerk', purpose: 'Authentication & user management', link: 'https://clerk.com/privacy' },
                { name: 'Lemon Squeezy', purpose: 'Payment processing & subscription billing', link: 'https://www.lemonsqueezy.com/privacy' },
                { name: 'OpenAI', purpose: 'AI back cover description generation', link: 'https://openai.com/privacy' },
                { name: 'Pollinations AI', purpose: 'Cover image generation', link: 'https://pollinations.ai' },
                { name: 'Neon / PostgreSQL', purpose: 'Database hosting', link: 'https://neon.tech/privacy' },
                { name: 'Vercel', purpose: 'Application hosting & edge network', link: 'https://vercel.com/legal/privacy-policy' },
              ].map(tp => (
                <div key={tp.name} className="flex gap-3">
                  <span className="text-violet-400 font-medium min-w-[140px] text-xs">{tp.name}</span>
                  <span className="text-gray-400 text-xs">{tp.purpose} — <a href={tp.link} target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline">Privacy Policy</a></span>
                </div>
              ))}
            </div>
          </Section>

          <Section title="5. Data Storage & Security">
            <p>
              Your data is stored on Neon PostgreSQL servers in the United States.
              We use HTTPS/TLS encryption for all data transmission.
              Passwords are never stored — authentication is handled by Clerk.
              Generated cover images are stored as Base64 in our database and are only accessible to you.
            </p>
          </Section>

          <Section title="6. Cookies">
            <p>
              We use strictly necessary cookies for authentication (session tokens via Clerk).
              We do not use advertising cookies or tracking pixels. We use anonymous analytics
              to understand platform usage. You may disable non-essential cookies in your browser
              without affecting core functionality.
            </p>
          </Section>

          <Section title="7. Your Rights">
            <ul className="list-disc list-inside space-y-2 text-gray-400">
              <li><strong className="text-white">Access</strong> — request a copy of all data we hold about you</li>
              <li><strong className="text-white">Correction</strong> — correct inaccurate personal data</li>
              <li><strong className="text-white">Deletion</strong> — request deletion of your account and all associated data</li>
              <li><strong className="text-white">Portability</strong> — receive your cover data in a machine-readable format</li>
              <li><strong className="text-white">Opt-out</strong> — unsubscribe from marketing emails at any time</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, email <a href="mailto:privacy@kdpcoverai.com" className="text-violet-400 hover:text-violet-300">privacy@kdpcoverai.com</a>.
              We will respond within 30 days.
            </p>
          </Section>

          <Section title="8. Data Retention">
            <p>
              We retain your account data for as long as your account is active.
              If you delete your account, we will permanently delete your data within 30 days,
              except where required by law (e.g. billing records kept for 7 years for tax purposes).
            </p>
          </Section>

          <Section title="9. Children's Privacy">
            <p>
              KDP Cover AI is not directed at children under 13. We do not knowingly
              collect personal information from children. If you believe a child has provided
              us with personal information, please contact us immediately.
            </p>
          </Section>

          <Section title="10. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. When we make material changes,
              we will notify you by email and update the &quot;last updated&quot; date above.
              Continued use of the service after changes constitutes acceptance.
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

function SubTitle({ children }: { children: React.ReactNode }) {
  return <p className="text-white font-semibold mt-4 mb-1 text-sm">{children}</p>
}
