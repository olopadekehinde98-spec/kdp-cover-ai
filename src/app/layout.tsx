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
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className} bg-gray-950 text-white antialiased min-h-screen`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
