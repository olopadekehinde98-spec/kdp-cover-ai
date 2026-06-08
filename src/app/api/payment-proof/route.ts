import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

const PLAN_LIMITS: Record<string, number> = {
  STARTER: 20,
  PRO: 999999,
  AGENCY: 999999,
  FREE:    5,
}

/** Detect which plan the user is paying for based on amount + currency */
function detectPlan(amount: number, currency: string): string {
  if (currency === 'USD') {
    if (amount >= 70) return 'AGENCY'   // $79 plan
    if (amount >= 25) return 'PRO'       // $29 plan
    if (amount >= 8)  return 'STARTER'   // $9 plan
  } else {
    // NGN — approximate at ₦1,550/USD with 10% tolerance
    if (amount >= 100000) return 'AGENCY'
    if (amount >= 38000)  return 'PRO'
    if (amount >= 10000)  return 'STARTER'
  }
  return 'FREE'
}

export async function POST(req: Request) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { amount, currency, bankUsed, receiptBase64, receiptMime, note } = await req.json()

  if (!amount || !currency || !bankUsed || !receiptBase64 || !receiptMime) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (!['USD', 'NGN'].includes(currency)) {
    return NextResponse.json({ error: 'Currency must be USD or NGN' }, { status: 400 })
  }

  // Check receipt size (max ~4MB base64)
  if (receiptBase64.length > 5_500_000) {
    return NextResponse.json({ error: 'Receipt image too large. Please compress it.' }, { status: 400 })
  }

  const detectedPlan = detectPlan(Number(amount), currency)

  const submission = await prisma.paymentSubmission.create({
    data: {
      userId: user.id,
      amount: Number(amount),
      currency,
      bankUsed,
      receiptBase64,
      receiptMime,
      note: note || null,
      detectedPlan,
      status: 'PENDING',
    },
  })

  return NextResponse.json({
    success: true,
    submissionId: submission.id,
    detectedPlan,
    message: `Payment proof submitted! We detected this as a ${detectedPlan} plan payment. Your account will be upgraded after review.`,
  })
}
