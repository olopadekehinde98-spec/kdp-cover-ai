import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { Suspense } from 'react'
import SupportChatBot from '@/components/SupportChatBot'
import ReferralCapture from '@/components/ReferralCapture'
import SignupPopup from '@/components/SignupPopup'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kdpcoverai.site'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'KDP Cover AI — Free AI Book Cover Generator for Amazon KDP',
    template: '%s | KDP Cover AI',
  },
  description: 'Generate professional full-wrap Amazon KDP book covers with AI in seconds. Free KDP cover maker — front cover, spine & back panel, exact 300 DPI, ready to upload to Amazon KDP.',
  keywords: [
    'KDP cover AI',
    'KDP cover generator',
    'Amazon KDP book cover',
    'free KDP cover maker',
    'AI book cover generator',
    'KDP book cover design',
    'Amazon book cover maker',
    'KDP spine width calculator',
    'full wrap book cover',
    'print-ready book cover PDF',
    'self-publishing book cover',
    'kdpcoverai',
    'book cover AI free',
    'KDP cover template',
    'AI cover design',
  ],
  authors: [{ name: 'KDP Cover AI', url: APP_URL }],
  creator: 'KDP Cover AI',
  publisher: 'KDP Cover AI',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: '/favicon.svg',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: 'KDP Cover AI — Free AI Book Cover Generator for Amazon KDP',
    description: 'Generate professional full-wrap Amazon KDP book covers with AI in seconds. Free to start — 300 DPI, print-ready PDF, exact KDP dimensions.',
    type: 'website',
    url: APP_URL,
    siteName: 'KDP Cover AI',
    locale: 'en_US',
    images: [{
      url: `${APP_URL}/og-image.png`,
      width: 1200,
      height: 630,
      alt: 'KDP Cover AI — Generate Amazon Book Covers in Seconds',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@kdpcoverai',
    title: 'KDP Cover AI — Free AI Book Cover Generator for Amazon KDP',
    description: 'Generate professional full-wrap Amazon KDP book covers with AI in seconds. Free to start.',
    images: [`${APP_URL}/og-image.png`],
  },
  alternates: {
    canonical: APP_URL,
  },
  verification: {
    google: 'IR52tLpsd3lFVxtID9pJXhHB4v0Kd8qFoPxuWhWQ_I4',
  },
  category: 'technology',
}

// JSON-LD structured data — tells Google exactly what this site is
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'KDP Cover AI',
  url: APP_URL,
  description: 'AI-powered Amazon KDP book cover generator. Create professional full-wrap covers with front, spine, and back panels in seconds.',
  applicationCategory: 'DesignApplication',
  operatingSystem: 'Web',
  offers: [
    { '@type': 'Offer', name: 'Free', price: '0', priceCurrency: 'USD', description: '3 free covers' },
    { '@type': 'Offer', name: 'Starter', price: '9', priceCurrency: 'USD', description: '15 covers per month' },
    { '@type': 'Offer', name: 'Pro', price: '29', priceCurrency: 'USD', description: 'Unlimited covers' },
    { '@type': 'Offer', name: 'Agency', price: '79', priceCurrency: 'USD', description: 'Unlimited + white-label' },
  ],
  featureList: [
    'Amazon KDP full-wrap cover generation',
    'Spine width calculator',
    '300 DPI print-ready PDF export',
    'Front cover, back cover, spine separate exports',
    'AI description writer',
    'All KDP trim sizes',
  ],
}

const hasClerkKey = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || ''

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const content = (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Google Analytics — inline in <head> so it fires before page renders */}
        {GA_ID && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA_ID}',{send_page_view:true});`,
              }}
            />
          </>
        )}
      </head>
      <body className={`${inter.className} bg-gray-950 text-white antialiased min-h-screen`}>
        <Suspense fallback={null}>
          <ReferralCapture />
        </Suspense>
        {hasClerkKey && (
          <Suspense fallback={null}>
            <SignupPopup />
          </Suspense>
        )}
        {children}
        <SupportChatBot />
      </body>
    </html>
  )

  if (!hasClerkKey) return content
  return <ClerkProvider>{content}</ClerkProvider>
}
