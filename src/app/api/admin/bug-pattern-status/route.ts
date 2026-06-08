import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'

export const maxDuration = 30

const schema = z.object({
  fingerprint: z.string().min(8).max(100),
  route:       z.string().min(1).max(200),
  resolved:    z.boolean(),
  note:        z.string().max(500).optional(),
})

/** Mark a recurring error pattern as fixed/unfixed (admin verdict).
 *  Persists by fingerprint so the bug detector can flag regressions
 *  if a "fixed" pattern starts reoccurring. */
export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const adminUser = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!adminUser?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body   = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const { fingerprint, route, resolved, note } = parsed.data

  const status = await prisma.bugPatternStatus.upsert({
    where:  { fingerprint },
    create: { fingerprint, route, resolved, note, resolvedAt: resolved ? new Date() : null },
    update: { resolved, note, resolvedAt: resolved ? new Date() : null },
  })

  return NextResponse.json({ ok: true, status })
}
