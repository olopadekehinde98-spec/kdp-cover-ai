import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import Link from 'next/link'

export const metadata = {
  title: 'About — KDP Cover AI',
  description: 'KDP Cover AI is an AI-powered book cover generator built specifically for Amazon KDP self-publishers.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <SiteHeader />

      <main className="flex-1 max-w-3xl mx-auto px-6 py-16 w-full">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-violet-950/60 border border-violet-800/50 text-violet-300 text-xs font-medium px-3 py-1.5 rounded-full mb-5">
            Built for self-publishers
          </div>
          <h1 className="text-4xl font-black text-white mb-4">About KDP Cover AI</h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            We build tools that give independent authors the same quality as traditional publishers —
            without the price tag.
          </p>
        </div>

        <div className="space-y-10 text-gray-300 text-sm leading-relaxed">

          <section>
            <h2 className="text-white font-bold text-lg mb-3">Why we built this</h2>
            <p>
              Self-publishing on Amazon KDP is hard enough without also being a graphic designer.
              Getting a cover rejected because the spine is 0.01" off — after paying $300 to a designer —
              is the kind of friction that stops authors from publishing their second book.
            </p>
            <p className="mt-3">
              KDP Cover AI exists so you can focus on writing. Enter your book details,
              describe what you want, and get a print-ready PDF in under a minute.
              Exact dimensions. Full-wrap. No rejections.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">What we do differently</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: '📐', title: 'KDP-spec dimensions', desc: "Amazon's exact spine width formulas — not approximations." },
                { icon: '🎨', title: 'Full-wrap generation', desc: 'Front + spine + back as one seamless composition.' },
                { icon: '📄', title: 'Print-ready PDF', desc: '300 DPI, 0.125" bleed, embedded fonts. Upload and go.' },
                { icon: '💡', title: 'Genre intelligence', desc: 'AI understands thriller vs romance vs fantasy typography.' },
              ].map(item => (
                <div key={item.title} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <p className="text-white font-semibold text-sm">{item.title}</p>
                  <p className="text-gray-500 text-xs mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">Our mission</h2>
            <p>
              Every author deserves a professional cover. Not just the ones with big budgets.
              We are building the most accurate and affordable KDP cover tool on the market,
              and we are just getting started.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">Get started</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/sign-up"
                className="inline-flex items-center justify-center bg-violet-600 hover:bg-violet-700 text-white font-bold px-6 py-3 rounded-xl transition text-sm">
                Try Free — 3 Covers, No Card →
              </Link>
              <Link href="/pricing"
                className="inline-flex items-center justify-center bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold px-6 py-3 rounded-xl transition text-sm">
                View Pricing
              </Link>
            </div>
          </section>

          <section className="border-t border-gray-800 pt-8">
            <h2 className="text-white font-bold text-lg mb-3">Contact</h2>
            <p className="text-gray-400">
              Questions, bugs, or business enquiries:{' '}
              <a href="mailto:support@kdpcoverai.com" className="text-violet-400 hover:text-violet-300">
                support@kdpcoverai.com
              </a>
            </p>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
