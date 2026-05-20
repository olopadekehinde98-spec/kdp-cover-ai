import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'
import { createCheckoutUrl, type PlanKey } from '@/lib/flutterwave/client'
import { currentUser } from '@clerk/nextjs/server'

const schema = z.object({
  plan: z.enum(['STARTER', 'PRO', 'AGENCY']),
})

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

  const [user, clerkUser] = await Promise.all([
    prisma.user.findUnique({ where: { clerkId: userId } }),
    currentUser(),
  ])
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const userName = clerkUser?.fullName ?? clerkUser?.firstName ?? user.email

  try {
    const url = await createCheckoutUrl(parsed.data.plan as PlanKey, user.email, user.id, userName)
    return NextResponse.json({ url })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('Checkout error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
