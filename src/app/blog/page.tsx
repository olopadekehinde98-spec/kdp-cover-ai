import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import Link from 'next/link'

export const metadata = {
  title: 'Blog — KDP Cover AI',
  description: 'Tips, guides, and updates for self-publishers on Amazon KDP.',
}

const POSTS = [
  {
    slug: 'how-to-format-kdp-cover',
    title: 'How to Get Your KDP Cover Dimensions Right (Every Time)',
    excerpt: 'Amazon KDP uses a precise formula to calculate spine width based on your page count and paper type. Get it wrong and your cover gets rejected. Here is how it works.',
    date: 'May 2025',
    tag: 'Guide',
  },
  {
    slug: 'free-vs-paid-book-covers',
    title: 'Free vs Paid Book Cover Tools: What Self-Publishers Actually Need',
    excerpt: 'Canva, DALL·E, and hiring a designer all have trade-offs. We break down the real cost — in money and time — of each option for indie authors.',
    date: 'May 2025',
    tag: 'Comparison',
  },
  {
    slug: 'genre-cover-design-rules',
    title: 'Cover Design Rules by Genre: What Readers Expect',
    excerpt: 'Thriller covers use dark palettes and sharp fonts. Romance uses warm tones and script. Fantasy uses illustrated scenes. Break these rules and readers scroll past.',
    date: 'May 2025',
    tag: 'Design',
  },
]

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <SiteHeader />

      <main className="flex-1 max-w-3xl mx-auto px-6 py-16 w-full">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 bg-violet-950/60 border border-violet-800/50 text-violet-300 text-xs font-medium px-3 py-1.5 rounded-full mb-5">
            Tips for self-publishers
          </div>
          <h1 className="text-4xl font-black text-white mb-4">The KDP Cover AI Blog</h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            Guides, tips, and updates to help you publish faster and sell more books.
          </p>
        </div>

        <div className="space-y-6">
          {POSTS.map(post => (
            <Link key={post.slug} href={`/blog/${post.slug}`}>
            <article
              className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-violet-700/50 transition group cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-900/50 text-violet-300">
                  {post.tag}
                </span>
                <span className="text-xs text-gray-600">{post.date}</span>
              </div>
              <h2 className="text-lg font-bold text-white mb-2 group-hover:text-violet-300 transition">
                {post.title}
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                {post.excerpt}
              </p>
              <Link href={`/blog/${post.slug}`} className="text-sm text-violet-400 hover:text-violet-300 font-medium transition">
                Read article →
              </Link>
            </article>
            </Link>
          ))}
        </div>

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
