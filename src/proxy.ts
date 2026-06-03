import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest, NextFetchEvent } from 'next/server'

function extractIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1'
  )
}

const isPublicRoute = createRouteMatcher([
  '/',
  '/pricing(.*)',
  '/about(.*)',
  '/affiliate(.*)',
  '/blog(.*)',
  '/help(.*)',
  '/support(.*)',
  '/refund(.*)',
  '/privacy(.*)',
  '/terms(.*)',
  '/banned(.*)',
  '/rate(.*)',
  '/rewards(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
  '/api/referral(.*)',
  '/api/stats(.*)',
  '/api/newsletter(.*)',
  '/api/track(.*)',
  '/api/discount(.*)',
  '/api/review(.*)',
  '/api/kdp(.*)',
  '/api/test-pipeline(.*)',
])

// Build the Clerk handler once at module load.
// Wrap in try-catch so a missing key never crashes the module itself.
let clerkHandler: ((req: NextRequest, event: NextFetchEvent) => Promise<Response>) | null = null
try {
  clerkHandler = clerkMiddleware(async (auth, req) => {
    if (!isPublicRoute(req)) {
      await auth.protect()
    }
  }) as (req: NextRequest, event: NextFetchEvent) => Promise<Response>
} catch {
  // Clerk keys not present — clerkHandler stays null, all requests pass through
}

// Named export (proxy) — Next.js 16 convention
export async function proxy(req: NextRequest, event: NextFetchEvent) {
  const ip = extractIp(req)
  const { pathname } = req.nextUrl

  // ── Smart redirects ────────────────────────────────────────────────────────
  // These are handled inside clerkHandler below via the isPublicRoute check,
  // but we also do homepage→dashboard and /rewards→sign-up here.
  // We read the session token from cookies to avoid an extra Clerk round-trip.
  const sessionToken =
    req.cookies.get('__session')?.value ||
    req.cookies.get('__client_uat')?.value ||
    req.headers.get('authorization')?.replace('Bearer ', '')
  const likelySignedIn = !!sessionToken

  if (likelySignedIn && pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }
  if (!likelySignedIn && pathname.startsWith('/rewards')) {
    return NextResponse.redirect(new URL('/sign-up?next=/rewards', req.url))
  }

  // No Clerk keys configured → let everything through
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || !clerkHandler) {
    const res = NextResponse.next()
    res.headers.set('x-client-ip', ip)
    return res
  }

  try {
    const res = await clerkHandler(req, event)
    if (res) {
      const newRes = new NextResponse(res.body, res)
      newRes.headers.set('x-client-ip', ip)
      return newRes
    }
    const fallback = NextResponse.next()
    fallback.headers.set('x-client-ip', ip)
    return fallback
  } catch {
    const res = NextResponse.next()
    res.headers.set('x-client-ip', ip)
    return res
  }
}

// Keep default export as well for backward compat
export default proxy

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
