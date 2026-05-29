import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      '0.0.0.0'

    const body = await req.json().catch(() => ({}))
    const { page, referrer, utmSource, utmMedium, utmCampaign } = body

    // Skip localhost / private IPs
    if (ip.startsWith('127.') || ip.startsWith('192.168.') || ip === '::1' || ip === '0.0.0.0') {
      return NextResponse.json({ ok: true })
    }

    // Get country from IP (free, no key needed, 45 req/min limit)
    let country: string | null = null
    let city: string | null = null
    let region: string | null = null
    try {
      const geo = await fetch(`http://ip-api.com/json/${ip}?fields=country,city,regionName,status`, {
        signal: AbortSignal.timeout(2000),
      })
      if (geo.ok) {
        const data = await geo.json()
        if (data.status === 'success') {
          country = data.country ?? null
          city = data.city ?? null
          region = data.regionName ?? null
        }
      }
    } catch {}

    await prisma.visitorLog.create({
      data: { country, city, region, referrer, utmSource, utmMedium, utmCampaign, page },
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true })
  }
}
