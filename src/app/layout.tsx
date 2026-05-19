import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'KDP Cover AI — Generate Amazon KDP Book Covers Instantly',
  description: 'Generate full-wrap, print-ready Amazon KDP book covers from a single prompt. Front cover, spine, and back cover — automatically formatted to exact KDP dimensions.',
  keywords: ['Amazon KDP', 'book cover generator', 'AI book cover', 'KDP cover maker', 'self-publishing'],
  openGraph: {
    title: 'KDP Cover AI — Amazon Book Covers in Seconds',
    description: 'Generate professional, KDP-compliant book covers with AI. Exact dimensions, full-wrap, ready to upload.',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'KDP Cover AI' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KDP Cover AI — Amazon Book Covers in Seconds',
    description: 'Generate professional, KDP-compliant book covers with AI. Full-wrap, exact KDP dimensions, ready to upload.',
    images: ['/og-image.png'],
  },
}

const hasClerkKey = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const content = (
    <html lang="en">
      <body className={`${inter.className} bg-gray-950 text-white antialiased min-h-screen`}>
        {children}
      </body>
    </html>
  )

  if (!hasClerkKey) return content

  return <ClerkProvider>{content}</ClerkProvider>
}
