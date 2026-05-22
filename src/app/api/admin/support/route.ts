import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'

async function requireAdmin(clerkId: string) {
  const user = await prisma.user.findUnique({ where: { clerkId } })
  if (!user?.isAdmin) return null
  return user
}

export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const admin = await requireAdmin(userId)
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  const tickets = await prisma.supportTicket.findMany({
    where: status ? { status: status as any } : undefined,
    include: {
      messages: { orderBy: { createdAt: 'asc' } },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Attach user info where available
  const ticketsWithUser = await Promise.all(
    tickets.map(async (ticket) => {
      if (!ticket.userId) return { ...ticket, userInfo: null }
      const userInfo = await prisma.user.findUnique({
        where: { id: ticket.userId },
        select: { email: true, name: true, plan: true },
      })
      return { ...ticket, userInfo }
    })
  )

  return NextResponse.json({ tickets: ticketsWithUser })
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const admin = await requireAdmin(userId)
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { ticketId, content, status } = body

  if (!ticketId) return NextResponse.json({ error: 'ticketId required' }, { status: 400 })

  let message = null
  if (content) {
    message = await prisma.supportMessage.create({
      data: { ticketId, sender: 'admin', content },
    })
  }

  const ticket = await prisma.supportTicket.update({
    where: { id: ticketId },
    data: {
      updatedAt: new Date(),
      ...(status ? { status: status as 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' } : {}),
    },
  })

  return NextResponse.json({ success: true, message, ticket })
}
