import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '12'), 50)
  const skip = (page - 1) * limit

  const [covers, total] = await prisma.$transaction([
    prisma.cover.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        title: true,
        subtitle: true,
        authorName: true,
        genre: true,
        imageUrl: true,
        previewUrl: true,
        status: true,
        trimSize: true,
        pageCount: true,
        createdAt: true,
        exports: { select: { format: true, url: true } },
      },
    }),
    prisma.cover.count({ where: { userId: user.id } }),
  ])

  return NextResponse.json({
    covers,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  })
}
