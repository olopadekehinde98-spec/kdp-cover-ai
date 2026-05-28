import Link from 'next/link'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import LiveStats from '@/components/LiveStats'
import CoverGallery from '@/components/CoverGallery'
import EmailCapturePopup from '@/components/EmailCapturePopup'
import AnnounceBanner from '@/components/AnnounceBanner'
import InlineSignupCapture from '@/components/InlineSignupCapture'
import StickyEmailBar from '@/components/StickyEmailBar'

const FEATURES = [
  {
    icon: '📐',
    title: 'Exact KDP Dimensions',
    desc: 'Spine width, bleed, safe zones, and barcode placement calculated to Amazon\'s exact specifications. Zero guesswork.',
  },
  {
    icon: '🎨',
    title: 'Full-Wrap AI Generation',
    desc: 'One continuous image — front cover, spine, and back cover — generated as a seamless composition.',
  },
  {
    icon: '✍️',
    title: 'Smart Typography Engine',
    desc: 'Genre-matched fonts, auto-scaling titles, proper text hierarchy. Your cover won\'t look amateur.',
  },
  {
    icon: '📄',
    title: 'Back Cover Auto-Layout',
    desc: 'Book description, author bio, and barcode safe zone placed automatically. No manual layout needed.',
  },
  {
    icon: '⬇️',
    title: 'KDP-Ready PDF Export',
    desc: '300 DPI, 0.125" bleed, embedded fonts, trim marks. Upload directly to KDP without rejection.',
  },
  {
    icon: '🚀',
    title: 'Genre Intelligence',
    desc: 'The AI understands thriller vs romance vs fantasy. Typography, colors, and mood adapt automatically.',
  },
]

const STEPS = [
  { n: '01', title: 'Enter Book Specs', desc: 'Trim size, page count, paper type. The engine calculates exact KDP dimensions instantly.' },
  { n: '02', title: 'Add Book Info', desc: 'Title, author name, genre, and your back cover description — or let AI write it.' },
  { n: '03', title: 'Describe Your Vision', desc: 'Type a prompt like "dark thriller with red smoke and a silhouette." AI enhances it automatically.' },
  { n: '04', title: 'Download & Upload', desc: 'Get a KDP-ready PDF in seconds. Upload directly to Amazon. No rejections.' },
]

