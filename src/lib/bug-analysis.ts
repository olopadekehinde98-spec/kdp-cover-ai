import { prisma } from '@/lib/db/prisma'
import { shapeOf, fingerprintFor } from '@/lib/bug-fingerprint'

export interface PatternGroup {
  fingerprint: string
  route: string
  sample: string
  count: number
  affectedUsers: number
  fixed: boolean
  note: string | null
}

export interface BugAnalysisResult {
  windowDays: number
  totalErrorEvents: number
  uniquePatterns: number
  openCount: number
  topPatterns: PatternGroup[]
  aiSummary: string | null
  aiAvailable: boolean
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
            content: 'You are a senior engineer triaging production error logs for a Next.js SaaS (KDP Cover AI). For each error pattern, give a one-line plain-English diagnosis of the likely root cause and a concrete one-line fix suggestion. Be specific and concise. The "Fixed" field is the admin\'s own verdict from a previous review — if a pattern is marked "Fixed: yes" but still has recent occurrences, call that out explicitly as a likely REGRESSION that needs re-investigation. If marked "Fixed: no" and recurring, call it an unresolved recurring bug. Output as a numbered list, one item per pattern, max 2 short lines each.',
          },
          {
            role: 'user',
            content: `Here are the top recurring error patterns from production logs over the last 30 days:\n\n${top}\n\nFor each, give: (1) likely root cause, (2) suggested fix, (3) whether it's an unresolved recurring bug or — if marked Fixed but still occurring — a possible regression.`,
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

/** Scans the last 30 days of ErrorLog entries + failed Cover generations,
 *  groups them into recurring patterns, attaches persisted "fixed" verdicts,
 *  and (if OPENAI_API_KEY is set) asks AI to diagnose root causes. */
export async function runBugAnalysis(opts?: { withAi?: boolean }): Promise<BugAnalysisResult> {
  const withAi = opts?.withAi ?? true
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

  type Item = { route: string; message: string; userId: string | null }
  const items: Item[] = [
    ...errorLogs.map(e => ({ route: e.route, message: e.message, userId: e.userId })),
    ...failedCovers.map(c => ({ route: '/api/generate (cover)', message: c.errorMessage ?? '', userId: c.userId })),
  ].filter(i => i.message)

  const groupMap = new Map<string, { route: string; sample: string; count: number; users: Set<string> }>()

  for (const item of items) {
    const key = `${item.route}::${shapeOf(item.message)}`
    const existing = groupMap.get(key)
    if (existing) {
      existing.count++
      if (item.userId) existing.users.add(item.userId)
    } else {
      groupMap.set(key, {
        route: item.route,
        sample: item.message.slice(0, 300),
        count: 1,
        users: new Set(item.userId ? [item.userId] : []),
      })
    }
  }

  const rawGroups = [...groupMap.values()].sort((a, b) => b.count - a.count)

  const fingerprints = rawGroups.map(g => fingerprintFor(g.route, g.sample))
  const statuses = fingerprints.length
    ? await prisma.bugPatternStatus.findMany({ where: { fingerprint: { in: fingerprints } } })
    : []
  const statusMap = new Map(statuses.map(s => [s.fingerprint, s]))

  const groups: PatternGroup[] = rawGroups.map((g, i) => {
    const fingerprint = fingerprints[i]
    const status = statusMap.get(fingerprint)
    return {
      fingerprint,
      route: g.route,
      sample: g.sample,
      count: g.count,
      affectedUsers: g.users.size,
      fixed: status?.resolved ?? false,
      note: status?.note ?? null,
    }
  })

  const aiSummary = withAi ? await getOpenAISummary(groups) : null

  return {
    windowDays: 30,
    totalErrorEvents: items.length,
    uniquePatterns: groups.length,
    openCount: groups.filter(g => !g.fixed).length,
    topPatterns: groups.slice(0, 20),
    aiSummary,
    aiAvailable: !!process.env.OPENAI_API_KEY,
  }
}
