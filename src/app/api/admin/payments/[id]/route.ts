import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

const PLAN_LIMITS: Record<string, number> = {
  STARTER: 20,
  PRO: 999999,
  AGENCY: 999999,
  FREE:    5,
}

async function requireAdmin(clerkId: string) {
  const user = await prisma.user.findUnique({ where: { clerkId } })
  if (!user?.isAdmin) return null
  return user
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const admin = await requireAdmin(clerkId)
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const { action, plan, adminNote } = await req.json()
  // action: 'approve' | 'reject'

  const submission = await prisma.paymentSubmission.findUnique({
    where: { id },
    include: { user: true },
  })
  if (!submission) return NextResponse.json({ error: 'Submission not found' }, { status: 404 })

  if (action === 'approve') {
    const planToGrant = plan || submission.detectedPlan
    const limit = PLAN_LIMITS[planToGrant] ?? 3

    await prisma.$transaction([
      prisma.paymentSubmission.update({
        where: { id },
        data: {
          status: 'APPROVED',
          planAssigned: planToGrant,
          adminNote: adminNote || null,
        },
      }),
      prisma.user.update({
        where: { id: submission.userId },
        data: {
          plan: planToGrant as any,
          generationsLimit: limit,
          subscriptionStatus: 'active',
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      message: `Approved. ${submission.user.email} upgraded to ${planToGrant}.`,
    })
  }

  if (action === 'reject') {
    await prisma.paymentSubmission.update({
      where: { id },
      data: { status: 'REJECTED', adminNote: adminNote || null },
    })
    return NextResponse.json({ success: true, message: 'Submission rejected.' })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
