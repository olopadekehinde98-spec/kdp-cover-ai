import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) {
    return new NextResponse('Invalid link', { status: 400 })
  }

  const sub = await prisma.newsletterSubscriber.findUnique({ where: { token } })
  if (!sub) {
    return new NextResponse('Link expired or invalid', { status: 404 })
  }

  if (!sub.confirmed) {
    await prisma.newsletterSubscriber.update({
      where: { token },
      data: { confirmed: true },
    })
  }

  // Redirect to homepage with a success message
  return NextResponse.redirect(new URL('/?subscribed=1', req.url))
}
