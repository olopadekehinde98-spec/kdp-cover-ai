import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'
import OpenAI from 'openai'

const SYSTEM_PROMPT = `You are KDP Cover AI's friendly support assistant. Help users with book cover generation, KDP dimensions, spine width, plan features, and billing. If you cannot solve the issue, tell them to type 'create ticket' to escalate to a human. Keep answers under 100 words.`

/** Static fallback replies when OpenAI key is not configured */
function staticReply(lastMsg: string): string {
  const m = lastMsg.toLowerCase()
  if (m.includes('spine') || m.includes('width'))
    return 'Spine width formula — B&W: 0.002252 × pages, Color: 0.002500 × pages, Premium Color: 0.002347 × pages. Our generator calculates this automatically. Type "create ticket" if you need help.'
  if (m.includes('plan') || m.includes('price') || m.includes('cost') || m.includes('upgrade'))
    return 'Plans: Starter $9/mo (15 covers), Pro $29/mo (unlimited), Agency $79/mo (unlimited + priority). Visit /pricing. Type "create ticket" to talk to us.'
  if (m.includes('refund') || m.includes('cancel'))
    return 'Refunds are available within 7 days if you haven\'t used cover generation. See /refund for the full policy, or type "create ticket" to request one.'
  if (m.includes('download') || m.includes('export') || m.includes('pdf'))
    return 'After generating, click Export and choose PDF (for KDP upload), PNG, or JPEG. You can also download the front cover, back cover, and spine separately.'
  if (m.includes('affiliate') || m.includes('referral') || m.includes('earn'))
    return 'Affiliate program is free to join! Earn $3–$15 per referral. Go to /affiliate-dashboard for your referral link and earnings.'
  if (m.includes('generate') || m.includes('cover') || m.includes('create'))
    return 'Go to /generate, enter your book details (title, author, pages, paper type), describe the style you want, then click Generate. Your cover is ready in seconds!'
  return 'Thanks for reaching out! Type "create ticket" to open a support ticket and our team will get back to you within 24 hours.'
}

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

  const lastUserMsg = messages.filter((m: { role: string }) => m.role === 'user').at(-1)?.content ?? ''

  // No OpenAI key → return smart static reply
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ reply: staticReply(lastUserMsg) })
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

    const reply = completion.choices[0]?.message?.content || staticReply(lastUserMsg)
    return NextResponse.json({ reply })
  } catch (err) {
    console.error('Support chat error:', err instanceof Error ? err.message : err)
    return NextResponse.json({
      reply: 'I\'m having trouble right now. Type "create ticket" to reach our support team directly and we\'ll respond within 24 hours.',
    })
  }
}
