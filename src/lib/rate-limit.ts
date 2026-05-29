import { prisma } from '@/lib/db/prisma'

export async function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
): Promise<{ allowed: boolean; remaining: number; retryAfter?: number }> {
  const now = Date.now()
  const windowEnd = new Date(Math.ceil(now / windowMs) * windowMs)

  try {
    // Clean up old windows periodically (1% chance per call)
    if (Math.random() < 0.01) {
      prisma.rateLimit.deleteMany({ where: { windowEnd: { lt: new Date() } } }).catch(() => {})
    }

    const result = await prisma.$executeRaw`
      INSERT INTO "RateLimit" (id, key, count, "windowEnd", "createdAt")
      VALUES (gen_random_uuid(), ${key}, 1, ${windowEnd}, NOW())
      ON CONFLICT (key, "windowEnd") DO UPDATE SET count = "RateLimit".count + 1
    `

    const record = await prisma.rateLimit.findUnique({
      where: { key_windowEnd: { key, windowEnd } },
      select: { count: true },
    })

    const count = record?.count ?? 1
    const allowed = count <= maxRequests
    const remaining = Math.max(0, maxRequests - count)
    const retryAfter = allowed ? undefined : Math.ceil((windowEnd.getTime() - now) / 1000)

    return { allowed, remaining, retryAfter }
  } catch {
    // Fail open — don't block requests if rate limit DB errors
    return { allowed: true, remaining: maxRequests }
  }
}
