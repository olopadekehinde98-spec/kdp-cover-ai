import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import Link from 'next/link'

export const metadata = {
  title: 'Help Center — KDP Cover AI',
  description: 'Answers to common questions about KDP Cover AI.',
}

const SECTIONS = [
  {
    id: 'getting-started',
    icon: '🚀',
    title: 'Getting Started',
    faqs: [
      {
        q: 'How do I generate my first cover?',
        a: "Sign up (it's free — no credit card needed). You get 3 free covers. Click \"New Cover\" in your dashboard, enter your book details and trim size, type a prompt describing the look you want, then click Generate. Your full-wrap PDF is ready in under 60 seconds.",
      },
      {
        q: 'What is a full-wrap cover?',
        a: 'A full-wrap cover includes the front cover, spine, and back cover as one continuous print-ready image — exactly what KDP requires for paperback upload. All three panels are calculated from your trim size and page count automatically.',
      },
      {
        q: 'What trim sizes are supported?',
        a: 'All major Amazon KDP trim sizes: 5×8, 5.5×8.5, 6×9, 6.14×9.21, 7×10, 8×10, 8.5×11 — for both paperback and hardcover. We calculate spine width automatically based on your page count and paper type.',
      },
      {
        q: 'Do I need design experience?',
        a: 'None at all. Just type a description of what you want (e.g. "dark psychological thriller, red smoke, abandoned city"). The AI handles the design, typography, layout, and dimension math.',
      },
    ],
  },
  {
    id: 'cover-generation',
    icon: '🎨',
    title: 'Cover Generation',
    faqs: [
      {
        q: 'Can I regenerate the same cover with a small change?',
        a: "Yes. When viewing a cover in History, click \"Regenerate\" to open the generator pre-filled with all your original settings. Change only what you want (e.g. swap the font style or change the background color in the prompt) and generate again. The rest stays the same.",
      },
      {
        q: 'How do I change just the background color?',
        a: 'In your prompt, specify the color: e.g. \"dark blue background with red smoke\" or \"midnight blue background, gold typography\". You can also re-open the generator from History with your existing settings and adjust just the prompt.',
      },
      {
        q: 'What font styles are available?',
        a: 'Six styles are available: Bold Modern (Helvetica Bold), Classic Serif (Times Roman Bold), Elegant Italic (Times Roman Bold Italic), Serif Light (Times Roman Italic), Modern Slanted (Helvetica Bold Oblique), and Typewriter (Courier Bold). Select one in Step 2 of the generator.',
      },
      {
        q: 'Can I add a review quote to the back cover?',
        a: 'Yes. In Step 2 of the generator, there is a "Review Quote" field. Enter the quote text and the attribution (reviewer name / publication). It appears in gold italic on the back cover.',
      },
      {
        q: 'Can I add a barcode?',
        a: 'Yes. Enter your ISBN-13 in Step 2 and the barcode is generated and placed in the KDP-required position on the back cover. KDP also adds its own barcode if you leave the space blank, so this is optional.',
      },
      {
        q: 'Why does the AI image sometimes not match my prompt exactly?',
        a: 'AI image generation is probabilistic — the same prompt can produce different results each time. If you\'re not happy with the image, regenerate with a more specific prompt (add colors, mood, specific objects). Our prompt enhancer automatically improves your description before sending it to the image model.',
      },
    ],
  },
  {
    id: 'exporting',
    icon: '📄',
    title: 'Exporting & KDP Upload',
    faqs: [
      {
        q: 'Will my cover be accepted by KDP without rejection?',
        a: 'Our engine uses Amazon\'s exact published formulas for dimensions, spine width, and bleed. Every export is validated before download. The vast majority of users upload successfully on the first try. However, Amazon occasionally changes requirements — if you get rejected, contact support immediately.',
      },
      {
        q: 'What are the export specs?',
        a: '300 DPI resolution, 0.125" bleed on all sides, embedded fonts, full CMYK-compatible color space, trim marks, and exact dimensions calculated from your trim size + page count. Exported as a print-ready PDF.',
      },
      {
        q: 'Free plan covers have a watermark — where is it?',
        a: 'A small semi-transparent "KDP Cover AI" watermark appears on the free plan export. Upgrade to any paid plan to remove it.',
      },
      {
        q: 'How do I re-download a cover I generated before?',
        a: 'Go to History in your dashboard. Every cover you have generated is saved. Click the download button on any cover to re-export it as a fresh PDF.',
      },
    ],
  },
  {
    id: 'billing',
    icon: '💳',
    title: 'Billing & Plans',
    faqs: [
      {
        q: 'What are the plan prices?',
        a: 'Starter: $9/month (15 covers). Pro: $29/month (unlimited). Agency: $79/month (unlimited + team + priority). All paid plans include KDP-ready PDF export with no watermark and commercial use rights.',
      },
      {
        q: 'How do I upgrade my plan?',
        a: 'Go to the Pricing page and click the plan you want. You will be taken to a secure Paddle checkout. Your plan upgrades instantly after payment.',
      },
      {
        q: 'Can I cancel anytime?',
        a: "Yes. Cancel from your billing portal (link in your dashboard). Your plan stays active until the end of the billing period — no pro-rating, no cancellation fees.",
      },
      {
        q: 'Do you offer refunds?',
        a: "Yes — 7-day money-back guarantee on your first subscription. See our Refund Policy for full details.",
      },
      {
        q: 'What payment methods are accepted?',
        a: 'All major credit/debit cards and many local payment methods via Paddle. Payments are accepted in 200+ currencies. We never see your raw card data.',
      },
    ],
  },
  {
    id: 'referral',
    icon: '🎁',
    title: 'Referral Program',
    faqs: [
      {
        q: 'How does the referral program work?',
        a: 'Every KDP Cover AI user gets a unique referral code (found in your dashboard → Referrals). Share your code with other authors. When they sign up and subscribe using your code, they get 10% off their first month — and you earn 10% of their first month\'s payment.',
      },
      {
        q: 'When do I get paid my referral commission?',
        a: 'Referral commissions are paid via PayPal within 30 days of your referred user\'s first successful payment. The minimum payout is $5. Commissions are reversed if the referred user refunds.',
      },
      {
        q: 'Is there a limit to how many people I can refer?',
        a: 'No limit. Refer as many people as you want. Each valid referral earns you 10% of their first month.',
      },
      {
        q: 'What is the difference between the referral program and the affiliate program?',
        a: 'The referral program is for all users — share your code, earn once per referral. The affiliate program is for marketers and publishers — higher ongoing commissions (8–30% recurring monthly) based on your active paying user count. See the Affiliates page for details.',
      },
    ],
  },
  {
    id: 'affiliate',
    icon: '💰',
    title: 'Affiliate Program',
    faqs: [
      {
        q: 'How does the affiliate commission work?',
        a: 'Affiliates earn recurring monthly commissions on every subscriber they refer. Commission rates are tiered based on your total active paying referrals and differ by plan: Starter earns 8–18%, Pro earns 10–30%, Agency earns 8–25%. See the full commission matrix on the Affiliates page.',
      },
      {
        q: 'When and how are affiliates paid?',
        a: 'Commissions are paid on the 15th of every month via PayPal for the previous month\'s approved commissions. Minimum payout is $20. Commissions are held for 30 days to account for refunds.',
      },
      {
        q: 'What is the cookie duration?',
        a: '60 days. If someone clicks your affiliate link and subscribes within 60 days, you earn the commission.',
      },
      {
        q: 'How do I join the affiliate program?',
        a: 'Create a KDP Cover AI account (free), then find your affiliate link in your dashboard. Share it in self-publishing communities, YouTube, TikTok, newsletters — wherever authors hang out.',
      },
    ],
  },
  {
    id: 'account',
    icon: '⚙️',
    title: 'Account & Security',
    faqs: [
      {
        q: 'How do I change my email or password?',
        a: 'Authentication is handled by Clerk. Click your name/avatar in the dashboard and go to Account Settings to update your email or password.',
      },
      {
        q: 'How do I delete my account?',
        a: 'Email support@kdpcoverai.com with subject "Delete Account". We will permanently delete your account and all associated data within 30 days.',
      },
      {
        q: 'My account is banned — what do I do?',
        a: 'If you believe your account was banned in error, email support@kdpcoverai.com. Please include your account email and the reason you believe the ban is incorrect.',
      },
    ],
  },
]

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gray-900 border-b border-gray-800 py-16 px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Help Center</h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto mb-8">
            Everything you need to know about generating KDP covers, billing, affiliates, and referrals.
          </p>
          {/* Contact shortcut */}
          <div className="inline-flex items-center gap-3 bg-gray-800 border border-gray-700 rounded-2xl px-5 py-3 text-sm">
            <span className="text-gray-400">Can&apos;t find an answer?</span>
            <a href="mailto:support@kdpcoverai.com"
              className="text-violet-400 hover:text-violet-300 font-semibold transition">
              Email Support →
            </a>
          </div>
        </section>

        {/* Quick nav */}
        <section className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex flex-wrap gap-2">
            {SECTIONS.map(s => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="flex items-center gap-1.5 bg-gray-900 border border-gray-800 hover:border-gray-600 text-gray-300 hover:text-white text-xs font-medium px-3 py-1.5 rounded-full transition">
                <span>{s.icon}</span> {s.title}
              </a>
            ))}
          </div>
        </section>

        {/* FAQ sections */}
        <section className="max-w-4xl mx-auto px-6 pb-20 space-y-16">
          {SECTIONS.map(section => (
            <div key={section.id} id={section.id}>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">{section.icon}</span>
                <h2 className="text-2xl font-bold text-white">{section.title}</h2>
              </div>
              <div className="space-y-4">
                {section.faqs.map(faq => (
                  <details
                    key={faq.q}
                    className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden group">
                    <summary className="px-6 py-4 cursor-pointer text-white font-medium text-sm flex items-center justify-between list-none hover:bg-gray-800/50 transition">
                      {faq.q}
                      <svg className="w-4 h-4 text-gray-500 flex-shrink-0 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="px-6 pb-5 pt-1 text-gray-400 text-sm leading-relaxed border-t border-gray-800">
                      {faq.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* Still need help */}
        <section className="bg-gray-900 border-t border-gray-800 py-14 px-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Still need help?</h2>
          <p className="text-gray-400 mb-6 text-sm">
            Our support team is available Monday – Friday, 9am–6pm UTC.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="mailto:support@kdpcoverai.com"
              className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-6 py-3 rounded-xl transition text-sm">
              ✉️ Email Support
            </a>
            <Link href="/affiliate"
              className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold px-6 py-3 rounded-xl transition text-sm">
              💰 View Affiliate Program
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
