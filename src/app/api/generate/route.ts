import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'
import { generateCoverImage } from '@/lib/ai-engine/generator'
import { checkRateLimit } from '@/lib/rate-limit'

export const maxDuration = 60
import { calculateKDPDimensions } from '@/lib/kdp-engine/calculator'
import { buildTypographyLayout } from '@/lib/typography-engine/renderer'
import { buildBackCoverLayout, generateBookDescription } from '@/lib/back-cover-engine'
import type { KDPInput } from '@/lib/kdp-engine/types'
import type { GenerationInput } from '@/lib/ai-engine/types'

const schema = z.object({
  title: z.string().min(1).max(200),
  subtitle: z.string().max(200).optional(),
  authorName: z.string().min(1).max(200),
  genre: z.enum(['thriller','romance','fantasy','sci-fi','mystery','horror','business','self-help','memoir','christian','children','literary-fiction','young-adult','historical-fiction','biography']),
  prompt: z.string().min(5).max(1000),
  description: z.string().max(2000).optional(),
  authorBio: z.string().max(500).optional(),
  reviewQuote: z.string().max(300).optional(),
  reviewAttribution: z.string().max(100).optional(),
  trimSize: z.string(),
  pageCount: z.number().int().min(24).max(828),
  paperType: z.enum(['black_and_white', 'color', 'premium_color']),
  coverType: z.enum(['paperback', 'hardcover']),
  spineWidthOverride: z.number().min(0.06).max(3).optional(),
})

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Fetch user and check limits
  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  if (user.isBanned) return NextResponse.json({ error: 'Account suspended' }, { status: 403 })

  // Rate limit: max 10 generations per hour per user
  const rl = await checkRateLimit(`gen:${user.id}`, 10, 60 * 60 * 1000)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Too many requests. Try again in ${rl.retryAfter}s.` },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } },
    )
  }

  if (user.generationsUsed >= user.generationsLimit) {
    return NextResponse.json({
      error: 'Generation limit reached',
      limit: user.generationsLimit,
      used: user.generationsUsed,
      upgradeUrl: '/pricing',
    }, { status: 429 })
  }

  // ── Security: per-user rate limit (max 5 generates per 10 minutes) ──────────
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000)
  const recentCount = await prisma.cover.count({
    where: { userId: user.id, createdAt: { gt: tenMinutesAgo } },
  })
  if (recentCount >= 5) {
    return NextResponse.json({
      error: 'Too many requests. Please wait a few minutes before generating again.',
    }, { status: 429 })
  }

  // ── Security: flag suspicious accounts (same IP, multiple users) ────────────
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? req.headers.get('x-real-ip') ?? null
  if (ip) {
    const fraudLog = await prisma.ipFraudLog.findUnique({ where: { ipAddress: ip } })
    if (fraudLog?.isBanned) {
      return NextResponse.json({ error: 'Account suspended' }, { status: 403 })
    }
    // Track this IP + user pairing (runs in background, non-blocking)
    prisma.ipFraudLog.upsert({
      where: { ipAddress: ip },
      update: {
        userIds: { push: user.id },
        emails: { push: user.email },
        updatedAt: new Date(),
      },
      create: {
        ipAddress: ip,
        userIds: [user.id],
        emails: [user.email],
      },
    }).then(async (log) => {
      // Auto-flag IPs with 4+ different users generating (potential abuse farm)
      const uniqueUsers = [...new Set(log.userIds)]
      if (uniqueUsers.length >= 4 && !log.isBanned) {
        await prisma.ipFraudLog.update({
          where: { ipAddress: ip },
          data: { isBanned: false }, // flag for admin review but don't auto-ban
        })
        console.warn('[Fraud] High multi-account IP flagged for review:', ip, 'users:', uniqueUsers.length)
      }
    }).catch(() => {})
  }

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  }

  const data = parsed.data

  // Create cover record
  const cover = await prisma.cover.create({
    data: {
      userId: user.id,
      title: data.title,
      subtitle: data.subtitle,
      authorName: data.authorName,
      genre: data.genre,
      prompt: data.prompt,
      description: data.description,
      authorBio: data.authorBio,
      reviewQuote: data.reviewQuote,
      trimSize: data.trimSize,
      pageCount: data.pageCount,
      paperType: data.paperType,
      coverType: data.coverType,
      status: 'GENERATING',
    },
  })

  try {
    const kdpInput: KDPInput = {
      trimSize: data.trimSize as KDPInput['trimSize'],
      pageCount: data.pageCount,
      paperType: data.paperType,
      coverType: data.coverType,
    }
    const dims = calculateKDPDimensions(kdpInput, data.spineWidthOverride)

    const genInput: GenerationInput = {
      title: data.title,
      subtitle: data.subtitle,
      authorName: data.authorName,
      genre: data.genre,
      userPrompt: data.prompt,
    }

    // Generate AI image
    const imageResult = await generateCoverImage(genInput, 'full-wrap')

    // Auto-generate description if not provided (wrapped so it never crashes the whole generation)
    let description = data.description || ''
    if (!description) {
      try {
        description = await generateBookDescription(data.title, data.genre, data.prompt)
      } catch (e) {
        console.warn('Book description generation failed, using fallback:', e)
        description = `A compelling ${data.genre} book that will keep you turning pages.`
      }
    }

    // Build layouts
    const typography = buildTypographyLayout({
      title: data.title,
      subtitle: data.subtitle,
      authorName: data.authorName,
      genre: data.genre,
      dims,
    })

    const backCover = buildBackCoverLayout({
      description,
      authorBio: data.authorBio,
      genre: data.genre,
      dims,
    })

    // Download image and store as base64 so it never expires
    let storedImageUrl = imageResult.imageUrl
    try {
      // Step 1: get raw bytes
      let imgBytes: Buffer
      if (imageResult.imageUrl.startsWith('data:')) {
        imgBytes = Buffer.from(imageResult.imageUrl.split(',')[1], 'base64')
      } else {
        const imgRes = await fetch(imageResult.imageUrl, { redirect: 'follow' })
        if (!imgRes.ok) throw new Error(`Image fetch failed: ${imgRes.status}`)
        imgBytes = Buffer.from(await imgRes.arrayBuffer())
      }

      // Step 2: try sharp to ensure clean JPEG — if sharp fails, use raw bytes as-is
      // (Pollinations already returns valid JPEG so raw bytes are safe)
      let finalBytes = imgBytes
      try {
        const sharp = (await import('sharp')).default
        finalBytes = await sharp(imgBytes).jpeg({ quality: 92 }).toBuffer()
      } catch {
        // sharp unavailable on this platform — raw bytes are already JPEG from Pollinations
        finalBytes = imgBytes
      }

      storedImageUrl = `data:image/jpeg;base64,${finalBytes.toString('base64')}`
    } catch (e) {
      console.warn('Image store warning:', e)
    }

    // Update cover record
    await prisma.cover.update({
      where: { id: cover.id },
      data: {
        imageUrl: storedImageUrl,
        enhancedPrompt: imageResult.revisedPrompt,
        description,
        spineWidth: dims.spineWidth,
        totalWidthIn: dims.totalWidth,
        totalHeightIn: dims.totalHeight,
        status: 'COMPLETED',
        generationCostUsd: 0.00,
      },
    })

    // Increment usage
    await prisma.user.update({
      where: { id: user.id },
      data: { generationsUsed: { increment: 1 } },
    })

    return NextResponse.json({
      coverId: cover.id,
      imageUrl: storedImageUrl,
      dims,
      typography,
      backCover,
      description,
    })
  } catch (err) {
    await prisma.cover.update({
      where: { id: cover.id },
      data: { status: 'FAILED' },
    })
    const msg = err instanceof Error ? err.message : String(err)
    console.error('Generation error:', msg)
    return NextResponse.json({ error: `Generation failed: ${msg}` }, { status: 500 })
  }
}
