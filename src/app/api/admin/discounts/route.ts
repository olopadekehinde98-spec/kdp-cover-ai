import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'

async function requireOwner() {
  const { userId } = await auth()
  if (!userId) return null
  const user = await prisma.user.findUnique({ where: { clerkId: userId }, select: { email: true } })
  if (user?.email !== process.env.OWNER_EMAIL) return null
  return user
}

export async function GET() {
  if (!await requireOwner()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const codes = await prisma.discountCode.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { redemptions: true } } },
  })
  return NextResponse.json(codes)
}

export async function POST(req: NextRequest) {
  if (!await requireOwner()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { code, description, discountPct, maxUses, planRestriction, expiresAt } = body

  if (!code || !discountPct) return NextResponse.json({ error: 'code and discountPct required' }, { status: 400 })

  const dc = await prisma.discountCode.create({
    data: {
      code: String(code).toUpperCase().trim(),
      description: description || null,
      discountPct: Number(discountPct),
      maxUses: maxUses ? Number(maxUses) : null,
      planRestriction: planRestriction || null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
  })
  return NextResponse.json(dc)
}

export async function DELETE(req: NextRequest) {
  if (!await requireOwner()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await req.json()
  await prisma.discountCode.update({ where: { id }, data: { isActive: false } })
  return NextResponse.json({ ok: true })
}
