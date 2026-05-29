import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'

/**
 * GET /api/admin/analytics
 * Fetches real GA4 data using the Google Analytics Data API v1 (REST).
 * Requires env vars:
 *   GA_PROPERTY_ID          — numeric property ID (e.g. "123456789")
 *   GA_SERVICE_ACCOUNT_EMAIL — service account email
 *   GA_SERVICE_ACCOUNT_KEY   — private key (base64 encoded or raw PEM)
 */

async function getGoogleAccessToken(): Promise<string | null> {
  const email = process.env.GA_SERVICE_ACCOUNT_EMAIL
  const rawKey = process.env.GA_SERVICE_ACCOUNT_KEY
  if (!email || !rawKey) return null

  try {
    // Decode base64 key if needed
    const pemKey = rawKey.startsWith('-----')
      ? rawKey.replace(/\\n/g, '\n')
      : Buffer.from(rawKey, 'base64').toString('utf8').replace(/\\n/g, '\n')

    const now = Math.floor(Date.now() / 1000)
    const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url')
    const payload = Buffer.from(JSON.stringify({
      iss: email,
      scope: 'https://www.googleapis.com/auth/analytics.readonly',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now,
    })).toString('base64url')

    // Import the private key
    const keyData = pemKey
      .replace('-----BEGIN PRIVATE KEY-----', '')
      .replace('-----END PRIVATE KEY-----', '')
      .replace(/\s/g, '')

    const binaryKey = Buffer.from(keyData, 'base64')
    const cryptoKey = await crypto.subtle.importKey(
      'pkcs8',
      binaryKey,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['sign'],
    )

    const sigInput = `${header}.${payload}`
    const sig = await crypto.subtle.sign(
      'RSASSA-PKCS1-v1_5',
      cryptoKey,
      Buffer.from(sigInput),
    )
    const sigB64 = Buffer.from(sig).toString('base64url')
    const jwt = `${sigInput}.${sigB64}`

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
    })
    const tokenData = await tokenRes.json()
    return tokenData.access_token ?? null
  } catch (err) {
    console.error('GA token error:', err)
    return null
  }
}

async function runReport(token: string, propertyId: string, body: object) {
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    },
  )
  if (!res.ok) return null
  return res.json()
}

