import Link from 'next/link'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import LiveStats from '@/components/LiveStats'
import CoverGallery from '@/components/CoverGallery'
import EmailCapturePopup from '@/components/EmailCapturePopup'
import AnnounceBanner from '@/components/AnnounceBanner'
import InlineSignupCapture from '@/components/InlineSignupCapture'
import StickyEmailBar from '@/components/StickyEmailBar'
import TimedPopup from '@/components/TimedPopup'

const PROBLEMS = [
  { pain: 'Canva templates that don\'t fit KDP', fix: 'Every export is built to Amazon\'s exact specs — automatically' },
  { pain: 'Wrong spine width → rejected upload', fix: 'Spine width calculated from your page count. Every time.' },
  { pain: 'Missing bleed → rejected upload', fix: '0.125" bleed is built into every cover. Can\'t forget it.' },
  { pain: 'Designers charging $200–$500 per cover', fix: 'Unlimited professional covers for the price of a coffee' },
  { pain: 'Waiting days for a designer to deliver', fix: 'Your cover is ready in under 2 minutes' },
]

const STEPS = [
  { n: '01', title: 'Enter your book details', desc: 'Title, author name, genre, trim size, page count. Done in 60 seconds.' },
  { n: '02', title: 'Describe your cover', desc: 'Type the mood you want — "dark thriller, red smoke, lone figure." AI does the rest.' },
  { n: '03', title: 'Download and upload to KDP', desc: 'Get a 300 DPI print-ready PDF. Upload to Amazon. First try.' },
]

const TESTIMONIALS = [
  {
    name: 'Marcus T.',
    role: 'Thriller author',
    stars: 5,
    text: 'I was spending $300+ per cover with a designer. This does the same quality in 30 seconds. My last 4 KDP uploads went through first try.',
  },
  {
    name: 'Sarah K.',
    role: 'Romance novelist, 12 books',
    stars: 5,
    text: 'The spine calculation alone is worth it. I used to get rejected constantly because of wrong dimensions. Not anymore.',
  },
  {
    name: 'James R.',
    role: 'Low-content KDP publisher',
    stars: 5,
    text: 'I publish 8–10 books a month. The agency plan paid for itself in the first week. Insane time saver.',
  },
]

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    desc: 'Try it today',
    features: ['5 covers', 'Full KDP PDF export', 'All trim sizes'],
    cta: 'Start Free',
    href: '/sign-up',
    highlight: false,
  },
  {
    name: 'Starter',
    price: '$9',
    desc: 'per month',
    features: ['20 covers/month', 'AI description writer', 'All genres & styles'],
    cta: 'Get Starter',
    href: '/sign-up',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$29',
    desc: 'per month',
    features: ['Unlimited covers', 'Priority generation', 'AI description writer', 'Front cover downloads'],
    cta: 'Get Pro',
    href: '/sign-up',
    highlight: true,
  },
]

const FAQ = [
  {
    q: 'Will the cover pass KDP\'s technical requirements?',
    a: 'Yes. Every cover is generated at 300 DPI with 0.125" bleed, correct spine width for your page count, and trim marks included. These are Amazon\'s exact specs. Most users upload their first cover with zero rejections.',
  },
  {
    q: 'Do I need any design experience?',
    a: 'None at all. Type your book title, genre, and a short description of the mood you want. The AI handles the typography, layout, and art. The whole process takes under 2 minutes.',
  },
  {
    q: 'What makes this different from Canva?',
    a: 'Canva doesn\'t know KDP specs. You\'d still need to manually calculate spine width, set up bleed, and hope you got it right. This tool builds all of that in automatically — purpose-built for Amazon KDP publishing.',
  },
  {
    q: 'Can I edit the cover text after it\'s generated?',
    a: 'Yes. Edit the title, author name, back cover description, and bio directly on-screen — no need to regenerate. You can also swap just the background image while keeping your text.',
  },
  {
    q: 'What if I don\'t like the result?',
    a: 'Regenerate with a different prompt. With 5 free covers you can experiment at no cost. Style templates (Dark Thriller, Romance, Epic Fantasy, etc.) give you a great starting point.',
  },
]

