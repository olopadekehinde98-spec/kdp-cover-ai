import { prisma } from '@/lib/db/prisma'

/**
 * Fire-and-forget error logger — never throws, never blocks the response.
 * Feeds the AI bug detector at /admin/bug-detector.
 */
export function logAppError(opts: {
  route: string
  message: string
  userId?: string | null
  email?: string | null
}) {
  prisma.errorLog.create({
    data: {
      route:   opts.route,
      message: opts.message.slice(0, 1000),
      userId:  opts.userId ?? undefined,
      email:   opts.email  ?? undefined,
    },
  }).catch(() => { /* never let logging break the request */ })
}
