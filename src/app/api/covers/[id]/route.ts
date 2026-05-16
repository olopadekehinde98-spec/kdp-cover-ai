import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // Only delete if it belongs to this user
  const cover = await prisma.cover.findFirst({ where: { id, userId: user.id } })
  if (!cover) return NextResponse.json({ error: 'Cover not found' }, { status: 404 })

  await prisma.cover.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
