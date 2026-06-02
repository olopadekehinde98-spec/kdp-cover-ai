import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Public routes — no auth required
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/pricing(.*)',
  '/about(.*)',
  '/blog(.*)',
  '/help(.*)',
  '/support(.*)',
  '/terms(.*)',
  '/privacy(.*)',
  '/refund(.*)',
  '/affiliate(.*)',
  '/banned(.*)',
  '/rate(.*)',
  '/test(.*)',
  // Public API routes
  '/api/track(.*)',
  '/api/discount(.*)',
  '/api/review(.*)',
  '/api/referral(.*)',
  '/api/stats(.*)',
  '/api/newsletter(.*)',
  '/api/kdp(.*)',
  '/api/webhooks(.*)',
])

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
