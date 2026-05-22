import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'
import OpenAI from 'openai'

const SYSTEM_PROMPT = `You are KDP Cover AI's friendly support assistant. Help users with book cover generation, KDP dimensions, spine width, plan features, and billing. If you cannot solve the issue, tell them to type 'create ticket' to escalate to a human. Keep answers under 100 words.`

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { messages, createTicket, email: bodyEmail, subject } = body

  const { userId } = await auth()
  const user = userId
    ? await prisma.user.findUnique({ where: { clerkId: userId } })
    : null

  // Create ticket flow
  if (createTicket) {
    const ticketEmail = bodyEmail || user?.email || 'unknown@unknown.com'
    const ticketSubject = subject || 'Support request from chat'
    const firstMessage = Array.isArray(messages) && messages.length > 0
      ? messages[messages.length - 1]?.content || 'No message provided'
      : 'No message provided'

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: user?.id || null,
        email: ticketEmail,
        subject: ticketSubject,
        message: firstMessage,
        status: 'OPEN',
        messages: {
          create: {
            sender: 'user',
            content: firstMessage,
          },
        },
      },
    })

    return NextResponse.json({ ticketId: ticket.id, success: true })
  }

  // AI chat flow
  if (!messages || !Array.isArray(messages)) {
    return NextResponse.json({ error: 'messages array required' }, { status: 400 })
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.map((m: { role: string; content: string }) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      ],
      max_tokens: 200,
    })

    const reply = completion.choices[0]?.message?.content || 'I could not generate a response.'
    return NextResponse.json({ reply })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: `AI error: ${msg}` }, { status: 500 })
  }
}
