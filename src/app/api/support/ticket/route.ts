import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  const body = await req.json()
  const { email, subject, message, messages: chatMessages } = body

  const user = userId ? await prisma.user.findUnique({ where: { clerkId: userId } }) : null
  const ticketEmail = email || user?.email || 'unknown@unknown.com'

  if (!subject || !message) {
    return NextResponse.json({ error: 'subject and message required' }, { status: 400 })
  }

  const messagesToCreate = Array.isArray(chatMessages) && chatMessages.length > 0
    ? chatMessages.map((m: { role: string; content: string }) => ({
        sender: m.role === 'assistant' ? 'ai' : 'user',
        content: m.content,
      }))
    : [{ sender: 'user', content: message }]

  const ticket = await prisma.supportTicket.create({
    data: {
      userId: user?.id || null,
      email: ticketEmail,
      subject,
      message,
      status: 'OPEN',
      messages: { create: messagesToCreate },
    },
    include: { messages: true },
  })

  return NextResponse.json({ ticket })
}

export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const tickets = await prisma.supportTicket.findMany({
    where: { userId: user.id },
    include: { messages: { orderBy: { createdAt: 'asc' } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ tickets })
}
