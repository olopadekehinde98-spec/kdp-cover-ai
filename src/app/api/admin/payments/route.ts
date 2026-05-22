import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

async function requireAdmin(clerkId: string) {
  const user = await prisma.user.findUnique({ where: { clerkId } })
  if (!user?.isAdmin) return null
  return user
}

export async function GET() {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const admin = await requireAdmin(clerkId)
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const submissions = await prisma.paymentSubmission.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { email: true, name: true, plan: true } },
    },
  })

  return NextResponse.json({ submissions })
}
