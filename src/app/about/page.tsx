import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import Link from 'next/link'

export const metadata = {
  title: 'About — KDP Cover AI',
  description: 'KDP Cover AI is an AI-powered book cover generator built specifically for Amazon KDP self-publishers. Learn how it works and why it exists.',
}

const HOW_IT_WORKS = [
  {
    n: '01',
    title: 'AI-Generated Cover',
    desc: 'Describe your vision in plain language. Our AI generates a custom full-wrap background image using your prompt, then automatically adds your title, author name, spine text, and back cover.',
    icon: '✨',
    color: 'violet',
  },
  {
    n: '02',
    title: 'Upload Your Image',
    desc: 'Already have artwork? Upload any JPEG or PNG as the background. The system scales it to KDP dimensions and adds all text overlays, spine, and back cover.',
    icon: '🖼️',
    color: 'blue',
  },
  {
    n: '03',
    title: 'Amazon KDP Template',
    desc: 'Get the exact spine width from Amazon KDP\'s cover calculator, enter it here, and choose AI or upload for the image. The most precise method for zero-rejection uploads.',
    icon: '📐',
    color: 'green',
  },
  {
    n: '04',
    title: 'Upload Your Book',
    desc: 'Upload your manuscript (PDF, TXT, DOCX). The AI reads the first chapters and automatically writes your back cover description, then you choose your cover style.',
    icon: '📖',
    color: 'orange',
  },
]

const ADVANTAGES = [
  { icon: '📐', title: 'Correct KDP Dimensions', desc: "Amazon's exact spine width formula. Every book size. Black & white, color, and premium color paper types." },
  { icon: '🔲', title: '0.125" Bleed Built-in', desc: 'Industry-standard bleed on all sides. Your cover will not be rejected for bleed issues.' },
  { icon: '🖨️', title: '300 DPI Print Quality', desc: 'Export at the exact pixel resolution KDP requires. No pixelation, no rejections.' },
  { icon: '⚡', title: 'Instant PDF', desc: 'Full-wrap print-ready PDF in under 60 seconds. No design software needed.' },
  { icon: '🎨', title: 'Genre Typography', desc: 'AI understands that thriller covers use different fonts than romance or business books.' },
  { icon: '📚', title: 'Full-Wrap Canvas', desc: 'Front cover + spine + back cover as one seamless composition, exactly as KDP requires.' },
]

