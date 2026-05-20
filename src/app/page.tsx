import Link from 'next/link'

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
  { name: 'Marcus T.', role: 'Self-published thriller author', text: 'I was spending $300+ per cover with a designer. This does the same quality in 30 seconds. My last 4 KDP uploads went through first try.' },
  { name: 'Sarah K.', role: 'Romance novelist, 12 books', text: 'The spine calculation alone is worth it. I used to get rejected constantly because of wrong dimensions. Not anymore.' },
  { name: 'James R.', role: 'Low-content KDP publisher', text: 'I publish 8–10 books a month. The agency plan paid for itself in the first week. Insane time saver.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Nav */}
      <nav className="border-b border-gray-900 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center font-bold text-sm">K</div>
          <span className="font-bold text-lg">KDP Cover AI</span>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <Link href="/pricing" className="text-gray-400 hover:text-white transition">Pricing</Link>
          <Link href="/affiliate" className="text-gray-400 hover:text-white transition">Affiliates</Link>
          <Link href="/sign-in" className="text-gray-400 hover:text-white transition">Sign In</Link>
          <Link href="/sign-up" className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-4 py-2 rounded-xl transition">
            Start Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-violet-950/60 border border-violet-800/50 text-violet-300 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
          ✨ Amazon KDP-Compliant Covers in Seconds
        </div>

        <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight mb-6">
          Generate Full Amazon KDP
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400">
            Book Covers Instantly
          </span>
        </h1>

        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Create print-ready front cover, spine, and back cover using exact Amazon KDP dimensions.
          <br />
          One prompt. Full-wrap. No rejections.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
          <Link href="/sign-up"
            className="bg-violet-600 hover:bg-violet-700 text-white font-bold px-8 py-4 rounded-2xl text-lg transition shadow-lg shadow-violet-900/40">
            Generate Your Cover Free →
          </Link>
          <Link href="/pricing"
            className="bg-gray-900 hover:bg-gray-800 border border-gray-700 text-gray-200 font-semibold px-8 py-4 rounded-2xl text-lg transition">
            See Pricing
          </Link>
        </div>
        <p className="text-sm text-gray-600">3 free covers · No credit card required</p>

        {/* Mock demo strip */}
        <div className="mt-16 bg-gray-900 border border-gray-800 rounded-3xl p-6 text-left shadow-2xl">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-xs text-gray-600 ml-2">KDP Cover AI — Generate</span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="bg-gray-800 rounded-xl p-3 border border-gray-700">
              <p className="text-gray-500 mb-1">Prompt entered</p>
              <p className="text-gray-300 italic">"Dark psychological thriller, red smoke, lone silhouette..."</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-3 border border-violet-700/50">
              <p className="text-gray-500 mb-1">KDP Dimensions</p>
              <p className="text-green-400 font-mono">12.750" × 9.250"</p>
              <p className="text-gray-500 font-mono text-xs">Spine: 0.5000"</p>
              <p className="text-gray-500 font-mono text-xs">Bleed: 0.125" ✓</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-3 border border-gray-700">
              <p className="text-gray-500 mb-1">Export ready</p>
              <p className="text-green-400">✓ PDF — 300 DPI</p>
              <p className="text-green-400">✓ Bleed validated</p>
              <p className="text-green-400">✓ Fonts embedded</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">From Prompt to KDP Upload in 4 Steps</h2>
          <p className="text-gray-400">No design skills. No guesswork. No rejections.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map(step => (
            <div key={step.n} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <div className="text-3xl font-black text-violet-700 mb-3">{step.n}</div>
              <h3 className="text-white font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Everything KDP Requires. Automated.</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            This isn't a Canva clone. It's publishing automation. Every feature exists to solve a real KDP pain point.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(f => (
            <div key={f.title} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-gray-600 transition">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-white font-semibold mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Before/After */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-white text-center mb-12">Before vs After</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-red-950/20 border border-red-900/50 rounded-2xl p-6">
            <div className="text-red-400 font-bold mb-4 text-sm uppercase tracking-wider">❌ Before KDP Cover AI</div>
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
                <li key={item} className="flex gap-2"><span className="text-red-700">✗</span>{item}</li>
              ))}
            </ul>
          </div>
          <div className="bg-green-950/20 border border-green-900/50 rounded-2xl p-6">
            <div className="text-green-400 font-bold mb-4 text-sm uppercase tracking-wider">✓ After KDP Cover AI</div>
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
                <li key={item} className="flex gap-2"><span className="text-green-500">✓</span>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-white text-center mb-12">Authors Love It</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(t => (
            <div key={t.name} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <p className="text-gray-300 text-sm leading-relaxed mb-5 italic">"{t.text}"</p>
              <div>
                <p className="text-white font-semibold text-sm">{t.name}</p>
                <p className="text-gray-500 text-xs">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
          Your next book deserves
          <br />a professional cover.
        </h2>
        <p className="text-gray-400 text-lg mb-10">
          Start with 3 free covers. No credit card. No learning curve.
        </p>
        <Link href="/sign-up"
          className="inline-flex bg-violet-600 hover:bg-violet-700 text-white font-bold px-10 py-5 rounded-2xl text-xl transition shadow-xl shadow-violet-900/40">
          Generate Your First Cover Free →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-900 px-6 py-8 text-center text-sm text-gray-600">
        <div className="flex items-center justify-center gap-6 mb-4">
          <Link href="/pricing" className="hover:text-gray-400 transition">Pricing</Link>
          <Link href="/affiliate" className="hover:text-gray-400 transition">Affiliates</Link>
          <Link href="/sign-in" className="hover:text-gray-400 transition">Sign In</Link>
          <Link href="/sign-up" className="hover:text-gray-400 transition">Sign Up</Link>
        </div>
        <p>© {new Date().getFullYear()} KDP Cover AI. All rights reserved.</p>
        <p className="mt-1 text-xs text-gray-700">AI-generated covers. Commercial rights granted on paid plans. Not affiliated with Amazon KDP.</p>
      </footer>
    </div>
  )
}