async function runRealtimeReport(token: string, propertyId: string, body: object) {
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runRealtimeReport`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    },
  )
  if (!res.ok) return null
  return res.json()
}

function rows(data: any): Array<{ dims: string[]; vals: string[] }> {
  if (!data?.rows) return []
  return data.rows.map((r: any) => ({
    dims: r.dimensionValues?.map((d: any) => d.value) ?? [],
    vals: r.metricValues?.map((m: any) => m.value) ?? [],
  }))
}

async function getDbStats() {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const monthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [
    totalUsers, todaySignups, weekSignups, monthSignups,
    planCounts, dailySignups, paidUsers, visitorCountries,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.user.count({ where: { createdAt: { gte: weekStart } } }),
    prisma.user.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.user.groupBy({ by: ['plan'], _count: { _all: true } }),
    prisma.$queryRaw<Array<{ day: string; count: bigint }>>`
      SELECT DATE("createdAt") as day, COUNT(*) as count
      FROM "User"
      WHERE "createdAt" >= NOW() - INTERVAL '14 days'
      GROUP BY DATE("createdAt")
      ORDER BY day ASC
    `,
    prisma.user.count({ where: { subscriptionStatus: 'active' } }),
    prisma.visitorLog.groupBy({
      by: ['country'],
      _count: { _all: true },
      orderBy: { _count: { country: 'desc' } },
      take: 10,
      where: { country: { not: null } },
    }),
  ])

  const planMap: Record<string, number> = {}
  for (const p of planCounts) planMap[p.plan] = p._count._all

  return {
    totalUsers,
    todaySignups,
    weekSignups,
    monthSignups,
    plans: planMap,
    paidUsers,
    conversionRate: totalUsers > 0 ? ((paidUsers / totalUsers) * 100).toFixed(1) : '0',
    dailySignups: dailySignups.map(d => ({ date: String(d.day).slice(0, 10), count: Number(d.count) })),
    visitorCountries: visitorCountries.map(v => ({ country: v.country ?? 'Unknown', count: v._count._all })),
  }
}

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { plan: true, email: true },
  })
  const ownerEmail = process.env.OWNER_EMAIL
  if (!user || user.email !== ownerEmail) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Always return DB stats even if GA4 not configured
  const dbStats = await getDbStats()

  const propertyId = process.env.GA_PROPERTY_ID
  if (!propertyId) {
    return NextResponse.json({ setup_needed: true, dbStats })
  }

  const token = await getGoogleAccessToken()
  if (!token) {
    return NextResponse.json({ setup_needed: true, dbStats })
  }

  // Run all reports in parallel
  const [
    overviewData,
    realtimeData,
    pagesData,
    sourcesData,
    countriesData,
    devicesData,
    dailyData,
  ] = await Promise.all([
    // 30-day overview: users, sessions, bounce rate, avg session duration
    runReport(token, propertyId, {
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'bounceRate' },
        { name: 'averageSessionDuration' },
        { name: 'screenPageViews' },
        { name: 'newUsers' },
      ],
    }),
    // Real-time active users
    runRealtimeReport(token, propertyId, {
      metrics: [{ name: 'activeUsers' }],
    }),
    // Top pages
    runReport(token, propertyId, {
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'pagePath' }],
      metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: 10,
    }),
    // Traffic sources
    runReport(token, propertyId, {
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'sessionDefaultChannelGroup' }],
      metrics: [{ name: 'sessions' }, { name: 'activeUsers' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    }),
    // Countries
    runReport(token, propertyId, {
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'country' }],
      metrics: [{ name: 'activeUsers' }],
      orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
      limit: 10,
    }),
    // Devices
    runReport(token, propertyId, {
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'deviceCategory' }],
      metrics: [{ name: 'sessions' }],
    }),
    // Daily users last 14 days
    runReport(token, propertyId, {
      dateRanges: [{ startDate: '14daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'date' }],
      metrics: [{ name: 'activeUsers' }, { name: 'sessions' }],
      orderBys: [{ dimension: { dimensionName: 'date' }, desc: false }],
    }),
  ])

  const overview = overviewData?.rows?.[0]?.metricValues ?? []

  return NextResponse.json({
    dbStats,
    realtime: {
      activeUsers: realtimeData?.rows?.[0]?.metricValues?.[0]?.value ?? '0',
    },
    overview: {
      users: overview[0]?.value ?? '0',
      sessions: overview[1]?.value ?? '0',
      bounceRate: overview[2]?.value ? `${(parseFloat(overview[2].value) * 100).toFixed(1)}%` : '—',
      avgDuration: overview[3]?.value
        ? `${Math.floor(parseFloat(overview[3].value) / 60)}m ${Math.round(parseFloat(overview[3].value) % 60)}s`
        : '—',
      pageViews: overview[4]?.value ?? '0',
      newUsers: overview[5]?.value ?? '0',
    },
    topPages: rows(pagesData).map(r => ({ path: r.dims[0], views: r.vals[0], users: r.vals[1] })),
    sources: rows(sourcesData).map(r => ({ channel: r.dims[0], sessions: r.vals[0], users: r.vals[1] })),
    countries: rows(countriesData).map(r => ({ country: r.dims[0], users: r.vals[0] })),
    devices: rows(devicesData).map(r => ({ device: r.dims[0], sessions: r.vals[0] })),
    daily: rows(dailyData).map(r => ({
      date: `${r.dims[0].slice(0,4)}-${r.dims[0].slice(4,6)}-${r.dims[0].slice(6,8)}`,
      users: r.vals[0],
      sessions: r.vals[1],
    })),
  })
}
