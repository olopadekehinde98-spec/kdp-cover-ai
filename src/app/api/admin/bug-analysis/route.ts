import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'

export const maxDuration = 60

interface PatternGroup {
  route: string
  sample: string
  count: number
  affectedUsers: number
  fixed: boolean
}

/** Normalize an error message into a "shape" so similar errors group together */
function shapeOf(msg: string): string {
  return msg
    .toLowerCase()
    .replace(/[0-9a-f]{8,}/g, '<id>')          // hex ids / hashes
    .replace(/\b\d+\b/g, '<n>')                 // numbers
    .replace(/https?:\/\/\S+/g, '<url>')        // urls
    .replace(/[a-z0-9]{20,}/g, '<token>')       // long tokens
    .slice(0, 140)
    .trim()
}

async function getOpenAISummary(groups: PatternGroup[]): Promise<string | null> {
  const apiKey = (process.env.OPENAI_API_KEY ?? '').replace(/^﻿/, '').trim()
  if (!apiKey || groups.length === 0) return null

  const top = groups.slice(0, 12).map(g =>
    `Route: ${g.route} | Occurrences: ${g.count} | Users affected: ${g.affectedUsers} | Fixed: ${g.fixed ? 'yes' : 'no'}\nSample error: "${g.sample}"`
  ).join('\n\n')

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a senior engineer triaging production error logs for a Next.js SaaS (KDP Cover AI). For each error pattern, give a one-line plain-English diagnosis of the likely root cause and a concrete one-line fix suggestion. Be specific and concise. Flag clearly if a pattern looks like a recurring/unfixed bug vs. a one-off. Output as a numbered list, one item per pattern, max 2 short lines each.',
          },
          {
            role: 'user',
            content: `Here are the top recurring error patterns from production logs over the last 30 days:\n\n${top}\n\nFor each, give: (1) likely root cause, (2) suggested fix, (3) whether it looks like an unresolved recurring bug.`,
          },
        ],
        temperature: 0.3,
        max_tokens: 900,
      }),
    })
    if (!res.ok) return null
    const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> }
    return data.choices?.[0]?.message?.content?.trim() ?? null
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const adminUser = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!adminUser?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const [errorLogs, failedCovers] = await Promise.all([
    prisma.errorLog.findMany({
      where: { createdAt: { gt: since } },
      select: { route: true, message: true, userId: true, resolved: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 500,
    }),
    prisma.cover.findMany({
      where: { status: 'FAILED', createdAt: { gt: since }, errorMessage: { not: null } },
      select: { errorMessage: true, userId: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 500,
    }),
  ])

  // Merge into a single shape: { route, message, userId }
  type Item = { route: string; message: string; userId: string | null }
  const items: Item[] = [
    ...errorLogs.map(e => ({ route: e.route, message: e.message, userId: e.userId })),
    ...failedCovers.map(c => ({ route: '/api/generate (cover)', message: c.errorMessage ?? '', userId: c.userId })),
  ].filter(i => i.message)

  // Group by route + normalized shape
  const groupMap = new Map<string, { route: string; sample: string; count: number; users: Set<string>; resolvedCount: number; total: number }>()

  for (const item of items) {
    const key = `${item.route}::${shapeOf(item.message)}`
    const existing = groupMap.get(key)
    if (existing) {
      existing.count++
      existing.total++
      if (item.userId) existing.users.add(item.userId)
    } else {
      groupMap.set(key, {
        route: item.route,
        sample: item.message.slice(0, 300),
        count: 1,
        total: 1,
        users: new Set(item.userId ? [item.userId] : []),
        resolvedCount: 0,
      })
    }
  }

  const groups: PatternGroup[] = [...groupMap.values()]
    .map(g => ({
      route: g.route,
      sample: g.sample,
      count: g.count,
      affectedUsers: g.users.size,
      fixed: false, // unknown — surfaced for admin to mark via /admin/bug-detector if desired
    }))
    .sort((a, b) => b.count - a.count)

  const aiSummary = await getOpenAISummary(groups)

  return NextResponse.json({
    windowDays: 30,
    totalErrorEvents: items.length,
    uniquePatterns: groups.length,
    topPatterns: groups.slice(0, 20),
    aiSummary,
    aiAvailable: !!process.env.OPENAI_API_KEY,
  })
}
