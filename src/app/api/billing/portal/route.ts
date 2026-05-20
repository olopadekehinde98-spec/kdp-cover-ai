import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'
import { getPortalUrl } from '@/lib/paddle/client'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  if (!user.paddleCustomerId) {
    return NextResponse.json({ error: 'No billing account found' }, { status: 404 })
  }

  try {
    const url = await getPortalUrl(user.paddleCustomerId)
    return NextResponse.json({ url })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('Portal error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