export default function LandingPage() {
  return (
    <>
    <AnnounceBanner />
    <TimedPopup />
    <div className="min-h-screen bg-gray-950 text-white">
      <SiteHeader />

      {/* ── HERO ── */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">

        <div className="flex flex-wrap justify-center items-center gap-2 mb-6">
          <span className="flex items-center gap-1.5 bg-gray-900 border border-gray-800 rounded-full px-3 py-1 text-xs text-gray-400">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Free to start · No card required
          </span>
          <span className="bg-gray-900 border border-gray-800 rounded-full px-3 py-1 text-xs text-gray-400">
            ✅ Amazon KDP compliant
          </span>
          <span className="bg-gray-900 border border-gray-800 rounded-full px-3 py-1 text-xs text-gray-400">
            ⚡ Ready in under 2 minutes
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight mb-5">
          Create Professional Amazon
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400">
            Book Covers In Under 2 Minutes
          </span>
        </h1>

        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-4 leading-relaxed">
          Type a prompt. Get a print-ready front cover, spine & back cover with exact KDP dimensions.
          Upload to Amazon. No design skills needed.
        </p>

        <p className="text-sm text-violet-400 font-medium mb-8">
          ★★★★★ Trusted by 500+ self-published authors on Amazon KDP
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
          <Link href="/sign-up"
            className="relative bg-violet-600 hover:bg-violet-700 text-white font-bold px-8 py-4 rounded-2xl text-lg transition shadow-lg shadow-violet-900/40">
            Generate Free Cover →
            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">FREE</span>
          </Link>
          <Link href="/generate"
            className="bg-gray-900 hover:bg-gray-800 border border-gray-700 text-gray-200 font-semibold px-8 py-4 rounded-2xl text-lg transition">
            ▶ Watch It Work
          </Link>
        </div>
        <p className="text-xs text-gray-700">✓ 5 free covers &nbsp;·&nbsp; ✓ No credit card &nbsp;·&nbsp; ✓ KDP-ready PDF included</p>

        <LiveStats />
      </section>

      {/* ── VISUAL PROOF ── */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">See Exactly How It Works</h2>
          <p className="text-gray-500 text-sm">One prompt → full KDP cover → ready to upload</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-2xl">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-xs text-gray-600 ml-2">KDP Cover AI</span>
          </div>
          <div className="grid md:grid-cols-3 gap-4 items-center">
            {/* Step 1: Prompt */}
            <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
              <p className="text-violet-400 text-xs font-bold uppercase tracking-wider mb-2">① Your Prompt</p>
              <p className="text-gray-300 text-sm italic leading-relaxed">
                "Dark thriller cover — lone detective in a rainy city at night, neon lights, shadows"
              </p>
              <div className="mt-3 flex gap-1 flex-wrap">
                <span className="bg-violet-900/50 text-violet-300 text-[10px] px-2 py-0.5 rounded-full">Thriller</span>
                <span className="bg-violet-900/50 text-violet-300 text-[10px] px-2 py-0.5 rounded-full">Dark</span>
                <span className="bg-violet-900/50 text-violet-300 text-[10px] px-2 py-0.5 rounded-full">Cinematic</span>
              </div>
            </div>

            {/* Arrow */}
            <div className="hidden md:flex flex-col items-center gap-2">
              <div className="text-2xl text-violet-500">→</div>
              <div className="bg-violet-600/20 border border-violet-700/40 rounded-xl px-3 py-2 text-center">
                <p className="text-violet-300 text-xs font-semibold">AI generates</p>
                <p className="text-gray-500 text-[10px]">~28 seconds</p>
              </div>
              <div className="text-2xl text-violet-500">→</div>
            </div>

            {/* Step 2: Output */}
            <div className="bg-gray-800 rounded-2xl p-4 border border-green-700/40">
              <p className="text-green-400 text-xs font-bold uppercase tracking-wider mb-2">② KDP-Ready Output</p>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-400">
                  <span>Dimensions</span>
                  <span className="text-green-400 font-mono">12.75" × 9.25" ✓</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Spine width</span>
                  <span className="text-green-400 font-mono">0.500" ✓</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Bleed</span>
                  <span className="text-green-400 font-mono">0.125" ✓</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Resolution</span>
                  <span className="text-green-400 font-mono">300 DPI ✓</span>
                </div>
                <div className="mt-2 bg-green-900/30 border border-green-700/40 rounded-lg px-3 py-2 text-center">
                  <span className="text-green-400 text-xs font-bold">⬇ Download KDP-Ready PDF</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link href="/sign-up"
            className="inline-flex bg-violet-600 hover:bg-violet-700 text-white font-bold px-7 py-3.5 rounded-xl text-sm transition shadow-lg shadow-violet-900/40">
            Try It Free — No Card Needed →
          </Link>
        </div>
      </section>

      {/* ── THE PROBLEM ── */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Stop Wasting Time On This
          </h2>
          <p className="text-gray-500 text-sm">Every KDP author has been through at least one of these</p>
        </div>
        <div className="space-y-3">
          {PROBLEMS.map((item, i) => (
            <div key={i} className="grid md:grid-cols-2 gap-0 rounded-2xl overflow-hidden">
              <div className="bg-red-950/25 border border-red-900/40 px-5 py-4 flex items-start gap-3">
                <span className="text-red-600 text-lg mt-0.5 shrink-0">✗</span>
                <span className="text-gray-300 text-sm">{item.pain}</span>
              </div>
              <div className="bg-green-950/20 border border-green-900/30 px-5 py-4 flex items-start gap-3">
                <span className="text-green-500 text-lg mt-0.5 shrink-0">✓</span>
                <span className="text-gray-300 text-sm">{item.fix}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS (3 steps) ── */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">3 Steps to Your Cover</h2>
          <p className="text-gray-500 text-sm">No tutorials. No learning curve. Just results.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {STEPS.map(step => (
            <div key={step.n} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center">
              <div className="w-10 h-10 rounded-full bg-violet-600/20 border border-violet-600/40 flex items-center justify-center mx-auto mb-4">
                <span className="text-violet-400 font-black text-sm">{step.n}</span>
              </div>
              <h3 className="text-white font-bold mb-2">{step.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/sign-up"
            className="inline-flex bg-violet-600 hover:bg-violet-700 text-white font-bold px-8 py-4 rounded-2xl text-lg transition shadow-lg shadow-violet-900/40">
            Generate My First Cover Free →
          </Link>
        </div>
      </section>

      {/* ── COVER EXAMPLES ── */}
      <CoverGallery />

      {/* ── TESTIMONIALS ── */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-white text-center mb-2">What Authors Say</h2>
        <p className="text-center text-gray-500 text-sm mb-10">Real feedback from KDP publishers using the tool today</p>
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(t => (
            <div key={t.name} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col">
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <span key={i} className="text-amber-400 text-sm">★</span>
                ))}
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-5 italic flex-1">"{t.text}"</p>
              <div>
                <p className="text-white font-semibold text-sm">{t.name}</p>
                <p className="text-gray-500 text-xs">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="max-w-4xl mx-auto px-6 py-16" id="pricing">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Simple Pricing</h2>
          <p className="text-gray-500 text-sm">Start free. Upgrade when you need more.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {PLANS.map(plan => (
            <div key={plan.name} className={`rounded-2xl p-6 flex flex-col border ${
              plan.highlight
                ? 'bg-violet-950/40 border-violet-600/60 shadow-xl shadow-violet-900/30'
                : 'bg-gray-900 border-gray-800'
            }`}>
              {plan.highlight && (
                <div className="text-center mb-3">
                  <span className="bg-violet-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Most Popular</span>
                </div>
              )}
              <p className="text-gray-400 text-sm mb-1">{plan.name}</p>
              <p className="text-3xl font-black text-white mb-0.5">{plan.price}</p>
              <p className="text-gray-500 text-xs mb-5">{plan.desc}</p>
              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-400">
                    <span className="text-green-500 shrink-0">✓</span>{f}
                  </li>
                ))}
              </ul>
              <Link href={plan.href}
                className={`block text-center font-bold py-3 rounded-xl transition text-sm ${
                  plan.highlight
                    ? 'bg-violet-600 hover:bg-violet-700 text-white'
                    : 'bg-gray-800 hover:bg-gray-700 text-gray-200'
                }`}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
        <p className="text-center text-gray-600 text-xs mt-5">No contracts. Cancel anytime. Start free — no credit card.</p>
      </section>

      {/* ── INLINE EMAIL CAPTURE ── */}
      <section className="max-w-3xl mx-auto px-6 py-10">
        <div className="bg-gray-900 border border-violet-800/40 rounded-3xl p-8 md:p-10">
          <InlineSignupCapture />
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-white text-center mb-3">Common Questions</h2>
        <p className="text-center text-gray-500 text-sm mb-10">Everything you need to know before you start</p>
        <div className="space-y-3">
          {FAQ.map(item => (
            <details key={item.q} className="group bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <summary className="flex items-center justify-between gap-4 cursor-pointer px-6 py-4 text-white font-medium text-sm select-none hover:bg-gray-800/50 transition list-none">
                <span>{item.q}</span>
                <span className="text-gray-500 group-open:rotate-180 transition-transform text-lg leading-none shrink-0">⌄</span>
              </summary>
              <div className="px-6 pb-5 text-gray-400 text-sm leading-relaxed border-t border-gray-800 pt-4">
                {item.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
          Your next book deserves
          <br />a cover that sells it.
        </h2>
        <p className="text-gray-400 text-lg mb-3">
          5 free covers. No credit card. Ready in under 2 minutes.
        </p>
        <p className="text-sm text-violet-400 font-medium mb-10">★★★★★ Trusted by 500+ KDP authors</p>
        <Link href="/sign-up"
          className="inline-flex bg-violet-600 hover:bg-violet-700 text-white font-bold px-10 py-5 rounded-2xl text-xl transition shadow-xl shadow-violet-900/40">
          Generate My Cover Free →
        </Link>
        <p className="text-gray-700 text-xs mt-4">✓ Instant access &nbsp;·&nbsp; ✓ No credit card &nbsp;·&nbsp; ✓ KDP-ready PDF</p>
      </section>

      <SiteFooter />
    </div>
    <EmailCapturePopup />
    <StickyEmailBar />
    </>
  )
}
