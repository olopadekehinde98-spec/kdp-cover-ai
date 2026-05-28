import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

// Handles both newsletter subscribers AND signed-in users via GET link in emails
export async function GET(req: NextRequest) {
  const token  = req.nextUrl.searchParams.get('token')
  const userId = req.nextUrl.searchParams.get('uid')

  if (token) {
    // NewsletterSubscriber unsubscribe
    await prisma.newsletterSubscriber.deleteMany({ where: { token } }).catch(() => {})
  }

  if (userId) {
    // Signed-in user opted out of newsletter
    await prisma.user.updateMany({
      where: { id: userId },
      data: { newsletterOptIn: false },
    }).catch(() => {})
  }

  return NextResponse.redirect(new URL('/?unsubscribed=1', req.url))
}
