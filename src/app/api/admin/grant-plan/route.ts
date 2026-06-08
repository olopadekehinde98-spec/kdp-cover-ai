import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

// One-time endpoint: POST /api/admin/grant-plan
// Body: { secret: "ADMIN_SECRET from .env.local", email: "...", plan: "PRO"|"AGENCY" }
// This updates the user's plan and generation limits in the DB.

const PLAN_LIMITS: Record<string, number> = {
  STARTER: 20,
  PRO:     999999,
  AGENCY:  999999,
  FREE:    5,
}

export async function POST(req: Request) {
  const { secret, email, plan } = await req.json()

  if (!process.env.ADMIN_SECRET || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!email || !plan || !PLAN_LIMITS[plan]) {
    return NextResponse.json({ error: 'Provide email and plan (FREE/STARTER/PRO/AGENCY)' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return NextResponse.json({ error: `No user found with email ${email}` }, { status: 404 })
  }

  await prisma.user.update({
    where: { email },
    data: {
      plan,
      generationsLimit: PLAN_LIMITS[plan],
      subscriptionStatus: plan === 'FREE' ? 'free' : 'active',
    },
  })

  return NextResponse.json({
    success: true,
    message: `${email} has been granted ${plan} plan with ${PLAN_LIMITS[plan] === 999999 ? 'unlimited' : PLAN_LIMITS[plan]} generations.`,
  })
}
