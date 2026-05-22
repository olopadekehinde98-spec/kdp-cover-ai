import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'

function generateCode(length = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // Check if already has affiliate profile
  const existing = await prisma.affiliateProfile.findUnique({ where: { userId: user.id } })
  if (existing) {
    return NextResponse.json({ success: true, referralCode: existing.referralCode, alreadyJoined: true })
  }

  // Generate unique referral code
  let referralCode = generateCode()
  let attempts = 0
  while (attempts < 10) {
    const conflict = await prisma.affiliateProfile.findUnique({ where: { referralCode } })
    if (!conflict) break
    referralCode = generateCode()
    attempts++
  }

  const profile = await prisma.affiliateProfile.create({
    data: {
      userId: user.id,
      referralCode,
      isActive: true,
    },
  })

  return NextResponse.json({ success: true, referralCode: profile.referralCode })
}
