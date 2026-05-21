import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import Link from 'next/link'
import { notFound } from 'next/navigation'

const POSTS: Record<string, {
  title: string
  excerpt: string
  date: string
  tag: string
  readTime: string
  content: React.ReactNode
}> = {
  'how-to-format-kdp-cover': {
    title: 'How to Get Your KDP Cover Dimensions Right (Every Time)',
    excerpt: "Amazon KDP uses a precise formula to calculate spine width. Get it wrong and your cover gets rejected.",
    date: 'May 2025',
    tag: 'Guide',
    readTime: '6 min read',
    content: (
      <div className="space-y-6 text-gray-300 text-sm leading-relaxed">
        <p>
          If you have ever uploaded a book cover to Amazon KDP and received a rejection, there is a good chance
          the problem was dimensions — specifically the spine width. KDP calculates spine width using a formula
          that most designers do not know, and even small errors (0.01 of an inch) will get your cover flagged.
        </p>

        <h2 className="text-white font-bold text-xl mt-8">The Spine Width Formula</h2>
        <p>Amazon KDP calculates spine width based on two variables:</p>
        <ul className="list-disc list-inside space-y-2 text-gray-400">
          <li><strong className="text-white">Page count</strong> — the total number of pages in your book</li>
          <li><strong className="text-white">Paper type</strong> — black &amp; white, color, or premium color interior</li>
        </ul>
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 font-mono text-sm">
          <p className="text-violet-300 mb-2">// KDP spine width formulas</p>
          <p className="text-gray-300">Black &amp; White: pages × 0.002252"</p>
          <p className="text-gray-300">Color: pages × 0.0025"</p>
          <p className="text-gray-300">Premium Color: pages × 0.002347"</p>
          <p className="text-gray-400 mt-2 text-xs">Minimum spine: 0.0625" (any paper type)</p>
        </div>
        <p>
          So a 300-page black &amp; white paperback has a spine width of 300 × 0.002252 = <strong className="text-white">0.6756 inches</strong>.
          That is the number you need to build your cover around. If you use 0.68 or 0.67, KDP may reject it.
        </p>

        <h2 className="text-white font-bold text-xl mt-8">The Full-Wrap Cover Formula</h2>
        <p>A full-wrap cover is one single image that includes the back cover, spine, and front cover. The total width formula is:</p>
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 font-mono text-sm">
          <p className="text-gray-300">Total width = (trim width × 2) + spine width + (bleed × 2)</p>
          <p className="text-gray-300">Total height = trim height + (bleed × 2)</p>
          <p className="text-gray-400 mt-2 text-xs">Bleed = 0.125" on all sides (KDP standard)</p>
        </div>
        <p>
          For a 6×9 paperback with 300 pages (black &amp; white), that works out to:
        </p>
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-sm space-y-1">
          <p className="text-gray-300">Width = (6 × 2) + 0.6756 + (0.125 × 2) = <strong className="text-white">12.9256"</strong></p>
          <p className="text-gray-300">Height = 9 + (0.125 × 2) = <strong className="text-white">9.25"</strong></p>
          <p className="text-gray-300">At 300 DPI: <strong className="text-white">3877 × 2775 px</strong></p>
        </div>

        <h2 className="text-white font-bold text-xl mt-8">The 3 Most Common KDP Cover Rejections</h2>
        <div className="space-y-4">
          {[
            { n: '1', title: 'Wrong spine width', fix: 'Use Amazon\'s actual calculator at kdp.amazon.com/en_US/cover-calculator — or use KDP Cover AI which calculates this automatically.' },
            { n: '2', title: 'Missing bleed', fix: 'Your cover must extend 0.125" beyond the trim edge on all four sides. Content (text, faces) must be at least 0.25" inside the trim line.' },
            { n: '3', title: 'Low resolution', fix: 'KDP requires 300 DPI minimum. A 6×9 cover at 300 DPI is 1800×2700 pixels for the front only. Full-wrap is much larger.' },
          ].map(item => (
            <div key={item.n} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-violet-400 font-bold mb-1">Rejection #{item.n}: {item.title}</p>
              <p className="text-gray-400 text-sm">{item.fix}</p>
            </div>
          ))}
        </div>

        <h2 className="text-white font-bold text-xl mt-8">How KDP Cover AI Handles This</h2>
        <p>
          KDP Cover AI calculates spine width, bleed, safe zones, and total dimensions automatically
          from your page count, paper type, and trim size. Every exported PDF is validated against
          KDP's specifications before download. You never need to open a spreadsheet or calculator.
        </p>
        <p>
          If you already have the exact spine width from Amazon's own cover calculator, you can enter
          it manually using Method 3 (Amazon KDP Template) in the generator for maximum accuracy.
        </p>
      </div>
    ),
  },

  'free-vs-paid-book-covers': {
    title: 'Free vs Paid Book Cover Tools: What Self-Publishers Actually Need',
    excerpt: "Canva, DALL·E, and hiring a designer all have trade-offs. We break down the real cost of each option.",
    date: 'May 2025',
    tag: 'Comparison',
    readTime: '8 min read',
    content: (
      <div className="space-y-6 text-gray-300 text-sm leading-relaxed">
        <p>
          Every indie author faces the same question before publishing: should I pay for a book cover, or can I get
          away with a free tool? The honest answer depends on what you mean by "get away with" — and how much your
          time is worth.
        </p>

        <h2 className="text-white font-bold text-xl mt-8">Option 1: Canva (Free / $15/mo)</h2>
        <p>
          Canva is the most popular choice for authors who want to avoid paying a designer. The templates look good
          at first glance — but there are three problems that matter for KDP:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-400">
          <li>Canva does not calculate KDP spine width. You have to do the math yourself — and if you get it wrong, your cover gets rejected.</li>
          <li>Canva's export resolution defaults to 96 DPI for web. You have to manually switch to "print" settings to get 300 DPI, and even then the output may not match KDP's exact pixel dimensions.</li>
          <li>Canva templates are used by thousands of books. Your thriller cover might look identical to 50 other books on Amazon.</li>
        </ul>
        <p>
          <strong className="text-white">Verdict:</strong> Fine for ebooks and quick mockups. Risky for KDP paperback — the spine and bleed math is easy to get wrong.
        </p>

        <h2 className="text-white font-bold text-xl mt-8">Option 2: DALL·E / Midjourney / Stable Diffusion (Free–$30/mo)</h2>
        <p>
          AI image generators can create stunning artwork. The problem is they give you an image — not a book cover.
          You still need to:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-400">
          <li>Add title text, author name, and subtitle in a separate editor</li>
          <li>Calculate and build the full-wrap layout manually</li>
          <li>Set up the correct KDP dimensions, bleed, and 300 DPI output</li>
          <li>Create and place the spine text vertically</li>
          <li>Write and lay out the back cover description</li>
        </ul>
        <p>
          If you know Photoshop or Affinity Publisher, this is viable. If you do not, you will spend 4–6 hours on
          every cover — and still risk a KDP rejection.
        </p>

        <h2 className="text-white font-bold text-xl mt-8">Option 3: Hire a Designer ($50–$500+)</h2>
        <p>
          A good freelance cover designer on Fiverr charges $50–$150 for a basic cover. A professional designer
          (99designs, Reedsy) charges $300–$500+. For a debut author with no audience yet, that is a significant
          investment before making a single sale.
        </p>
        <p>
          The real issue is iteration. Every revision costs money and time. If you want to change the font or
          the colour palette after seeing it on Amazon, you go back into the queue. For a series of 5 books,
          you could spend $750–$2,500 just on covers.
        </p>

        <h2 className="text-white font-bold text-xl mt-8">Option 4: KDP Cover AI ($0–$79/mo)</h2>
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-700 text-gray-500">
                <th className="text-left px-4 py-3">What</th>
                <th className="text-center px-4 py-3">Canva</th>
                <th className="text-center px-4 py-3">AI Image</th>
                <th className="text-center px-4 py-3">Designer</th>
                <th className="text-center px-4 py-3 text-violet-400">KDP Cover AI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {[
                ['KDP dimensions', '⚠️ Manual', '❌', '✅', '✅'],
                ['Spine width calc', '❌', '❌', '✅', '✅'],
                ['Full-wrap PDF', '⚠️', '❌', '✅', '✅'],
                ['300 DPI export', '⚠️', '❌', '✅', '✅'],
                ['AI-generated art', '❌', '✅', '✅', '✅'],
                ['Time per cover', '2–4h', '4–6h', '3–7 days', '<60s'],
                ['Cost per cover', '$0–$15/mo', '$0–$30/mo', '$50–$500', '$0–$3/mo'],
              ].map(([feature, ...vals]) => (
                <tr key={feature as string}>
                  <td className="px-4 py-2.5 text-gray-300">{feature}</td>
                  {vals.map((v, i) => (
                    <td key={i} className={`px-4 py-2.5 text-center ${i === 3 ? 'text-violet-300 font-medium' : 'text-gray-400'}`}>{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="text-white font-bold text-xl mt-8">The Right Tool for the Right Author</h2>
        <p>
          If you are publishing one book and have a very limited budget, start free — use KDP Cover AI's 3 free
          covers to test the tool, then upgrade only if you need more.
        </p>
        <p>
          If you are a series author or plan to publish multiple books per year, the math strongly favours a
          subscription. At $29/month for unlimited covers, you break even after half a cover compared to
          hiring a designer.
        </p>
      </div>
    ),
  },

  'genre-cover-design-rules': {
    title: 'Cover Design Rules by Genre: What Readers Expect',
    excerpt: "Thriller uses dark palettes and sharp fonts. Romance uses warm tones and script. Break these rules and readers scroll past.",
    date: 'May 2025',
    tag: 'Design',
    readTime: '7 min read',
    content: (
      <div className="space-y-6 text-gray-300 text-sm leading-relaxed">
        <p>
          A book cover has roughly 0.3 seconds to signal its genre to a browser. That is less time than a single
          eye movement. If your thriller cover looks like a romance novel, the reader will not even register it
          consciously — they will just scroll past. Genre visual signals are not a convention, they are a
          reader-trained reflex.
        </p>

        <h2 className="text-white font-bold text-xl mt-8">🔪 Thriller &amp; Crime</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-green-400 font-semibold text-xs mb-2">✅ USE</p>
            <ul className="text-gray-400 space-y-1 text-xs">
              <li>Dark backgrounds — near-black, deep navy, charcoal</li>
              <li>High contrast — white or bright red text on dark</li>
              <li>Silhouettes — lone figure, running person, shadow</li>
              <li>Bold sans-serif or condensed fonts</li>
              <li>Red accents, blood, smoke, rain</li>
            </ul>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-red-400 font-semibold text-xs mb-2">❌ AVOID</p>
            <ul className="text-gray-400 space-y-1 text-xs">
              <li>Warm, soft colour palettes</li>
              <li>Script or cursive fonts</li>
              <li>Happy scenes or bright blue skies</li>
              <li>Romantic poses</li>
              <li>Illustrated or cartoonish art styles</li>
            </ul>
          </div>
        </div>
        <p>
          <strong className="text-white">Prompt example for KDP Cover AI:</strong>{' '}
          <span className="text-violet-300 font-mono text-xs">
            "Dark psychological thriller — cinematic red smoke, female silhouette in a dark alley, rain-slicked street reflecting city lights, deep navy and black palette"
          </span>
        </p>

        <h2 className="text-white font-bold text-xl mt-8">💕 Romance</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-green-400 font-semibold text-xs mb-2">✅ USE</p>
            <ul className="text-gray-400 space-y-1 text-xs">
              <li>Warm tones — sunset orange, dusty rose, soft gold</li>
              <li>Couple imagery or close-up face shots</li>
              <li>Script or serif fonts</li>
              <li>Soft bokeh, flowers, candles</li>
              <li>Pastel backgrounds for sweet romance</li>
            </ul>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-red-400 font-semibold text-xs mb-2">❌ AVOID</p>
            <ul className="text-gray-400 space-y-1 text-xs">
              <li>Dark, scary, or ominous imagery</li>
              <li>Heavy bold sans-serif fonts</li>
              <li>Cold blue or grey palettes</li>
              <li>Abstract geometric designs</li>
            </ul>
          </div>
        </div>
        <p>
          <strong className="text-white">Prompt example:</strong>{' '}
          <span className="text-violet-300 font-mono text-xs">
            "Romantic sunset beach scene — warm golden hour light, soft bokeh, couple silhouette, rose and amber tones, dreamy soft-focus atmosphere"
          </span>
        </p>

        <h2 className="text-white font-bold text-xl mt-8">🧙 Fantasy</h2>
        <p>
          Fantasy covers must convey scale, wonder, or power. The genre is heavily visual — readers buy the
          atmosphere, not just the story. Character-driven fantasy (epic, high fantasy) uses illustrated or
          painterly styles. Urban fantasy sits closer to thriller visually.
        </p>
        <p>
          <strong className="text-white">Prompt example:</strong>{' '}
          <span className="text-violet-300 font-mono text-xs">
            "Epic fantasy — glowing ancient map with runes, misty mountain ranges at dusk, dramatic golden light rays through storm clouds, painterly illustration style"
          </span>
        </p>

        <h2 className="text-white font-bold text-xl mt-8">📈 Business &amp; Self-Help</h2>
        <p>
          Non-fiction covers work differently. They need to communicate credibility and the transformation the
          reader will achieve. Bold, clean, minimal designs outperform busy ones consistently in this genre.
        </p>
        <p>
          <strong className="text-white">Prompt example:</strong>{' '}
          <span className="text-violet-300 font-mono text-xs">
            "Clean modern business book — bold geometric shapes, deep navy and white, minimal design, strong typography, professional corporate aesthetic"
          </span>
        </p>

        <h2 className="text-white font-bold text-xl mt-8">The Rule of Genre Signals</h2>
        <p>
          Every genre has a visual vocabulary readers have absorbed from thousands of covers over years of browsing.
          Your job is not to be original with your cover — your job is to signal genre instantly, so the right reader
          clicks. Save the originality for your prose.
        </p>
        <p>
          When using KDP Cover AI, select the correct genre in Step 2. The AI uses genre as a signal when generating
          the background image and selecting typography defaults. A thriller will get a different default aesthetic
          than a romance even with the same prompt.
        </p>
      </div>
    ),
  },
}

export async function generateStaticParams() {
  return Object.keys(POSTS).map(slug => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = POSTS[slug]
  if (!post) return {}
  return { title: `${post.title} — KDP Cover AI Blog`, description: post.excerpt }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = POSTS[slug]
  if (!post) notFound()

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <SiteHeader />

      <main className="flex-1 max-w-2xl mx-auto px-6 py-16 w-full">
        {/* Back */}
        <Link href="/blog" className="text-gray-500 hover:text-gray-300 text-sm transition mb-8 inline-block">
          ← Back to Blog
        </Link>

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-900/50 text-violet-300">
              {post.tag}
            </span>
            <span className="text-xs text-gray-600">{post.date}</span>
            <span className="text-xs text-gray-600">·</span>
            <span className="text-xs text-gray-600">{post.readTime}</span>
          </div>
          <h1 className="text-3xl font-black text-white leading-tight mb-4">{post.title}</h1>
          <p className="text-gray-400 text-base leading-relaxed">{post.excerpt}</p>
        </div>

        {/* Content */}
        <article>{post.content}</article>

        {/* CTA */}
        <div className="mt-16 bg-violet-950/40 border border-violet-800/40 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-white mb-2">Ready to generate your cover?</h2>
          <p className="text-gray-400 text-sm mb-6">
            KDP-spec dimensions, full-wrap AI design, print-ready PDF. Free to try.
          </p>
          <Link href="/sign-up"
            className="inline-flex items-center justify-center bg-violet-600 hover:bg-violet-700 text-white font-bold px-8 py-3 rounded-xl transition text-sm">
            Try Free — 3 Covers, No Card →
          </Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
