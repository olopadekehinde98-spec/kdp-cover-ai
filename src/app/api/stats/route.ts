import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

// Public stats endpoint — no auth required
export async function GET() {
  try {
    const [totalCovers, totalUsers] = await Promise.all([
      prisma.cover.count({ where: { status: 'COMPLETED' } }),
      prisma.user.count(),
    ])
    return NextResponse.json({ totalCovers, totalUsers })
  } catch {
    return NextResponse.json({ totalCovers: 0, totalUsers: 0 })
  }
}
