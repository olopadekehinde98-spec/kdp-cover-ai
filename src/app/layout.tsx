import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import Script from 'next/script'
import { Suspense } from 'react'
import SupportChatBot from '@/components/SupportChatBot'
import ReferralCapture from '@/components/ReferralCapture'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://kdpcoverai.site'),
  title: 'KDP Cover AI — Free AI Book Cover Generator for Amazon KDP',
  description: 'Generate professional full-wrap Amazon KDP book covers with AI in seconds. Front cover, spine & back — exact 300 DPI dimensions, ready to upload. Free to start.',
  keywords: ['Amazon KDP', 'book cover generator', 'AI book cover', 'KDP cover maker', 'self-publishing', 'print-ready PDF', 'full wrap cover'],
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.svg',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: 'KDP Cover AI — Free AI Book Cover Generator for Amazon KDP',
    description: 'Generate professional full-wrap Amazon KDP book covers with AI in seconds. Front cover, spine & back — exact 300 DPI dimensions, ready to upload. Free to start.',
    type: 'website',
    url: process.env.NEXT_PUBLIC_APP_URL ?? 'https://kdpcoverai.site',
    siteName: 'KDP Cover AI',
    images: [{ url: 'https://kdp-cover-ai.vercel.app/og-image.png', width: 1200, height: 630, alt: 'KDP Cover AI — Generate Amazon Book Covers in Seconds' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KDP Cover AI — Free AI Book Cover Generator for Amazon KDP',
    description: 'Generate professional full-wrap Amazon KDP book covers with AI in seconds. Front cover, spine & back — exact 300 DPI dimensions, ready to upload. Free to start.',
    images: ['https://kdp-cover-ai.vercel.app/og-image.png'],
  },
  verification: {
    google: 'IR52tLpsd3lFVxtID9pJXhHB4v0Kd8qFoPxuWhWQ_I4',
  },
}

const hasClerkKey = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
const gaId = process.env.NEXT_PUBLIC_GA_ID

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const content = (
    <html lang="en">
      <body className={`${inter.className} bg-gray-950 text-white antialiased min-h-screen`}>
        <Suspense fallback={null}>
          <ReferralCapture />
        </Suspense>
        {children}
        <SupportChatBot />
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${gaId}');`}
            </Script>
          </>
        )}
      </body>
    </html>
  )

  if (!hasClerkKey) return content

  return <ClerkProvider>{content}</ClerkProvider>
}
