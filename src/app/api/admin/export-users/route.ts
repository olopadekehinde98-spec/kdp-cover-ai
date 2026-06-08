import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'

export const maxDuration = 60

function csvEscape(val: unknown): string {
  const s = val === null || val === undefined ? '' : String(val)
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const adminUser = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!adminUser?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const mode = req.nextUrl.searchParams.get('mode') ?? 'all' // 'all' | 'issues'

  const users = await prisma.user.findMany({
    select: {
      id: true, email: true, name: true, plan: true,
      generationsUsed: true, generationsLimit: true,
      subscriptionStatus: true, isBanned: true, createdAt: true, lastSeenAt: true,
      covers: {
        select: { id: true, status: true, errorMessage: true, createdAt: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const rows: string[] = []
  rows.push([
    'User ID', 'Email', 'Name', 'Plan', 'Status', 'Banned',
    'Generations Used', 'Generations Limit',
    'Total Covers', 'Failed Covers', 'Last Error Message', 'Last Failure Date',
    'Joined', 'Last Seen',
  ].map(csvEscape).join(','))

  for (const u of users) {
    const failed = u.covers.filter(c => c.status === 'FAILED')
    if (mode === 'issues' && failed.length === 0) continue

    const lastFailure = failed.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0]

    rows.push([
      u.id, u.email, u.name ?? '', u.plan, u.subscriptionStatus ?? '', u.isBanned ? 'YES' : 'no',
      u.generationsUsed, u.generationsLimit,
      u.covers.length, failed.length,
      lastFailure?.errorMessage ?? '', lastFailure ? lastFailure.createdAt.toISOString() : '',
      u.createdAt.toISOString(), u.lastSeenAt ? u.lastSeenAt.toISOString() : '',
    ].map(csvEscape).join(','))
  }

  const csv = rows.join('\n')
  const fileName = mode === 'issues' ? 'users-with-issues.csv' : 'all-users.csv'

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    },
  })
}
