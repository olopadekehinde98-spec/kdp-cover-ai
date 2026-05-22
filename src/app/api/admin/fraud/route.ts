import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'

async function requireAdmin(clerkId: string) {
  const user = await prisma.user.findUnique({ where: { clerkId } })
  if (!user?.isAdmin) return null
  return user
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const admin = await requireAdmin(userId)
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { logId, action, userIds } = body

  if (!logId || !action) {
    return NextResponse.json({ error: 'logId and action required' }, { status: 400 })
  }

  const isBan = action === 'ban'

  await prisma.ipFraudLog.update({
    where: { id: logId },
    data: { isBanned: isBan },
  })

  if (userIds?.length) {
    await prisma.user.updateMany({
      where: { id: { in: userIds } },
      data: { isBanned: isBan },
    })
  }

  return NextResponse.json({ success: true })
}
