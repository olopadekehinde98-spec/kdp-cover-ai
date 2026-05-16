import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest, NextFetchEvent } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/pricing',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
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
  // No Clerk keys configured → let everything through
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || !clerkHandler) {
    return NextResponse.next()
  }

  try {
    return await clerkHandler(req, event)
  } catch {
    // Clerk crashed on this request (e.g. misconfigured key) → don't 500 the whole site
    return NextResponse.next()
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
