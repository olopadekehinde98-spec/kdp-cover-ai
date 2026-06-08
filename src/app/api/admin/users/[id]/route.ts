import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'

const PLAN_LIMITS: Record<string, number> = {
  FREE:    5,
  STARTER: 20,
  PRO:     999999,
  AGENCY:  999999,
}

async function requireAdmin() {
  const { userId } = await auth()
  if (!userId) return null
  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  return user?.isAdmin ? user : null
}

const patchSchema = z.object({
  action: z.enum(['ban', 'unban', 'setPlan', 'setLimit']),
  plan: z.enum(['FREE', 'STARTER', 'PRO', 'AGENCY']).optional(),
  limit: z.number().int().min(0).max(999999).optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const body = await req.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })

  const { action, plan, limit } = parsed.data

  let data: Record<string, unknown> = {}
  if (action === 'ban') data = { isBanned: true }
  if (action === 'unban') data = { isBanned: false }
  if (action === 'setPlan' && plan) data = { plan, generationsLimit: PLAN_LIMITS[plan] }
  if (action === 'setLimit' && limit !== undefined) data = { generationsLimit: limit }

  const updated = await prisma.user.update({ where: { id }, data })
  return NextResponse.json({ ok: true, user: updated })
}
