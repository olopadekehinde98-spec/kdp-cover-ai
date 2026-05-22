import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const ip =
    req.headers.get('x-client-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    '127.0.0.1'

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // Update user's IP and lastSeenAt
  await prisma.user.update({
    where: { id: user.id },
    data: { ipAddress: ip, lastSeenAt: new Date() },
  })

  // Check for other users with same IP
  const otherUsersWithSameIp = await prisma.user.findMany({
    where: { ipAddress: ip, id: { not: user.id } },
    select: { id: true, email: true, plan: true, generationsUsed: true },
  })

  if (otherUsersWithSameIp.length === 0) {
    return NextResponse.json({ flagged: false, banned: false })
  }

  const allUsers = [user, ...otherUsersWithSameIp]
  const allEmails = allUsers.map(u => u.email)
  const allIds = allUsers.map(u => u.id)

  // Fraud detection: 2+ different users on FREE plan with < 5 covers each = farming
  const freeUsersWithFewCovers = await prisma.user.findMany({
    where: {
      id: { in: allIds },
      plan: 'FREE',
    },
    include: {
      _count: { select: { covers: true } },
    },
  })

  const farmingUsers = freeUsersWithFewCovers.filter(u => u._count.covers < 5)
  const isFraud = farmingUsers.length >= 2

  // Upsert fraud log
  await prisma.ipFraudLog.upsert({
    where: { ipAddress: ip },
    create: {
      ipAddress: ip,
      userIds: allIds,
      emails: allEmails,
      isBanned: isFraud,
    },
    update: {
      userIds: allIds,
      emails: allEmails,
      isBanned: isFraud,
      updatedAt: new Date(),
    },
  })

  let banned = false
  if (isFraud) {
    // Ban all farming users
    await prisma.user.updateMany({
      where: { id: { in: farmingUsers.map(u => u.id) } },
      data: { isBanned: true },
    })
    banned = farmingUsers.some(u => u.id === user.id)
  }

  return NextResponse.json({ flagged: true, banned })
}