const TECH = [
  { name: 'Next.js 15', desc: 'App Router — server components, API routes' },
  { name: 'OpenAI DALL-E 3', desc: 'AI image generation (full-wrap at native aspect)' },
  { name: 'OpenAI GPT-4o-mini', desc: 'Prompt enhancement, description writing' },
  { name: 'PDF-lib', desc: 'Print-quality PDF generation with exact dimensions' },
  { name: 'Sharp', desc: 'High-performance image processing for exports' },
  { name: 'Prisma + PostgreSQL', desc: 'Database for covers, users, and sessions' },
  { name: 'Clerk', desc: 'Authentication and user management' },
  { name: 'Tailwind CSS', desc: 'UI styling' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <SiteHeader />

      <main className="flex-1 w-full">

        {/* Hero */}
        <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 bg-violet-950/60 border border-violet-800/50 text-violet-300 text-xs font-medium px-3 py-1.5 rounded-full mb-5">
            Built for self-publishers
          </div>
          <h1 className="text-5xl font-black text-white mb-5 leading-tight">
            What is KDP Cover AI?
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            An AI-powered book cover generator built specifically for Amazon KDP self-publishers.
            Generate a print-ready full-wrap PDF in seconds — exact dimensions, correct spine width, 300 DPI.
          </p>
        </section>

        {/* Who it's for */}
        <section className="max-w-5xl mx-auto px-6 py-10">
          <h2 className="text-3xl font-bold text-white text-center mb-3">Who is it for?</h2>
          <p className="text-gray-400 text-center mb-10">Anyone publishing on Amazon KDP who needs a professional cover without paying $300+ to a designer.</p>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { icon: '✍️', title: 'Self-Published Authors', desc: 'Publish your novel, memoir, or non-fiction with a cover that looks like a traditional publisher made it.' },
              { icon: '📚', title: 'Publishers & Imprints', desc: 'Produce multiple covers fast with the Agency plan. Consistent quality across your entire catalog.' },
              { icon: '🎨', title: 'Book Cover Designers', desc: 'Use your own artwork and let KDP Cover AI handle the technical side — dimensions, spine, PDF output.' },
            ].map(item => (
              <div key={item.title} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="max-w-5xl mx-auto px-6 py-10">
          <h2 className="text-3xl font-bold text-white text-center mb-3">How It Works</h2>
          <p className="text-gray-400 text-center mb-10">Four ways to create your cover. All produce the same print-ready KDP PDF.</p>
          <div className="grid md:grid-cols-2 gap-5">
            {HOW_IT_WORKS.map(item => {
              const borderMap: Record<string, string> = {
                violet: 'hover:border-violet-500/50',
                blue: 'hover:border-blue-500/50',
                green: 'hover:border-green-500/50',
                orange: 'hover:border-orange-500/50',
              }
              return (
                <div key={item.n} className={`bg-gray-900 border border-gray-800 rounded-2xl p-6 transition ${borderMap[item.color]}`}>
                  <div className="flex items-start gap-4">
                    <div className="text-3xl shrink-0">{item.icon}</div>
                    <div>
                      <p className="text-xs text-gray-600 font-mono mb-1">Method {item.n}</p>
                      <h3 className="text-white font-bold mb-2">{item.title}</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Why it's better */}
        <section className="max-w-5xl mx-auto px-6 py-10">
          <h2 className="text-3xl font-bold text-white text-center mb-3">Why KDP Cover AI?</h2>
          <p className="text-gray-400 text-center mb-10">What makes this different from Canva or hiring a designer</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ADVANTAGES.map(item => (
              <div key={item.title} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <div className="text-2xl mb-3">{item.icon}</div>
                <p className="text-white font-semibold text-sm">{item.title}</p>
                <p className="text-gray-500 text-xs mt-1 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Founder section */}
        <section className="max-w-3xl mx-auto px-6 py-10">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">The Story</h2>
            <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
              <p>
                KDP Cover AI was built by a developer who was frustrated watching authors spend hundreds of
                dollars on cover designers — only to get their first upload rejected because the spine was
                off by 0.02 inches.
              </p>
              <p>
                The problem is not creativity. The problem is that KDP's dimension requirements are technical
                and precise, and most tools are not built for it. Canva produces beautiful images but cannot
                calculate spine width. Photoshop can handle the dimensions but requires professional skills.
              </p>
              <p>
                KDP Cover AI combines AI generation with accurate KDP calculations in one tool.
                You focus on your story. We handle the specs.
              </p>
              <p className="text-gray-500 italic">
                "Every author deserves a professional cover — not just the ones with big budgets."
              </p>
            </div>
          </div>
        </section>

        {/* Mission */}
        <section className="max-w-3xl mx-auto px-6 py-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-3">Our Mission</h2>
            <p className="text-gray-400 leading-relaxed">
              To make professional-quality book cover production accessible to every self-published author,
              regardless of budget or design skills. We are building the most accurate, most affordable,
              and easiest KDP cover tool on the internet.
            </p>
          </div>
        </section>

        {/* Tech stack */}
        <section className="max-w-5xl mx-auto px-6 py-10">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Technology</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {TECH.map(t => (
              <div key={t.name} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <p className="text-white font-semibold text-sm">{t.name}</p>
                <p className="text-gray-500 text-xs mt-1">{t.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-2xl mx-auto px-6 py-16 text-center">
          <h2 className="text-3xl font-black text-white mb-4">Ready to generate your cover?</h2>
          <p className="text-gray-400 mb-8">5 free covers to start. No credit card required. Print-ready PDF in under a minute.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/sign-up"
              className="inline-flex items-center justify-center bg-violet-600 hover:bg-violet-700 text-white font-bold px-8 py-4 rounded-xl transition text-lg">
              Start Free — 3 Covers →
            </Link>
            <Link href="/pricing"
              className="inline-flex items-center justify-center bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold px-6 py-4 rounded-xl transition">
              View Pricing
            </Link>
          </div>
        </section>

        {/* Contact */}
        <section className="max-w-3xl mx-auto px-6 pb-16 text-center border-t border-gray-800 pt-10">
          <h2 className="text-white font-bold text-lg mb-3">Contact Us</h2>
          <p className="text-gray-400 text-sm">
            Questions, feedback, or business enquiries:{' '}
            <a href="mailto:support@kdpcoverai.com" className="text-violet-400 hover:text-violet-300">
              support@kdpcoverai.com
            </a>
          </p>
        </section>

      </main>

      <SiteFooter />
    </div>
  )
}
