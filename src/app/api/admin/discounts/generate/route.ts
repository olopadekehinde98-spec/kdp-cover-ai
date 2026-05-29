import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId }, select: { email: true } })
  if (user?.email !== process.env.OWNER_EMAIL) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { context, discountPct, expiresInHours } = await req.json()

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{
      role: 'user',
      content: `Generate a short, catchy discount code (5-10 chars, uppercase, no spaces) for a KDP book cover AI tool.
Context: ${context || 'general promotion'}
Discount: ${discountPct}% off
Rules: memorable, relevant to books/writing/publishing, no special chars. Return ONLY the code, nothing else.`,
    }],
    max_tokens: 20,
    temperature: 0.9,
  })

  const code = completion.choices[0]?.message?.content?.trim().replace(/[^A-Z0-9]/g, '') ?? 'KDPSAVE'

  const expiresAt = expiresInHours
    ? new Date(Date.now() + Number(expiresInHours) * 60 * 60 * 1000)
    : null

  const dc = await prisma.discountCode.create({
    data: {
      code,
      description: `AI-generated: ${context || 'promotion'} — ${discountPct}% off`,
      discountPct: Number(discountPct),
      expiresAt,
    },
  })

  return NextResponse.json(dc)
}
