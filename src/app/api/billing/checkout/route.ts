import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'
import { type PlanKey as PaddlePlanKey } from '@/lib/paddle/client'

const schema = z.object({
  plan: z.enum(['STARTER', 'PRO', 'AGENCY']),
  provider: z.enum(['paddle', 'flutterwave', 'paystack']).optional(),
  currency: z.enum(['USD', 'NGN']).optional(),
})

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { plan, provider = 'paystack', currency = 'NGN' } = parsed.data

  try {
    if (provider === 'paystack') {
      const { createCheckoutUrl } = await import('@/lib/paystack/client')
      const url = await createCheckoutUrl(plan, user.email, user.id)
      return NextResponse.json({ url })
    } else if (provider === 'flutterwave') {
      const { createCheckoutUrl } = await import('@/lib/flutterwave/client')
      const url = await createCheckoutUrl(plan, user.email, user.id, user.name ?? user.email, currency)
      return NextResponse.json({ url })
    } else {
      const { createCheckoutUrl } = await import('@/lib/paddle/client')
      const url = await createCheckoutUrl(plan as PaddlePlanKey, user.email, user.id)
      return NextResponse.json({ url })
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('Checkout error:', msg)
    return NextResponse.json({ error: msg, detail: msg }, { status: 500 })
  }
}