const TESTIMONIALS = [
  {
    name: 'Marcus T.',
    role: 'Self-published thriller author',
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

const FAQ = [
  {
    q: 'Will the cover pass KDP\'s technical requirements?',
    a: 'Yes. Every cover is generated at 300 DPI with 0.125" bleed, correct spine width for your page count, and trim marks included. These are Amazon\'s exact specifications. Most users upload their first cover with zero rejections.',
  },
  {
    q: 'Do I need design experience?',
    a: 'None at all. Type your book title, genre, and a short description of the mood you want. The AI handles the typography, layout, and art. The whole process takes under 2 minutes.',
  },
  {
    q: 'What makes this different from Canva or Photoshop?',
    a: 'Canva and Photoshop don\'t know KDP specs. You\'d still need to manually calculate spine width, set up bleed, and hope you got it right. KDP Cover AI builds all of that in automatically — it\'s purpose-built for Amazon publishing.',
  },
  {
    q: 'Can I edit the text on my cover after it\'s generated?',
    a: 'Yes. After generation you can edit the title, subtitle, author name, back cover description, and author bio directly — no need to regenerate the whole cover. You can also swap just the background image while keeping your text.',
  },
  {
    q: 'What if I don\'t like the result?',
    a: 'Regenerate with a different prompt. With 3 free covers you can experiment at no cost. The style templates (Dark Thriller, Romance Warm, Epic Fantasy, etc.) give you a great starting point for any genre.',
  },
]

export default function LandingPage() {
  return (
    <>
    <AnnounceBanner />
    <div className="min-h-screen bg-gray-950 text-white">
      <SiteHeader />

      {/* ── HERO ── */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">

        {/* Trust badge row */}
        <div className="flex flex-wrap justify-center items-center gap-3 mb-8">
          <div className="flex items-center gap-1.5 bg-gray-900 border border-gray-800 rounded-full px-3 py-1.5 text-xs text-gray-400">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>Free to start · No card required</span>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-full px-3 py-1.5 text-xs text-gray-400">
            ✅ Amazon KDP compliant
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-full px-3 py-1.5 text-xs text-gray-400">
            ⚡ Ready in ~30 seconds
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-full px-3 py-1.5 text-xs text-gray-400">
            📚 All genres supported
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight mb-6">
          Generate Full Amazon KDP
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400">
            Book Covers Instantly
          </span>
        </h1>

        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-4 leading-relaxed">
          Create a print-ready front cover, spine, and back cover with exact Amazon KDP dimensions.
          <br className="hidden md:block" />
          One prompt. Full-wrap. No rejections.
        </p>

        {/* Social proof line */}
        <p className="text-sm text-violet-400 font-medium mb-8">
          ★★★★★ Loved by 500+ self-published authors on Amazon KDP
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
          <Link href="/sign-up"
            className="bg-violet-600 hover:bg-violet-700 text-white font-bold px-8 py-4 rounded-2xl text-lg transition shadow-lg shadow-violet-900/40 relative">
            Generate Your Cover Free →
            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">FREE</span>
          </Link>
          <Link href="/pricing"
            className="bg-gray-900 hover:bg-gray-800 border border-gray-700 text-gray-200 font-semibold px-8 py-4 rounded-2xl text-lg transition">
            See Pricing
          </Link>
        </div>
        <p className="text-sm text-gray-600 mb-2">3 free covers · No credit card required · Cancel anytime</p>
        <p className="text-xs text-gray-700">✓ Instant access &nbsp;·&nbsp; ✓ No watermarks &nbsp;·&nbsp; ✓ KDP-ready PDF</p>

        {/* Live stats */}
        <LiveStats />

        {/* Mock demo strip */}
        <div className="mt-10 bg-gray-900 border border-gray-800 rounded-3xl p-6 text-left shadow-2xl">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-xs text-gray-600 ml-2">KDP Cover AI — Generate</span>
            <span className="ml-auto flex items-center gap-1.5 text-xs text-green-400">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Live
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-gray-800 rounded-xl p-3 border border-gray-700">
              <p className="text-gray-500 mb-1">Prompt entered</p>
              <p className="text-gray-300 italic">"Dark psychological thriller, red smoke, lone silhouette..."</p>
              <div className="mt-2 flex gap-1 flex-wrap">
                <span className="bg-violet-900/60 text-violet-300 px-1.5 py-0.5 rounded-md text-[10px]">Thriller</span>
                <span className="bg-violet-900/60 text-violet-300 px-1.5 py-0.5 rounded-md text-[10px]">Dark</span>
                <span className="bg-violet-900/60 text-violet-300 px-1.5 py-0.5 rounded-md text-[10px]">Suspense</span>
              </div>
            </div>
            <div className="bg-gray-800 rounded-xl p-3 border border-violet-700/50">
              <p className="text-gray-500 mb-1">KDP Dimensions</p>
              <p className="text-green-400 font-mono">12.750" × 9.250"</p>
              <p className="text-gray-500 font-mono text-xs">Spine: 0.5000"</p>
              <p className="text-gray-500 font-mono text-xs">Bleed: 0.125" ✓</p>
              <p className="text-gray-500 font-mono text-xs">Safe zone: 0.25" ✓</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-3 border border-gray-700">
              <p className="text-gray-500 mb-1">Export ready</p>
              <p className="text-green-400">✓ PDF — 300 DPI</p>
              <p className="text-green-400">✓ Bleed validated</p>
              <p className="text-green-400">✓ Fonts embedded</p>
              <p className="text-green-400">✓ Trim marks included</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between">
            <span className="text-xs text-gray-600">Generated in 28 seconds</span>
            <Link href="/sign-up" className="text-xs text-violet-400 hover:text-violet-300 font-semibold transition">
              Try it free →
            </Link>
          </div>
        </div>
      </section>

      {/* ── OBJECTION CRUSHER STRIP ── */}
      <section className="border-y border-gray-800 bg-gray-900/40 py-6">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
            {[
              { icon: '🚫', text: 'No design skills needed' },
              { icon: '💳', text: 'No credit card to start' },
              { icon: '📏', text: 'Dimensions auto-calculated' },
              { icon: '✅', text: 'First upload accepted by KDP' },
            ].map(item => (
              <div key={item.text} className="flex flex-col items-center gap-1.5 text-gray-400">
                <span className="text-2xl">{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">From Prompt to KDP Upload in 4 Steps</h2>
          <p className="text-gray-400">No design skills. No guesswork. No rejections.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map(step => (
            <div key={step.n} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 relative overflow-hidden">
              <div className="text-3xl font-black text-violet-700 mb-3">{step.n}</div>
              <h3 className="text-white font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link href="/sign-up"
            className="inline-flex bg-violet-600 hover:bg-violet-700 text-white font-bold px-8 py-4 rounded-2xl text-lg transition shadow-lg shadow-violet-900/40">
            Start Free — 3 Covers on Us →
          </Link>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Everything KDP Requires. Automated.</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            This isn't a Canva clone. It's publishing automation. Every feature exists to solve a real KDP pain point.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(f => (
            <div key={f.title} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-violet-800/60 transition group">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-white font-semibold mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── COVER GALLERY ── */}
      <CoverGallery />

      {/* ── BEFORE / AFTER ── */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-white text-center mb-4">Before vs After</h2>
        <p className="text-center text-gray-500 text-sm mb-12">Most KDP authors waste days on cover problems. Here's the difference.</p>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-red-950/20 border border-red-900/50 rounded-2xl p-6">
            <div className="text-red-400 font-bold mb-4 text-sm uppercase tracking-wider">❌ Without KDP Cover AI</div>
            <ul className="space-y-3 text-sm text-gray-400">
              {[
                'Hire a designer: $200–500 per cover',
                'Wait 3–7 days for delivery',
                'Wrong spine width → KDP rejection',
                'Bleed missing → upload rejected',
                'Re-export, re-upload, repeat',
                "Series covers don't match",
                'Designer ghosted you mid-project',
              ].map(item => (
                <li key={item} className="flex gap-2"><span className="text-red-700 mt-0.5">✗</span>{item}</li>
              ))}
            </ul>
          </div>
          <div className="bg-green-950/20 border border-green-900/50 rounded-2xl p-6">
            <div className="text-green-400 font-bold mb-4 text-sm uppercase tracking-wider">✓ With KDP Cover AI</div>
            <ul className="space-y-3 text-sm text-gray-400">
              {[
                'Full cover generated in 30 seconds',
                'Exact KDP dimensions — guaranteed',
                'Spine width auto-calculated perfectly',
                '0.125" bleed built-in automatically',
                'Download KDP-ready PDF instantly',
                'Series branding kept consistent',
                "Available 24/7 — you're in control",
              ].map(item => (
                <li key={item} className="flex gap-2"><span className="text-green-500 mt-0.5">✓</span>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-white text-center mb-3">Authors Love It</h2>
        <p className="text-center text-gray-500 text-sm mb-12">Real feedback from KDP publishers using the tool today</p>
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

      {/* ── INLINE EMAIL CAPTURE ── */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <div className="bg-gray-900 border border-violet-800/40 rounded-3xl p-8 md:p-12">
          <InlineSignupCapture />
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-white text-center mb-3">Common Questions</h2>
        <p className="text-center text-gray-500 text-sm mb-10">Everything you need to know before you start</p>
        <div className="space-y-4">
          {FAQ.map(item => (
            <details key={item.q} className="group bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <summary className="flex items-center justify-between gap-4 cursor-pointer px-6 py-4 text-white font-medium text-sm select-none hover:bg-gray-800/50 transition list-none">
                <span>{item.q}</span>
                <span className="text-gray-500 group-open:rotate-180 transition-transform text-lg leading-none flex-shrink-0">⌄</span>
              </summary>
              <div className="px-6 pb-5 text-gray-400 text-sm leading-relaxed border-t border-gray-800 pt-4">
                {item.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* ── RISK REVERSAL ── */}
      <section className="max-w-3xl mx-auto px-6 py-10">
        <div className="bg-violet-950/30 border border-violet-800/40 rounded-2xl p-6 text-center">
          <div className="text-3xl mb-3">🛡️</div>
          <h3 className="text-white font-bold text-lg mb-2">Zero Risk to Start</h3>
          <p className="text-gray-400 text-sm leading-relaxed max-w-xl mx-auto">
            You get 3 full covers completely free — no credit card, no watermarks, no time limit.
            If your cover gets rejected by KDP for a technical dimension issue, we'll fix it.
            The only risk is staying on your designer's waiting list.
          </p>
          <Link href="/sign-up"
            className="inline-flex mt-5 bg-violet-600 hover:bg-violet-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition">
            Claim Your 3 Free Covers →
          </Link>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
          Your next book deserves
          <br />a professional cover.
        </h2>
        <p className="text-gray-400 text-lg mb-3">
          Start with 3 free covers. No credit card. No learning curve.
        </p>
        <p className="text-sm text-violet-400 font-medium mb-10">
          ★★★★★ — Loved by 500+ KDP authors
        </p>
        <Link href="/sign-up"
          className="inline-flex bg-violet-600 hover:bg-violet-700 text-white font-bold px-10 py-5 rounded-2xl text-xl transition shadow-xl shadow-violet-900/40">
          Generate Your First Cover Free →
        </Link>
        <p className="text-gray-700 text-xs mt-4">✓ Instant access &nbsp;·&nbsp; ✓ No credit card &nbsp;·&nbsp; ✓ KDP-ready PDF included</p>
      </section>

      <SiteFooter />
    </div>
    <EmailCapturePopup />
    <StickyEmailBar />
    </>
  )
}
